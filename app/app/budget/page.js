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
    const [isPlanningMode, setIsPlanningMode] = useState(false);
    const [tempLimits, setTempLimits] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [editingOverall, setEditingOverall] = useState(false);
    const [tempOverallLimit, setTempOverallLimit] = useState(0);

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
        if (selectedMonthId) {
            fetchBudgets();
            const activeM = months.find(m => m.id === parseInt(selectedMonthId));
            if (activeM) setTempOverallLimit(activeM.budgetLimit);
        }
    }, [selectedMonthId, months]);

    const handleSavePlanning = async () => {
        try {
            setIsSaving(true);
            const promises = Object.entries(tempLimits).map(([catId, limit]) =>
                fetch('/api/budgets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        monthId: parseInt(selectedMonthId),
                        categoryId: parseInt(catId),
                        limit: parseFloat(limit)
                    })
                })
            );
            await Promise.all(promises);
            setIsPlanningMode(false);
            fetchBudgets();
        } catch (error) {
            console.error('Error saving planning:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateOverallLimit = async () => {
        try {
            const res = await fetch('/api/months', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedMonthId,
                    budgetLimit: parseFloat(tempOverallLimit)
                })
            });
            if (res.ok) {
                setEditingOverall(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error updating overall limit:', error);
        }
    };

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
                        <div className="stat-card-label">Sisa Unallocated</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>{fmt(totalIncome - totalBudget)}</div>
                    </div>
                </div>

                {/* Overall Budget Control */}
                <div className="card animate-in" style={{ marginBottom: 28, background: 'var(--bg-card)', border: '1px solid var(--primary-100)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Target Budget Bulanan</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Berapa total anggaran yang ingin Anda alokasikan bulan ini?</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {editingOverall ? (
                                <>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ width: 150, textAlign: 'right' }}
                                        value={tempOverallLimit}
                                        onChange={(e) => setTempOverallLimit(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="btn btn-primary" onClick={handleUpdateOverallLimit}>Save</button>
                                    <button className="btn btn-secondary" onClick={() => setEditingOverall(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-600)' }}>{fmt(totalIncome > 0 ? totalIncome : 0)}</span>
                                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                                        setTempOverallLimit(totalIncome);
                                        setEditingOverall(true);
                                    }}>Edit Target</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                {totalBudget > 0 && (
                    <div className="card animate-in" style={{ marginBottom: 20 }}>
                        <div className="section-header">
                            <h3 className="section-title">Alokasi vs Target</h3>
                            <span className={`badge ${totalBudget > totalIncome ? 'badge-warning' : 'badge-active'}`}>
                                {totalBudget > totalIncome ? 'Over Target' : 'Safe'}
                            </span>
                        </div>
                        <div className="progress-bar-container" style={{ height: 12 }}>
                            <div className={`progress-bar-fill ${totalBudget > totalIncome ? 'danger' : 'purple'}`}
                                style={{ width: `${Math.min(100, (totalBudget / (totalIncome || 1)) * 100)}%` }}>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Terlokasi: {fmt(totalBudget)}</span>
                            <span>Target: {fmt(totalIncome)}</span>
                        </div>
                    </div>
                )}

                <div className="section-header" style={{ marginBottom: 16 }}>
                    <h3 className="section-title">Rencana Pengeluaran</h3>
                    <button
                        className={`btn ${isPlanningMode ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 12, padding: '6px 16px' }}
                        onClick={() => {
                            if (!isPlanningMode) {
                                const initialLimits = {};
                                budgets.forEach(b => initialLimits[b.id] = b.limit);
                                setTempLimits(initialLimits);
                            }
                            setIsPlanningMode(!isPlanningMode);
                        }}
                    >
                        {isPlanningMode ? 'Keluar Mode Planning' : 'Mode Planning (Edit Massal)'}
                    </button>
                </div>

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
                            {isPlanningMode && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                                    <button className="btn btn-primary" onClick={handleSavePlanning} disabled={isSaving}>
                                        {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                                    </button>
                                </div>
                            )}
                            {budgets.map((b) => {
                                const pct = b.limit > 0 ? Math.round(b.spent / b.limit * 100) : 0;
                                const over = pct > 90;
                                return (
                                    <div
                                        key={b.id}
                                        className={`budget-card animate-in ${over ? 'overbudget' : ''}`}
                                        style={{ cursor: isPlanningMode ? 'default' : 'pointer', border: isPlanningMode ? '1px solid var(--primary-200)' : 'none' }}
                                        onClick={() => {
                                            if (!isPlanningMode) {
                                                setEditBudget({ categoryId: b.id, name: b.name, limit: b.limit });
                                                setShowModal(true);
                                            }
                                        }}
                                    >
                                        <div className="budget-card-header">
                                            <div className="budget-card-category">
                                                <span className="budget-card-emoji">{b.emoji}</span>
                                                <span className="budget-card-name">{b.name}</span>
                                            </div>
                                            {!isPlanningMode && (
                                                <span className={`budget-card-percentage ${over ? 'text-red' : 'text-teal'}`}>
                                                    {pct}%
                                                    {over && ' ⚠️'}
                                                </span>
                                            )}
                                        </div>

                                        {isPlanningMode ? (
                                            <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Limit:</span>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ height: 32, fontSize: 13, padding: '4px 8px' }}
                                                        value={tempLimits[b.id] || 0}
                                                        onChange={(e) => setTempLimits({ ...tempLimits, [b.id]: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
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
