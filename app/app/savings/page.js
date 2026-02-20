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
    if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'jt';
    return 'Rp ' + (n / 1000).toFixed(0) + 'rb';
}

export default function SavingsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Form State for new goal
    const [formData, setFormData] = useState({
        name: '',
        targetAmt: 0,
        savedAmt: 0,
        monthlyAmt: 0,
        deadline: new Date().toISOString().split('T')[0],
        icon: '🐷',
        color: '#00d9a6'
    });

    const [updateAmt, setUpdateAmt] = useState(0);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/savings');
            const data = await res.json();
            setGoals(data);
        } catch (error) {
            console.error('Error fetching savings goals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreateGoal = async () => {
        try {
            const res = await fetch('/api/savings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    targetAmt: parseFloat(formData.targetAmt),
                    savedAmt: parseFloat(formData.savedAmt),
                    monthlyAmt: parseFloat(formData.monthlyAmt)
                })
            });
            if (res.ok) {
                setShowModal(false);
                fetchGoals();
            }
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    const handleUpdateProgress = async () => {
        if (!selectedGoal) return;
        try {
            const newSavedAmt = selectedGoal.savedAmt + parseFloat(updateAmt);
            const res = await fetch(`/api/savings/${selectedGoal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savedAmt: newSavedAmt })
            });
            if (res.ok) {
                setShowUpdateModal(false);
                setUpdateAmt(0);
                fetchGoals();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const totalTarget = goals.reduce((a, b) => a + b.targetAmt, 0);
    const totalSaved = goals.reduce((a, b) => a + b.savedAmt, 0);

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Tabungan</h1>
                        <p className="page-subtitle">Lacak target menabung Anda</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Target Baru</button>
                </div>
            </div>
            <div className="page-body">
                {/* Summary */}
                <div className="card animate-in" style={{
                    marginBottom: 28,
                    background: 'linear-gradient(135deg, rgba(0, 217, 166, 0.1), rgba(0, 194, 255, 0.08))',
                    border: '1px solid rgba(0, 217, 166, 0.2)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>Total Target</div>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{fmtShort(totalTarget)}</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
                        <div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>Terkumpul</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-teal)' }}>{fmtShort(totalSaved)}</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
                        <div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>Sisa</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-orange)' }}>{fmtShort(Math.max(0, totalTarget - totalSaved))}</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--border-color)' }}></div>
                        <div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>Progress</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>{totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) : 0}%</div>
                        </div>
                    </div>
                </div>

                {/* Savings Cards Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Memuat data tabungan...</div>
                ) : (
                    <div className="grid-3">
                        {goals.map(goal => {
                            const pct = Math.round(goal.savedAmt / goal.targetAmt * 100) || 0;
                            const circumference = 2 * Math.PI * 42;
                            const deadlineDate = new Date(goal.deadline);
                            const daysLeft = Math.max(0, Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)));

                            return (
                                <div
                                    key={goal.id}
                                    className="goal-card animate-in"
                                    onClick={() => {
                                        setSelectedGoal(goal);
                                        setShowUpdateModal(true);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="goal-card-header">
                                        <div className="goal-card-icon" style={{ background: `${goal.color || '#00d9a6'}22` }}>
                                            {goal.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="goal-card-title">{goal.name}</div>
                                            <div className="goal-card-subtitle">{daysLeft} hari lagi</div>
                                        </div>
                                    </div>

                                    {/* Circle Progress */}
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                                        <div className="circle-progress" style={{ width: 110, height: 110 }}>
                                            <svg viewBox="0 0 100 100">
                                                <circle className="circle-progress-bg" cx="50" cy="50" r="42" />
                                                <circle
                                                    className="circle-progress-fill"
                                                    cx="50" cy="50" r="42"
                                                    stroke={goal.color || '#00d9a6'}
                                                    strokeDasharray={`${(Math.min(100, pct) / 100) * circumference} ${circumference}`}
                                                    strokeDashoffset="0"
                                                />
                                            </svg>
                                            <div className="circle-progress-text" style={{ fontSize: 18 }}>{pct}%</div>
                                        </div>
                                    </div>

                                    <div className="goal-card-amounts">
                                        <span className="goal-card-current">{fmtShort(goal.savedAmt)}</span>
                                        <span className="goal-card-target">/ {fmtShort(goal.targetAmt)}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                                        Nabung {fmtShort(goal.monthlyAmt)}/bulan • Deadline {deadlineDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
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
                            <h2 className="modal-title">Target Tabungan Baru</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nama Target</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="contoh: Dana Darurat"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Nominal</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.targetAmt}
                                    onChange={e => setFormData({ ...formData, targetAmt: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tersimpan Saat Ini</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.savedAmt}
                                    onChange={e => setFormData({ ...formData, savedAmt: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Tanggal</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nabung per Bulan</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.monthlyAmt}
                                    onChange={e => setFormData({ ...formData, monthlyAmt: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleCreateGoal}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {showUpdateModal && selectedGoal && (
                <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nabung ke {selectedGoal.name}</h2>
                            <button className="btn-icon" onClick={() => setShowUpdateModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 16 }}>Target: {fmt(selectedGoal.targetAmt)} | Terkumpul: {fmt(selectedGoal.savedAmt)}</p>
                            <div className="form-group">
                                <label className="form-label">Tambah Tabungan (IDR)</label>
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
                            <button className="btn btn-primary" onClick={handleUpdateProgress}>Tambah</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
