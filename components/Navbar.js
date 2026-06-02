// ============================================================
// Navbar.js — Sidebar Navigation & Role Switcher component
// ============================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
    Headset, Home, PlusCircle, List, User, Shield, 
    BarChart3, Settings, X, Menu, ShieldCheck, UserCircle 
} from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { role, setRole } = useApp();
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
                    <Headset style={{ width: 20, height: 20 }} />
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
                            <Headset style={{ width: 24, height: 24 }} />
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
                    <div className="role-switcher-label">มุมมอง</div>
                    <div className="role-toggle">
                        <button 
                            className={`role-btn ${!isAdmin ? 'role-btn-active' : ''}`}
                            onClick={() => { setRole('user'); setSidebarOpen(false); }}
                        >
                            <UserCircle style={{ width: 14, height: 14 }} />
                            User
                        </button>
                        <button 
                            className={`role-btn ${isAdmin ? 'role-btn-active' : ''}`}
                            onClick={() => { setRole('admin'); setSidebarOpen(false); }}
                        >
                            <Shield style={{ width: 14, height: 14 }} />
                            Admin
                        </button>
                    </div>
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
                    <div className="sidebar-user-info">
                        <div className="user-avatar">
                            {isAdmin ? (
                                <ShieldCheck style={{ width: 20, height: 20, color: 'var(--primary-color)' }} />
                            ) : (
                                <UserCircle style={{ width: 20, height: 20 }} />
                            )}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</span>
                            <span className={`user-role-badge ${isAdmin ? 'admin-badge' : 'user-badge'}`}>
                                {isAdmin ? 'Admin' : 'User'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
