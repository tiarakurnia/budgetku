'use client';

import { useState, useEffect } from 'react';

function fmt(n) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(n);
}

function fmtShort(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'jt';
    return (n / 1000).toFixed(0) + 'rb';
}

export default function AnalyticsPage() {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeta = async () => {
            const res = await fetch('/api/months');
            const data = await res.json();
            setMonths(data);
            if (data.length > 0) {
                // Find latest month
                const latest = data.sort((a, b) => b.id - a.id)[0];
                setSelectedMonth(latest.id);
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        if (!selectedMonth) return;
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/analytics?monthId=${selectedMonth}`);
                const resData = await res.json();
                setData(resData);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [selectedMonth]);

    if (loading || !data) {
        return <div style={{ textAlign: 'center', padding: 100 }}>Menganalisis data keuangan Anda...</div>;
    }

    const { topCategories, weeklyData, monthlyComparison, stats } = data;
    const maxMonthly = Math.max(...monthlyComparison.flatMap(m => [m.income, m.expense]), 1);
    const maxWeekly = Math.max(...weeklyData.map(w => w.amount), 1);
    const currentMonthLabel = months.find(m => m.id === selectedMonth)?.name || 'Pilih Bulan';

    const catColors = [
        'var(--accent-orange)', 'var(--accent-yellow)', 'var(--accent-pink)',
        'var(--primary-300)', 'var(--accent-cyan)', 'var(--accent-green)'
    ];

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Analitik</h1>
                    <p className="page-subtitle">Insight keuangan — {currentMonthLabel}</p>
                </div>
                <select
                    className="form-input"
                    style={{ width: 'auto', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                    {months.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>
            <div className="page-body">
                {/* Quick Stats */}
                <div className="stat-grid" style={{ marginBottom: 28 }}>
                    <div className="stat-card teal animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Rata-rata Harian</span>
                            <div className="stat-card-icon teal">📊</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{fmt(Math.round(stats.dailyAvg))}</div>
                        <div className="stat-card-change positive">Bulan ini</div>
                    </div>
                    <div className="stat-card pink animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Tertinggi (Kategori)</span>
                            <div className="stat-card-icon pink">🔥</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{stats.topCategory}</div>
                        <div className="stat-card-change negative">{fmt(stats.topCategoryAmount)}</div>
                    </div>
                    <div className="stat-card purple animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Transaksi Bulan Ini</span>
                            <div className="stat-card-icon purple">📝</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{stats.transactionCount}</div>
                        <div className="stat-card-change">Jumlah Entri</div>
                    </div>
                    <div className="stat-card green animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Savings Rate</span>
                            <div className="stat-card-icon green">💎</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{stats.savingsRate.toFixed(1)}%</div>
                        <div className="stat-card-change positive">Tabungan</div>
                    </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 28 }}>
                    {/* Top Spending Categories */}
                    <div className="card animate-in">
                        <h3 className="section-title" style={{ marginBottom: 20 }}>Top Kategori Pengeluaran</h3>
                        <div className="h-bar-chart">
                            {topCategories.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada pengeluaran</p>
                            ) : topCategories.map((cat, i) => (
                                <div key={cat.name} className="h-bar-item">
                                    <div className="h-bar-header">
                                        <span className="h-bar-name">
                                            <span style={{ marginRight: 8 }}>{cat.emoji}</span>
                                            {cat.name}
                                        </span>
                                        <span className="h-bar-value">{fmt(cat.amount)}</span>
                                    </div>
                                    <div className="h-bar-track">
                                        <div className="h-bar-fill" style={{
                                            width: `${(cat.amount / topCategories[0].amount) * 100}%`,
                                            background: `linear-gradient(90deg, ${catColors[i % catColors.length]}, ${catColors[i % catColors.length]}88)`
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Spending */}
                    <div className="card animate-in">
                        <h3 className="section-title" style={{ marginBottom: 20 }}>Pengeluaran Mingguan</h3>
                        <div className="bar-chart" style={{ height: 200 }}>
                            {weeklyData.map((w, i) => {
                                const heightPct = (w.amount / maxWeekly) * 85;
                                const barColors = ['var(--accent-teal)', 'var(--accent-cyan)', 'var(--primary-300)', 'var(--accent-orange)'];
                                return (
                                    <div key={w.week} className="bar-chart-item" style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                            {fmtShort(w.amount)}
                                        </div>
                                        <div className="bar-chart-bar" style={{
                                            height: `${heightPct}%`,
                                            background: `linear-gradient(to top, ${barColors[i % 4]}, ${barColors[i % 4]}88)`,
                                            maxWidth: 60,
                                            width: '100%'
                                        }}></div>
                                        <span className="bar-chart-label" style={{ fontSize: 10 }}>
                                            {w.week.replace('Minggu ', 'W')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Monthly Comparison */}
                <div className="card animate-in">
                    <h3 className="section-title" style={{ marginBottom: 20 }}>Perbandingan Bulanan (Historis)</h3>
                    <div className="bar-chart" style={{ height: 220, padding: '10px 0' }}>
                        {monthlyComparison.map((m) => (
                            <div key={m.month} className="bar-chart-item" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%', justifyContent: 'center' }}>
                                    <div className="bar-chart-bar" title={`Income: ${fmt(m.income)}`} style={{
                                        height: `${(m.income / maxMonthly) * 85}%`,
                                        background: 'linear-gradient(to top, var(--accent-teal), var(--accent-cyan))',
                                        width: 22
                                    }}></div>
                                    <div className="bar-chart-bar" title={`Expense: ${fmt(m.expense)}`} style={{
                                        height: `${(m.expense / maxMonthly) * 85}%`,
                                        background: 'linear-gradient(to top, var(--accent-pink), var(--accent-orange))',
                                        width: 22
                                    }}></div>
                                </div>
                                <span className="bar-chart-label">{m.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend" style={{ justifyContent: 'center', marginTop: 8 }}>
                        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--accent-teal)' }}></div><span>Pemasukan</span></div>
                        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--accent-pink)' }}></div><span>Pengeluaran</span></div>
                    </div>

                    {/* Monthly comparison table */}
                    <div className="table-container" style={{ marginTop: 20 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Bulan</th>
                                    <th>Pemasukan</th>
                                    <th>Pengeluaran</th>
                                    <th>Selisih</th>
                                    <th>Savings Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyComparison.slice().reverse().map(m => {
                                    const diff = m.income - m.expense;
                                    const rate = m.income > 0 ? Math.round(diff / m.income * 100) : 0;
                                    return (
                                        <tr key={m.month}>
                                            <td style={{ fontWeight: 600 }}>{m.month}</td>
                                            <td style={{ color: 'var(--accent-teal)' }}>{fmt(m.income)}</td>
                                            <td style={{ color: 'var(--accent-pink)' }}>{fmt(m.expense)}</td>
                                            <td style={{ color: diff >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                                                {diff >= 0 ? '+' : ''}{fmt(diff)}
                                            </td>
                                            <td>
                                                <span className={`badge ${rate >= 20 ? 'badge-active' : rate >= 10 ? 'badge-warning' : 'badge-danger'}`}>
                                                    {rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
