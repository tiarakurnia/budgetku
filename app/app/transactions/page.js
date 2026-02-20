'use client';

import { useState, useEffect } from 'react';

function fmt(n) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(n);
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [months, setMonths] = useState([]);
    const [selectedMonthId, setSelectedMonthId] = useState('');
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        amount: 0,
        type: 'expense',
        categoryId: '',
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        monthId: '',
        note: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [yearsRes, catsRes, accsRes] = await Promise.all([
                fetch('/api/months'),
                fetch('/api/categories'),
                fetch('/api/accounts')
            ]);

            const [monthsData, catsData, accsData] = await Promise.all([
                yearsRes.json(),
                catsRes.json(),
                accsRes.json()
            ]);

            setMonths(monthsData);
            setCategories(catsData);
            setAccounts(accsData);

            if (monthsData.length > 0 && !selectedMonthId) {
                setSelectedMonthId(monthsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        if (!selectedMonthId) return;
        try {
            const res = await fetch(`/api/transactions?monthId=${selectedMonthId}`);
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMonthId) fetchTransactions();
    }, [selectedMonthId]);

    const handleCreateTransaction = async () => {
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                categoryId: parseInt(formData.categoryId),
                accountId: parseInt(formData.accountId),
                monthId: parseInt(formData.monthId || selectedMonthId)
            };

            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({
                    name: '',
                    amount: 0,
                    type: 'expense',
                    categoryId: '',
                    accountId: '',
                    date: new Date().toISOString().split('T')[0],
                    monthId: '',
                    note: ''
                });
                fetchTransactions();
            } else {
                const err = await res.json();
                alert(err.error || 'Gagal menyimpan transaksi');
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    const filtered = tab === 'all' ? transactions :
        tab === 'income' ? transactions.filter(t => t.type === 'income') :
            transactions.filter(t => t.type === 'expense');

    // Group by date
    const grouped = {};
    filtered.forEach(t => {
        const d = new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(t);
    });

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Transaksi</h1>
                        <p className="page-subtitle">Riwayat pemasukan & pengeluaran</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select
                            className="form-select"
                            style={{ width: 180 }}
                            value={selectedMonthId}
                            onChange={(e) => setSelectedMonthId(e.target.value)}
                        >
                            {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Transaksi</button>
                    </div>
                </div>
            </div>
            <div className="page-body">
                {/* Tabs */}
                <div className="tabs">
                    {['all', 'income', 'expense'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'all' ? 'Semua' : t === 'income' ? '📥 Pemasukan' : '📤 Pengeluaran'}
                        </button>
                    ))}
                </div>

                {/* Summary */}
                <div className="stat-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card teal animate-in">
                        <div className="stat-card-label">Pemasukan</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>
                            {fmt(transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0))}
                        </div>
                    </div>
                    <div className="stat-card pink animate-in">
                        <div className="stat-card-label">Pengeluaran</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>
                            {fmt(transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0))}
                        </div>
                    </div>
                    <div className="stat-card purple animate-in">
                        <div className="stat-card-label">Jumlah Transaksi</div>
                        <div className="stat-card-value" style={{ fontSize: 22, marginTop: 8 }}>{transactions.length}</div>
                    </div>
                </div>

                {/* Transaction List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>Memuat data transaksi...</div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        Belum ada transaksi di bulan ini.
                    </div>
                ) : Object.entries(grouped).reverse().map(([date, txs]) => (
                    <div key={date} className="date-group">
                        <div className="date-group-header">{date}</div>
                        <div className="transaction-list">
                            {txs.map(tx => (
                                <div key={tx.id} className="transaction-item animate-in">
                                    <div className="transaction-icon" style={{
                                        background: tx.type === 'income' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)'
                                    }}>
                                        {tx.category.emoji}
                                    </div>
                                    <div className="transaction-info">
                                        <div className="transaction-name">{tx.name}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                            <span className={`badge badge-active`}>{tx.category.name}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {tx.account.name}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`transaction-amount ${tx.type}`}>
                                            {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Tambah Transaksi</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tipe</label>
                                <div className="tabs" style={{ marginBottom: 0 }}>
                                    <button
                                        className={`tab ${formData.type === 'expense' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                                    >Pengeluaran</button>
                                    <button
                                        className={`tab ${formData.type === 'income' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'income' })}
                                    >Pemasukan</button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nama Transaksi</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="contoh: Makan siang"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Jumlah</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                <select
                                    className="form-select"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Akun</label>
                                <select
                                    className="form-select"
                                    value={formData.accountId}
                                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                >
                                    <option value="">Pilih Akun</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tanggal</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Catatan (opsional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Tambah catatan..."
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleCreateTransaction}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            <button className="fab" onClick={() => setShowModal(true)}>＋</button>
        </>
    );
}
