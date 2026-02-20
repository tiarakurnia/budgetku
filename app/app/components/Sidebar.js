'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
    {
        section: 'OVERVIEW', items: [
            { name: 'Dashboard', icon: '📊', href: '/' },
            { name: 'Kelola Bulan', icon: '📅', href: '/months' },
        ]
    },
    {
        section: 'KEUANGAN', items: [
            { name: 'Akun', icon: '🏦', href: '/accounts' },
            { name: 'Transaksi', icon: '💸', href: '/transactions' },
            { name: 'Budget Planner', icon: '🎯', href: '/budget' },
        ]
    },
    {
        section: 'PELACAKAN', items: [
            { name: 'Hutang', icon: '📋', href: '/debts' },
            { name: 'Tabungan', icon: '🐷', href: '/savings' },
            { name: 'Analitik', icon: '📈', href: '/analytics' },
        ]
    },
    {
        section: 'LAINNYA', items: [
            { name: 'Pengaturan', icon: '⚙️', href: '/settings' },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="hamburger" onClick={() => setOpen(!open)}>
                {open ? '✕' : '☰'}
            </button>
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">B</div>
                        <span className="sidebar-logo-text">BudgetKu</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.section}>
                            <div className="nav-section-title">{section.section}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                }}>
                    BudgetKu v1.0 • 2026
                </div>
            </aside>
            {open && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 99, display: 'block',
                    }}
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
}
