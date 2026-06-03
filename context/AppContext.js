// ============================================================
// AppContext.js — Unified React Context for Role, Profile, Toasts, and Modals
// Mini Helpdesk / Issue Tracking System
// ============================================================

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToastContainer, ToastElement } from '@/components/Toast';
import { ModalContainer } from '@/components/Modal';
import { supabase } from '@/lib/db';

const AppContext = createContext();

export function AppProvider({ children }) {
    // ── Simulated or Real Role ──────────────────────────────────────
    const [role, setRoleState] = useState('user');
    
    // ── Simulated or Real User Profile ──────────────────────────────
    const [user, setUserState] = useState({ name: 'นักศึกษา ทดสอบ', email: 'student@example.com' });
    
    // ── Toast Notifications State ───────────────────────────
    const [toasts, setToasts] = useState([]);
    
    // ── Modal Confirmation Dialog State ──────────────────────
    const [modal, setModal] = useState(null);

    const loadSimulatedUser = () => {
        const storedRole = localStorage.getItem('helpdesk_current_role') || 'user';
        setRoleState(storedRole);

        const storedUser = localStorage.getItem('helpdesk_current_user');
        if (storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
                setUserState({ name: 'นักศึกษา ทดสอบ', email: 'student@example.com' });
            }
        } else {
            setUserState({ name: 'นักศึกษา ทดสอบ', email: 'student@example.com' });
        }
    };

    const updateUserFromSession = (session) => {
        if (!session || !session.user) return;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.full_name || userEmail.split('@')[0];
        setUserState({
            name: userName,
            email: userEmail,
            id: session.user.id
        });

        // Determine role based on email content
        const isAdmin = userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase() === 'admin@example.com';
        setRoleState(isAdmin ? 'admin' : 'user');
    };

    // Auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                updateUserFromSession(session);
            } else {
                loadSimulatedUser();
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                updateUserFromSession(session);
            } else {
                loadSimulatedUser();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Auth methods
    const loginWithEmail = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signUpWithEmail = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        if (error) throw error;
        return data;
    };

    const signOutUser = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // reset to simulated guest defaults
        localStorage.removeItem('helpdesk_current_user');
        localStorage.removeItem('helpdesk_current_role');
        loadSimulatedUser();
    };

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
            modal,
            loginWithEmail,
            signUpWithEmail,
            signOutUser,
            isRealAuth: !!(user && user.id)
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
