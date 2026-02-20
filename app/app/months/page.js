'use client';

import { useState, useEffect } from 'react';

function fmt(n) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(n);
}

const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export default function MonthsPage() {
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: '2026-03',
        startBalance: 0,
        budgetLimit: 0
    });

    const fetchMonths = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/months');
            const data = await res.json();
            setMonths(data);
        } catch (error) {
            console.error('Error fetching months:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonths();
    }, []);

    const handleCreateMonth = async () => {
        try {
            const [year, monthVal] = formData.date.split('-');
            const payload = {
                name: getMonthName(formData.date),
                year: parseInt(year),
                month: parseInt(monthVal),
                startBalance: parseFloat(formData.startBalance),
                budgetLimit: parseFloat(formData.budgetLimit)
            };

            const res = await fetch('/api/months', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                fetchMonths();
            } else {
                const err = await res.json();
                alert(err.error || 'Gagal membuat bulan');
            }
        } catch (error) {
            console.error('Error creating month:', error);
        }
    };

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Kelola Bulan</h1>
                        <p className="page-subtitle">Manajemen periode keuangan bulanan</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ＋ Bulan Baru
                    </button>
                </div>
            </div>
            <div className="page-body">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Memuat data bulan...</div>
                ) : (
                    <div className="grid-3">
                        {months.map((month) => (
                            <div key={month.id} className={`month-card animate-in ${month.status === 'active' ? 'active-month' : ''}`}>
                                <div className="month-card-header">
                                    <div className="month-card-name">{month.name}</div>
                                    <span className={`badge ${month.status === 'active' ? 'badge-active' : 'badge-closed'}`}>
                                        {month.status === 'active' ? '● Aktif' : '● Tutup'}
                                    </span>
                                </div>
                                <div className="month-card-stats">
                                    <div className="month-card-stat">
                                        <div className="month-card-stat-value text-teal">{fmt(0)}</div>
                                        <div className="month-card-stat-label">Pemasukan</div>
                                    </div>
                                    <div className="month-card-stat">
                                        <div className="month-card-stat-value text-red">{fmt(0)}</div>
                                        <div className="month-card-stat-label">Pengeluaran</div>
                                    </div>
                                    <div className="month-card-stat">
                                        <div className="month-card-stat-value text-purple">{fmt(month.startBalance)}</div>
                                        <div className="month-card-stat-label">Saldo Awal</div>
                                    </div>
                                    <div className="month-card-stat">
                                        <div className="month-card-stat-value text-yellow">{fmt(month.budgetLimit)}</div>
                                        <div className="month-card-stat-label">Budget</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {months.length === 0 && (
                            <div className="card" style={{ gridColumn: 'span 3', textAlign: 'center', padding: 40 }}>
                                <p>Belum ada periode bulan. Silakan buat periode baru.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Buat Bulan Baru</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Bulan & Tahun</label>
                                <input
                                    type="month"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Saldo Awal</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.startBalance}
                                    onChange={(e) => setFormData({ ...formData, startBalance: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Budget Keseluruhan</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.budgetLimit}
                                    onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleCreateMonth}>Buat Bulan</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
