// ============================================================
// Navbar.js — Sidebar Navigation & Role Switcher component
// ============================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
    Home, PlusCircle, List, User, Shield,
    BarChart3, Settings, X, Menu, ShieldCheck, UserCircle, LogIn, LogOut
} from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { role, setRole, user, signOutUser, isRealAuth, MOCK_PROFILES, switchMockProfile } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = role === 'admin';

    const userMenuItems = [
        { href: '/', icon: <Home style={{ width: 18, height: 18 }} />, label: 'หน้าหลัก', id: 'home' },
        { href: '/create', icon: <PlusCircle style={{ width: 18, height: 18 }} />, label: 'แจ้งปัญหาใหม่', id: 'create' },
        { href: '/tickets', icon: <List style={{ width: 18, height: 18 }} />, label: 'รายการ Ticket', id: 'tickets' },
        { href: '/my-tickets', icon: <User style={{ width: 18, height: 18 }} />, label: 'ปัญหาของฉัน', id: 'my-tickets' },
        { href: '/dashboard', icon: <BarChart3 style={{ width: 18, height: 18 }} />, label: 'Dashboard', id: 'dashboard' }
    ];

    const adminMenuItems = [
        { href: '/', icon: <Home style={{ width: 18, height: 18 }} />, label: 'หน้าหลัก', id: 'home' },
        { href: '/create', icon: <PlusCircle style={{ width: 18, height: 18 }} />, label: 'แจ้งปัญหาใหม่', id: 'create' },
        { href: '/tickets', icon: <List style={{ width: 18, height: 18 }} />, label: 'รายการ Ticket', id: 'tickets' },
        { href: '/admin', icon: <Shield style={{ width: 18, height: 18 }} />, label: 'จัดการ Ticket', id: 'admin' },
        { href: '/dashboard', icon: <BarChart3 style={{ width: 18, height: 18 }} />, label: 'Dashboard', id: 'dashboard' },
        { href: '/issue-types', icon: <Settings style={{ width: 18, height: 18 }} />, label: 'จัดการประเภท', id: 'issue-types' }
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const isActive = (href) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'overlay-active' : ''}`}
                onClick={toggleSidebar}
            ></div>

            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="hamburger-btn" onClick={toggleSidebar}>
                    <Menu style={{ width: 22, height: 22 }} />
                </button>
                <div className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src="/front-desk_17210386.png" alt="Mini Helpdesk" style={{ width: 22, height: 22 }} />
                    <span style={{ fontWeight: 600 }}>Mini Helpdesk</span>
                </div>
                <div className="mobile-role-indicator">
                    <span className={`user-role-badge ${isAdmin ? 'admin-badge' : 'user-badge'}`}>
                        {isAdmin ? 'Admin' : 'User'}
                    </span>
                </div>
            </header>

            {/* Sidebar Shell */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">
                            <img src="/front-desk_17210386.png" alt="Mini Helpdesk" style={{ width: 28, height: 28 }} />
                        </div>
                        <div className="logo-text">
                            <h1>Mini Helpdesk</h1>
                            <span>Issue Tracking System</span>
                        </div>
                    </div>
                    <button className="sidebar-close-btn" onClick={toggleSidebar}>
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <div className="role-switcher">
                    <div className="role-switcher-label">สลับกลุ่มผู้ใช้งาน</div>
                    {isRealAuth ? (
                        <div style={{
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            textAlign: 'center'
                        }}>
                            ใช้บัญชีจริง
                        </div>
                    ) : (
                        <select
                            className="form-input form-select"
                            style={{
                                width: '100%',
                                fontSize: '0.85rem',
                                padding: '0.4rem 0.5rem',
                                borderRadius: '6px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                            value={MOCK_PROFILES?.findIndex(p => p.group === user?.group)}
                            onChange={(e) => {
                                const idx = parseInt(e.target.value, 10);
                                if (idx >= 0 && idx < MOCK_PROFILES.length) {
                                    switchMockProfile(idx);
                                }
                                setSidebarOpen(false);
                            }}
                        >
                            {MOCK_PROFILES?.map((p, idx) => (
                                <option key={idx} value={idx}>
                                    {p.group}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user-info" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="user-avatar">
                                {isAdmin ? (
                                    <ShieldCheck style={{ width: 20, height: 20, color: 'var(--primary-color)' }} />
                                ) : (
                                    <UserCircle style={{ width: 20, height: 20 }} />
                                )}
                            </div>
                            <div className="user-details" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span className="user-name" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontWeight: 600 }}>
                                    {user?.name || (isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน')}
                                </span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span className={`user-role-badge ${isAdmin ? 'admin-badge' : 'user-badge'}`} style={{ fontSize: '0.65rem', padding: '1px 4px' }}>
                                        {isAdmin ? 'Admin' : 'User'} {isRealAuth ? '(Auth)' : ''}
                                    </span>
                                    <span className="user-role-badge" style={{
                                        fontSize: '0.65rem',
                                        padding: '1px 4px',
                                        background: 'rgba(59, 130, 246, 0.15)',
                                        color: '#60a5fa',
                                        border: '1px solid rgba(59, 130, 246, 0.3)'
                                    }}>
                                        {user?.group || 'นักศึกษา'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {isRealAuth ? (
                            <button
                                onClick={signOutUser}
                                className="btn btn-ghost btn-sm"
                                style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.85rem', color: '#f87171', display: 'flex', alignItems: 'center' }}
                            >
                                <LogOut style={{ width: 14, height: 14, marginRight: 6 }} />
                                ออกจากระบบ
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="btn btn-primary btn-sm"
                                style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <LogIn style={{ width: 14, height: 14, marginRight: 6 }} />
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
