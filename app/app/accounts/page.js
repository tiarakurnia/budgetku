'use client';

import { useState, useEffect } from 'react';

function fmt(n) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(n);
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);

    // Form States
    const [newAccount, setNewAccount] = useState({ name: '', type: 'Cash', balance: 0 });
    const [transfer, setTransfer] = useState({ fromAccountId: '', toAccountId: '', amount: 0 });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/accounts');
            const data = await res.json();
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async () => {
        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAccount)
            });
            if (res.ok) {
                setShowModal(false);
                setNewAccount({ name: '', type: 'Cash', balance: 0 });
                fetchAccounts();
            }
        } catch (error) {
            console.error('Error creating account:', error);
        }
    };

    const handleTransfer = async () => {
        try {
            const res = await fetch('/api/accounts/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromAccountId: parseInt(transfer.fromAccountId),
                    toAccountId: parseInt(transfer.toAccountId),
                    amount: parseFloat(transfer.amount)
                })
            });
            if (res.ok) {
                setShowTransfer(false);
                setTransfer({ fromAccountId: '', toAccountId: '', amount: 0 });
                fetchAccounts();
            } else {
                const err = await res.json();
                alert(err.error || 'Transfer gagal');
            }
        } catch (error) {
            console.error('Error performing transfer:', error);
        }
    };

    const totalBalance = accounts.reduce((a, b) => a + b.balance, 0);

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Akun</h1>
                        <p className="page-subtitle">Kelola semua akun keuangan Anda</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={() => setShowTransfer(true)}>↔ Transfer</button>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Akun Baru</button>
                    </div>
                </div>
            </div>
            <div className="page-body">
                {/* Total Balance Card */}
                <div className="card animate-in" style={{
                    marginBottom: 28,
                    background: 'linear-gradient(135deg, rgba(124, 45, 255, 0.15), rgba(0, 217, 166, 0.1))',
                    border: '1px solid rgba(124, 45, 255, 0.2)',
                    textAlign: 'center',
                    padding: '36px 24px'
                }}>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Total Saldo Semua Akun</div>
                    <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, var(--primary-200), var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {fmt(totalBalance)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{accounts.length} akun terhubung</div>
                </div>

                {/* Account Cards Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Memuat data akun...</div>
                ) : (
                    <div className="grid-3">
                        {accounts.map((acc) => (
                            <div key={acc.id} className="account-card animate-in">
                                <div className="account-card-gradient" style={{ background: acc.color }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                    <span style={{ fontSize: 28 }}>{acc.icon}</span>
                                    <div>
                                        <div className="account-card-type" style={{ color: acc.color }}>{acc.type}</div>
                                        <div className="account-card-name">{acc.name}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <div className="account-card-balance-label">Saldo</div>
                                    <div className="account-card-balance">{fmt(acc.balance)}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12, padding: '8px 12px', justifyContent: 'center' }}>Riwayat</button>
                                    <button className="btn-icon" style={{ width: 36, height: 36, fontSize: 14 }}>✏️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Account Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Tambah Akun Baru</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nama Akun</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="contoh: BCA Tabungan"
                                    value={newAccount.name}
                                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tipe Akun</label>
                                <select
                                    className="form-select"
                                    value={newAccount.type}
                                    onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                                >
                                    <option>Cash</option>
                                    <option>Bank</option>
                                    <option>E-Wallet</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Saldo Awal</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={newAccount.balance}
                                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleCreateAccount}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransfer && (
                <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Transfer Antar Akun</h2>
                            <button className="btn-icon" onClick={() => setShowTransfer(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Dari Akun</label>
                                <select
                                    className="form-select"
                                    value={transfer.fromAccountId}
                                    onChange={(e) => setTransfer({ ...transfer, fromAccountId: e.target.value })}
                                >
                                    <option value="">Pilih Akun Asal</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
                                </select>
                            </div>
                            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 24, color: 'var(--text-muted)' }}>↓</div>
                            <div className="form-group">
                                <label className="form-label">Ke Akun</label>
                                <select
                                    className="form-select"
                                    value={transfer.toAccountId}
                                    onChange={(e) => setTransfer({ ...transfer, toAccountId: e.target.value })}
                                >
                                    <option value="">Pilih Akun Tujuan</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Jumlah Transfer</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={transfer.amount}
                                    onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowTransfer(false)}>Batal</button>
                            <button className="btn btn-success" onClick={handleTransfer}>Transfer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
