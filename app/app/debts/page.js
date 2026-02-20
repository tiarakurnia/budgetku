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
    if (n >= 1000000000) return 'Rp ' + (n / 1000000000).toFixed(1) + 'M';
    if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'jt';
    return 'Rp ' + (n / 1000).toFixed(0) + 'rb';
}

export default function DebtsPage() {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        lender: '',
        totalAmount: 0,
        paidAmount: 0,
        monthlyPay: 0,
        icon: '💳',
        color: '#ff4d4d'
    });

    const [updateAmt, setUpdateAmt] = useState(0);

    const fetchDebts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/debts');
            const data = await res.json();
            setDebts(data);
        } catch (error) {
            console.error('Error fetching debts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, []);

    const handleCreateDebt = async () => {
        try {
            const res = await fetch('/api/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    totalAmount: parseFloat(formData.totalAmount),
                    paidAmount: parseFloat(formData.paidAmount),
                    monthlyPay: parseFloat(formData.monthlyPay)
                })
            });
            if (res.ok) {
                setShowModal(false);
                fetchDebts();
            }
        } catch (error) {
            console.error('Error creating debt:', error);
        }
    };

    const handleUpdateProgress = async () => {
        if (!selectedDebt) return;
        try {
            const newPaidAmt = selectedDebt.paidAmount + parseFloat(updateAmt);
            const res = await fetch(`/api/debts/${selectedDebt.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paidAmount: newPaidAmt })
            });
            if (res.ok) {
                setShowUpdateModal(false);
                setUpdateAmt(0);
                fetchDebts();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const totalDebt = debts.reduce((a, b) => a + b.totalAmount, 0);
    const totalPaid = debts.reduce((a, b) => a + b.paidAmount, 0);
    const totalMonthly = debts.reduce((a, b) => a + b.monthlyPay, 0);

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Hutang</h1>
                        <p className="page-subtitle">Pelacakan hutang dan cicilan</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Tambah Hutang</button>
                </div>
            </div>
            <div className="page-body">
                {/* Summary */}
                <div className="stat-grid" style={{ marginBottom: 28 }}>
                    <div className="stat-card pink animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Total Hutang</span>
                            <div className="stat-card-icon pink">📋</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{fmtShort(totalDebt)}</div>
                    </div>
                    <div className="stat-card green animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Sudah Dibayar</span>
                            <div className="stat-card-icon green">✅</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{fmtShort(totalPaid)}</div>
                    </div>
                    <div className="stat-card purple animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Sisa Hutang</span>
                            <div className="stat-card-icon purple">📊</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{fmtShort(totalDebt - totalPaid)}</div>
                    </div>
                    <div className="stat-card teal animate-in">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Cicilan / Bulan</span>
                            <div className="stat-card-icon teal">💰</div>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{fmtShort(totalMonthly)}</div>
                    </div>
                </div>

                {/* Overall Progress */}
                {totalDebt > 0 && (
                    <div className="card animate-in" style={{ marginBottom: 28 }}>
                        <div className="section-header">
                            <h3 className="section-title">Progress Pelunasan Keseluruhan</h3>
                            <span className="badge badge-active">{Math.round(totalPaid / totalDebt * 100)}% lunas</span>
                        </div>
                        <div className="progress-bar-container" style={{ height: 12 }}>
                            <div className="progress-bar-fill green" style={{ width: `${Math.round(totalPaid / totalDebt * 100)}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Debt Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Memuat data hutang...</div>
                ) : (
                    <div className="grid-2">
                        {debts.map(debt => {
                            const pct = Math.round(debt.paidAmount / debt.totalAmount * 100) || 0;
                            const circumference = 2 * Math.PI * 42;
                            const remaining = debt.totalAmount - debt.paidAmount;
                            const monthsLeft = debt.monthlyPay > 0 ? Math.ceil(remaining / debt.monthlyPay) : '∞';
                            return (
                                <div
                                    key={debt.id}
                                    className="goal-card animate-in"
                                    onClick={() => {
                                        setSelectedDebt(debt);
                                        setShowUpdateModal(true);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="goal-card-header">
                                        <div className="goal-card-icon" style={{ background: `${debt.color || '#ff4d4d'}22`, fontSize: 24 }}>
                                            {debt.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="goal-card-title">{debt.name}</div>
                                            <div className="goal-card-subtitle">{debt.lender} • ~{monthsLeft} bulan lagi</div>
                                        </div>
                                        <div className="circle-progress" style={{ width: 70, height: 70 }}>
                                            <svg viewBox="0 0 100 100">
                                                <circle className="circle-progress-bg" cx="50" cy="50" r="42" />
                                                <circle
                                                    className="circle-progress-fill"
                                                    cx="50" cy="50" r="42"
                                                    stroke={debt.color || '#ff4d4d'}
                                                    strokeDasharray={`${(Math.min(100, pct) / 100) * circumference} ${circumference}`}
                                                    strokeDashoffset="0"
                                                />
                                            </svg>
                                            <div className="circle-progress-text" style={{ fontSize: 14 }}>{pct}%</div>
                                        </div>
                                    </div>
                                    <div className="progress-bar-container" style={{ height: 6 }}>
                                        <div style={{
                                            width: `${Math.min(100, pct)}%`, height: '100%',
                                            background: `linear-gradient(90deg, ${debt.color || '#ff4d4d'}, ${debt.color || '#ff4d4d'}aa)`,
                                            borderRadius: 9999, transition: 'width 1s ease'
                                        }}></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
                                        <div style={{ textAlign: 'center', padding: '10px 4px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtShort(debt.totalAmount)}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px 4px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>{fmtShort(debt.paidAmount)}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Dibayar</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '10px 4px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-orange)' }}>{fmtShort(debt.monthlyPay)}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ bulan</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Tambah Hutang</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nama Hutang</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="contoh: Cicilan Motor"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pemberi Pinjaman</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="contoh: Bank BCA"
                                    value={formData.lender}
                                    onChange={e => setFormData({ ...formData, lender: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Hutang</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.totalAmount}
                                    onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sudah Dibayar</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.paidAmount}
                                    onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cicilan per Bulan</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.monthlyPay}
                                    onChange={e => setFormData({ ...formData, monthlyPay: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleCreateDebt}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {showUpdateModal && selectedDebt && (
                <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Bayar Hutang {selectedDebt.name}</h2>
                            <button className="btn-icon" onClick={() => setShowUpdateModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 16 }}>Total: {fmt(selectedDebt.totalAmount)} | Sisa: {fmt(selectedDebt.totalAmount - selectedDebt.paidAmount)}</p>
                            <div className="form-group">
                                <label className="form-label">Jumlah Pembayaran (IDR)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={updateAmt}
                                    onChange={e => setUpdateAmt(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleUpdateProgress}>Bayar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
