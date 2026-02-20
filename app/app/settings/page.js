'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        currency: 'IDR',
        notif: 'true',
        darkMode: 'true',
        autoClose: 'true'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (Object.keys(data).length > 0) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error('Fetch settings error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateSetting = async (key, value) => {
        const next = { ...settings, [key]: String(value) };
        setSettings(next);

        try {
            setSaving(true);
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: String(value) })
            });
            setStatus('Tersimpan');
            setTimeout(() => setStatus(''), 2000);
        } catch (err) {
            console.error('Save error:', err);
            setStatus('Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 100 }}>Memuat pengaturan...</div>;

    const bool = (val) => val === 'true';

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Pengaturan</h1>
                    <p className="page-subtitle">Konfigurasi aplikasi</p>
                </div>
                {status && <span style={{ fontSize: 13, color: 'var(--accent-teal)', fontWeight: 600 }}>{status}</span>}
            </div>
            <div className="page-body">
                {/* General Settings */}
                <div className="settings-section animate-in">
                    <h3 className="settings-section-title">⚙️ Umum</h3>
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label">Mata Uang</span>
                            <span className="settings-item-desc">Mata uang default untuk semua transaksi</span>
                        </div>
                        <select
                            className="form-select"
                            style={{ width: 120 }}
                            value={settings.currency}
                            onChange={e => updateSetting('currency', e.target.value)}
                        >
                            <option value="IDR">🇮🇩 IDR</option>
                            <option value="USD">🇺🇸 USD</option>
                            <option value="EUR">🇪🇺 EUR</option>
                            <option value="SGD">🇸🇬 SGD</option>
                        </select>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label">Dark Mode</span>
                            <span className="settings-item-desc">Tampilan gelap untuk pengalaman visual yang nyaman</span>
                        </div>
                        <div
                            className={`toggle ${bool(settings.darkMode) ? 'active' : ''}`}
                            onClick={() => updateSetting('darkMode', !bool(settings.darkMode))}
                        ></div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label">Notifikasi Budget</span>
                            <span className="settings-item-desc">Kirim peringatan saat budget hampir habis</span>
                        </div>
                        <div
                            className={`toggle ${bool(settings.notif) ? 'active' : ''}`}
                            onClick={() => updateSetting('notif', !bool(settings.notif))}
                        ></div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label">Auto-close Bulan</span>
                            <span className="settings-item-desc">Otomatis tutup bulan di akhir periode</span>
                        </div>
                        <div
                            className={`toggle ${bool(settings.autoClose) ? 'active' : ''}`}
                            onClick={() => updateSetting('autoClose', !bool(settings.autoClose))}
                        ></div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="settings-section animate-in">
                    <h3 className="settings-section-title">💾 Data</h3>
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label">Export Data</span>
                            <span className="settings-item-desc">Download semua data dalam format JSON</span>
                        </div>
                        <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => alert('Fitur export segera hadir!')}>📥 Export</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label" style={{ color: 'var(--accent-red)' }}>Reset Data</span>
                            <span className="settings-item-desc">Hapus semua data dan mulai dari awal</span>
                        </div>
                        <button className="btn btn-danger" style={{ fontSize: 12 }}>🗑️ Reset</button>
                    </div>
                </div>

                {/* App Info */}
                <div className="card animate-in" style={{
                    textAlign: 'center', padding: 24, marginTop: 8,
                    background: 'linear-gradient(135deg, rgba(124, 45, 255, 0.08), rgba(0, 217, 166, 0.05))',
                    border: '1px solid rgba(124, 45, 255, 0.15)'
                }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>💰</div>
                    <div style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, var(--primary-200), var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        BudgetKu v1.0
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        Personal Budgeting App — Powered by TiDB & Prisma
                    </div>
                </div>
            </div>
        </>
    );
}
