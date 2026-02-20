'use client';

import { useState, useEffect } from 'react';

function fmt(n) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(n);
}

export default function BudgetPage() {
    const [budgets, setBudgets] = useState([]);
    const [months, setMonths] = useState([]);
    const [selectedMonthId, setSelectedMonthId] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBudget, setEditBudget] = useState({ categoryId: '', name: '', limit: 0 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/months');
            const data = await res.json();
            setMonths(data);
            if (data.length > 0 && !selectedMonthId) {
                setSelectedMonthId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching months:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBudgets = async () => {
        if (!selectedMonthId) return;
        try {
            const res = await fetch(`/api/budgets?monthId=${selectedMonthId}`);
            const data = await res.json();
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMonthId) fetchBudgets();
    }, [selectedMonthId]);

    const handleUpdateBudget = async () => {
        try {
            const res = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monthId: parseInt(selectedMonthId),
                    categoryId: parseInt(editBudget.categoryId),
                    limit: parseFloat(editBudget.limit)
                })
            });
            if (res.ok) {
                setShowModal(false);
                fetchBudgets();
            }
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };

    const totalBudget = budgets.reduce((a, b) => a + b.limit, 0);
    const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

    const activeMonth = months.find(m => m.id === parseInt(selectedMonthId));
    const totalIncome = activeMonth ? activeMonth.income : 0;
    const unallocated = totalIncome - totalBudget;
    const usagePerc = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Budget Planner</h1>
                        <p className="page-subtitle">Kelola anggaran per kategori</p>
                    </div>
                    <select
                        className="form-select"
                        style={{ width: 180 }}
                        value={selectedMonthId}
                        onChange={(e) => setSelectedMonthId(e.target.value)}
                    >
                        {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="page-body">
                {/* Overview */}
                <div className="stat-grid" style={{ marginBottom: 28 }}>
                    <div className="stat-card purple animate-in">
                        <div className="stat-card-label">Total Pemasukan</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>{fmt(totalIncome)}</div>
                    </div>
                    <div className="stat-card teal animate-in">
                        <div className="stat-card-label">Terlokasi</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>{fmt(totalBudget)}</div>
                    </div>
                    <div className="stat-card pink animate-in">
                        <div className="stat-card-label">Terpakai</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>{fmt(totalSpent)}</div>
                    </div>
                    <div className="stat-card green animate-in">
                        <div className="stat-card-label">Sisa (Unallocated)</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>{fmt(unallocated)}</div>
                    </div>
                </div>

                {/* Overall Progress */}
                {totalBudget > 0 && (
                    <div className="card animate-in" style={{ marginBottom: 28 }}>
                        <div className="section-header">
                            <h3 className="section-title">Progress Budget Keseluruhan</h3>
                            <span className={`badge ${usagePerc > 90 ? 'badge-warning' : 'badge-active'}`}>
                                {Math.round(usagePerc)}% terpakai
                            </span>
                        </div>
                        <div className="progress-bar-container" style={{ height: 12 }}>
                            <div className={`progress-bar-fill ${usagePerc > 90 ? 'danger' : 'purple'}`}
                                style={{ width: `${Math.min(100, Math.round(usagePerc))}%` }}>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Terpakai: {fmt(totalSpent)}</span>
                            <span>Total Pemasukan: {fmt(totalIncome)}</span>
                        </div>
                    </div>
                )}

                {/* List categories */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Memuat data budget...</div>
                ) : (
                    <div className="grid-2">
                        <div className="card animate-in">
                            <h3 className="section-title" style={{ marginBottom: 20 }}>Distribusi Budget</h3>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="donut-chart" style={{ background: `conic-gradient(var(--primary-500) 0% 100%)` }}>
                                    <div className="donut-chart-inner">
                                        <div className="donut-chart-value" style={{ fontSize: 18 }}>{fmt(totalBudget)}</div>
                                        <div className="donut-chart-label">Budget</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {budgets.map((b) => {
                                const pct = b.limit > 0 ? Math.round(b.spent / b.limit * 100) : 0;
                                const over = pct > 90;
                                return (
                                    <div
                                        key={b.id}
                                        className={`budget-card animate-in ${over ? 'overbudget' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setEditBudget({ categoryId: b.id, name: b.name, limit: b.limit });
                                            setShowModal(true);
                                        }}
                                    >
                                        <div className="budget-card-header">
                                            <div className="budget-card-category">
                                                <span className="budget-card-emoji">{b.emoji}</span>
                                                <span className="budget-card-name">{b.name}</span>
                                            </div>
                                            <span className={`budget-card-percentage ${over ? 'text-red' : 'text-teal'}`}>
                                                {pct}%
                                                {over && ' ⚠️'}
                                            </span>
                                        </div>
                                        <div className="progress-bar-container" style={{ height: 6 }}>
                                            <div style={{
                                                width: `${Math.min(100, pct)}%`, height: '100%',
                                                background: over ? 'linear-gradient(90deg, var(--accent-red), var(--accent-orange))' : `var(--primary-500)`,
                                                borderRadius: 9999, transition: 'width 1s ease'
                                            }}></div>
                                        </div>
                                        <div className="budget-card-amounts">
                                            <span><span className="budget-card-spent">{fmt(b.spent)}</span> terpakai</span>
                                            <span>Sisa: {fmt(b.limit - b.spent)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Budget Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Atur Budget {editBudget.name}</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Limit Anggaran Bulanan</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={editBudget.limit}
                                    onChange={(e) => setEditBudget({ ...editBudget, limit: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleUpdateBudget}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
