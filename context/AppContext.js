// ============================================================
// AppContext.js — Unified React Context for Role, Profile, Toasts, and Modals
// Mini Helpdesk / Issue Tracking System
// ============================================================

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToastContainer, ToastElement } from '@/components/Toast';
import { ModalContainer } from '@/components/Modal';

const AppContext = createContext();

export function AppProvider({ children }) {
    // ── Simulated Role ──────────────────────────────────────
    const [role, setRoleState] = useState('user');
    
    // ── Simulated User Profile ──────────────────────────────
    const [user, setUserState] = useState({ name: 'นักศึกษา ทดสอบ', email: 'student@example.com' });
    
    // ── Toast Notifications State ───────────────────────────
    const [toasts, setToasts] = useState([]);
    
    // ── Modal Confirmation Dialog State ──────────────────────
    const [modal, setModal] = useState(null);

    // Initial load from localStorage (Client-only)
    useEffect(() => {
        const storedRole = localStorage.getItem('helpdesk_current_role');
        if (storedRole) setRoleState(storedRole);

        const storedUser = localStorage.getItem('helpdesk_current_user');
        if (storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const setRole = (newRole) => {
        setRoleState(newRole);
        localStorage.setItem('helpdesk_current_role', newRole);
        showToast(`เปลี่ยนเป็นมุมมอง ${newRole === 'admin' ? 'Admin' : 'User'} แล้ว`, 'info');
    };

    const setUser = (name, email) => {
        const updated = { name, email };
        setUserState(updated);
        localStorage.setItem('helpdesk_current_user', JSON.stringify(updated));
    };

    // ── Toast Logic ─────────────────────────────────────────
    const showToast = (message, type = 'info') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 5);
        setToasts((prev) => [...prev, { id, message, type, isClosing: false }]);

        // Start slide-out animation 300ms before duration end
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, isClosing: true } : t))
            );
        }, 2700);

        // Remove toast completely
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const toastHelpers = {
        success: (msg) => showToast(msg, 'success'),
        error: (msg) => showToast(msg, 'error'),
        warning: (msg) => showToast(msg, 'warning'),
        info: (msg) => showToast(msg, 'info')
    };

    // ── Modal Logic ─────────────────────────────────────────
    const confirm = (title, message, onConfirm, options = {}) => {
        setModal({
            title,
            message,
            onConfirm: () => {
                if (onConfirm) onConfirm();
                setModal(null);
            },
            onCancel: () => {
                if (options.onCancel) options.onCancel();
                setModal(null);
            },
            confirmText: options.confirmText || 'ยืนยัน',
            cancelText: options.cancelText || 'ยกเลิก',
            confirmClass: options.confirmClass || 'btn-primary',
            showCancel: options.showCancel !== false,
            content: options.content || null
        });
    };

    const closeModal = () => setModal(null);

    return (
        <AppContext.Provider value={{
            role,
            setRole,
            user,
            setUser,
            toast: toastHelpers,
            confirm,
            closeModal,
            modal
        }}>
            {children}
            
            {/* Declarative Toast rendering */}
            <ToastContainer toasts={toasts} setToasts={setToasts} />

            {/* Declarative Modal rendering */}
            {modal && <ModalContainer modal={modal} />}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
