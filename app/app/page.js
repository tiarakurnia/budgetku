'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Get current month
        const monthsRes = await fetch('/api/months');
        const months = await monthsRes.json();

        if (months && months.length > 0) {
          const activeMonth = months[0]; // Take the newest one
          setMonth(activeMonth);

          // 2. Get dashboard data for this month
          const dashRes = await fetch(`/api/dashboard?monthId=${activeMonth.id}`);
          const dashData = await dashRes.json();
          setData(dashData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner">Memuat data Keuangan...</div>
      </div>
    );
  }

  if (!month) {
    return (
      <div className="page-body">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2>Belum ada data bulan</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Silakan buat bulan anggaran pertama Anda di menu Month Management.</p>
          <Link href="/months" className="btn btn-primary">Kelola Bulan →</Link>
        </div>
      </div>
    );
  }

  const { totalBalance, income, expense, remainingBudget, usagePerc, recentTransactions, categoryUsage } = data || {};

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Ringkasan keuangan bulan {month.name}</p>
      </div>
      <div className="page-body">
        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card purple animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Total Saldo</span>
              <div className="stat-card-icon purple">💰</div>
            </div>
            <div className="stat-card-value">{formatIDR(totalBalance || 0)}</div>
            <div className="stat-card-change positive">Tersebar di semua akun</div>
          </div>
          <div className="stat-card teal animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Pemasukan</span>
              <div className="stat-card-icon teal">📥</div>
            </div>
            <div className="stat-card-value">{formatIDR(income || 0)}</div>
            <div className="stat-card-change positive">Bulan ini</div>
          </div>
          <div className="stat-card pink animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Pengeluaran</span>
              <div className="stat-card-icon pink">📤</div>
            </div>
            <div className="stat-card-value">{formatIDR(expense || 0)}</div>
            <div className="stat-card-change negative">Bulan ini</div>
          </div>
          <div className="stat-card green animate-in">
            <div className="stat-card-header">
              <span className="stat-card-label">Sisa Budget</span>
              <div className="stat-card-icon green">✅</div>
            </div>
            <div className="stat-card-value">{formatIDR(remainingBudget || 0)}</div>
            <div className="stat-card-change positive">{usagePerc?.toFixed(1)}% terpakai</div>
          </div>
        </div>

        {/* Budget Progress & Burn Rate */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div className="card animate-in">
            <div className="section-header">
              <h3 className="section-title">Budget Usage</h3>
              <span className={`badge ${usagePerc > 90 ? 'badge-closed' : 'badge-active'}`}>
                {usagePerc?.toFixed(1)}%
              </span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Terpakai: {formatIDR(expense || 0)}</span>
                <span style={{ color: 'var(--text-muted)' }}>Limit: {formatIDR(month.budgetLimit || 0)}</span>
              </div>
              <div className="progress-bar-container">
                <div className={`progress-bar-fill ${usagePerc > 90 ? 'pink' : 'purple'}`} style={{ width: `${Math.min(usagePerc || 0, 100)}%` }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categoryUsage?.slice(0, 4).map((item) => (
                <div key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.category.emoji} {item.category.name}</span>
                    <span style={{ color: item.percentage > 90 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                      {formatIDR(item.spent)} / {formatIDR(item.limit)}
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: 5 }}>
                    <div style={{
                      width: `${Math.min(item.percentage, 100)}%`, height: '100%',
                      background: item.percentage > 90 ? 'linear-gradient(90deg, var(--accent-red), var(--accent-orange))' : `linear-gradient(90deg, var(--primary-400), var(--primary-600))`,
                      borderRadius: 9999, transition: 'width 1s ease'
                    }}></div>
                  </div>
                </div>
              ))}
              {(!categoryUsage || categoryUsage.length === 0) && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Belum ada budget kategori diatur.</p>
              )}
            </div>
          </div>

          <div className="card animate-in">
            <div className="section-header">
              <h3 className="section-title">Status Cepat</h3>
              <span className="badge badge-warning">Aktif</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
              <div className="circle-progress" style={{ width: 150, height: 150 }}>
                <svg viewBox="0 0 100 100">
                  <circle className="circle-progress-bg" cx="50" cy="50" r="42" />
                  <circle
                    className="circle-progress-fill"
                    cx="50" cy="50" r="42"
                    stroke="url(#burnGrad)"
                    strokeDasharray={`${(usagePerc / 100) * 264} ${264}`}
                    strokeDashoffset="0"
                  />
                  <defs>
                    <linearGradient id="burnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--accent-orange)" />
                      <stop offset="100%" stopColor="var(--accent-yellow)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="circle-progress-text" style={{ fontSize: 24 }}>
                  {usagePerc?.toFixed(0)}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Penggunaan anggaran bulan <strong>{month.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid-2">
          {/* Expense Distribution */}
          <div className="card animate-in">
            <h3 className="section-title" style={{ marginBottom: 20 }}>Distribusi Pengeluaran</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <div className="donut-chart" style={{
                background: `conic-gradient(var(--primary-500) 0% 100%)`
              }}>
                <div className="donut-chart-inner">
                  <div className="donut-chart-value">{formatIDR(expense || 0)}</div>
                  <div className="donut-chart-label">Total Keluar</div>
                </div>
              </div>
              <div className="chart-legend" style={{ flexDirection: 'column', gap: 10 }}>
                {categoryUsage?.slice(0, 5).map((item, idx) => (
                  <div key={item.id} className="legend-item">
                    <div className="legend-dot" style={{ background: `hsl(${idx * 40}, 70%, 60%)` }}></div>
                    <span>{item.category.name}</span>
                    <span style={{ fontWeight: 600, marginLeft: 4 }}>{item.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Cashflow Legend Placeholder */}
          <div className="card animate-in">
            <h3 className="section-title" style={{ marginBottom: 20 }}>Ringkasan Akun</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Anda memiliki total <strong>{formatIDR(totalBalance || 0)}</strong> di semua akun keuangan Anda.
              </p>
              <Link href="/accounts" className="btn btn-secondary">Kelola Akun →</Link>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card animate-in" style={{ marginTop: 28 }}>
          <div className="section-header">
            <h3 className="section-title">Transaksi Terbaru</h3>
            <Link href="/transactions" className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>Lihat Semua →</Link>
          </div>
          <div className="transaction-list">
            {recentTransactions?.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-icon" style={{
                  background: tx.type === 'income' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                }}>
                  {tx.category.emoji}
                </div>
                <div className="transaction-info">
                  <div className="transaction-name">{tx.name}</div>
                  <div className="transaction-category">{tx.category.name} • {tx.account.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`transaction-amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                  </div>
                  <div className="transaction-date">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
            ))}
            {(!recentTransactions || recentTransactions.length === 0) && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Belum ada transaksi bulan ini.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
