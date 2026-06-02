// ============================================================
// navbar.js — Sidebar Navigation + Role Switcher
// ============================================================

function renderNavbar() {
    const currentRole = RoleService.getCurrentRole();
    const isAdmin = currentRole === 'admin';
    const currentHash = window.location.hash.slice(1) || 'home';

    const userMenuItems = [
        { id: 'home', icon: 'home', label: 'หน้าหลัก' },
        { id: 'create', icon: 'plus-circle', label: 'แจ้งปัญหาใหม่' },
        { id: 'tickets', icon: 'list', label: 'รายการ Ticket' },
        { id: 'my-tickets', icon: 'user', label: 'ปัญหาของฉัน' },
        { id: 'dashboard', icon: 'bar-chart-3', label: 'Dashboard' }
    ];

    const adminMenuItems = [
        { id: 'home', icon: 'home', label: 'หน้าหลัก' },
        { id: 'create', icon: 'plus-circle', label: 'แจ้งปัญหาใหม่' },
        { id: 'tickets', icon: 'list', label: 'รายการ Ticket' },
        { id: 'admin', icon: 'shield', label: 'จัดการ Ticket' },
        { id: 'dashboard', icon: 'bar-chart-3', label: 'Dashboard' },
        { id: 'issue-types', icon: 'settings', label: 'จัดการประเภท' }
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <div class="logo-icon">
                        <i data-lucide="headset" style="width:24px;height:24px"></i>
                    </div>
                    <div class="logo-text">
                        <h1>Mini Helpdesk</h1>
                        <span>Issue Tracking System</span>
                    </div>
                </div>
                <button class="sidebar-close-btn" id="sidebar-close-btn" onclick="toggleSidebar()">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div class="role-switcher">
                <div class="role-switcher-label">มุมมอง</div>
                <div class="role-toggle" id="role-toggle">
                    <button class="role-btn ${!isAdmin ? 'role-btn-active' : ''}" onclick="switchRole('user')">
                        <i data-lucide="user" style="width:14px;height:14px"></i>
                        User
                    </button>
                    <button class="role-btn ${isAdmin ? 'role-btn-active' : ''}" onclick="switchRole('admin')">
                        <i data-lucide="shield" style="width:14px;height:14px"></i>
                        Admin
                    </button>
                </div>
            </div>

            <nav class="sidebar-nav">
                ${menuItems.map(item => `
                    <a href="#${item.id}" class="nav-item ${currentHash.startsWith(item.id) ? 'nav-item-active' : ''}" data-page="${item.id}">
                        <i data-lucide="${item.icon}" style="width:18px;height:18px"></i>
                        <span>${item.label}</span>
                    </a>
                `).join('')}
            </nav>

            <div class="sidebar-footer">
                <div class="sidebar-user-info">
                    <div class="user-avatar">
                        <i data-lucide="${isAdmin ? 'shield-check' : 'user-circle'}" style="width:20px;height:20px"></i>
                    </div>
                    <div class="user-details">
                        <span class="user-name">${isAdmin ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</span>
                        <span class="user-role-badge ${isAdmin ? 'admin-badge' : 'user-badge'}">${isAdmin ? 'Admin' : 'User'}</span>
                    </div>
                </div>
            </div>
        </aside>
    `;
}

function renderMobileHeader() {
    return `
        <header class="mobile-header" id="mobile-header">
            <button class="hamburger-btn" id="hamburger-btn" onclick="toggleSidebar()">
                <i data-lucide="menu"></i>
            </button>
            <div class="mobile-logo">
                <i data-lucide="headset" style="width:20px;height:20px"></i>
                <span>Mini Helpdesk</span>
            </div>
            <div class="mobile-role-indicator">
                <span class="user-role-badge ${RoleService.isAdmin() ? 'admin-badge' : 'user-badge'}">
                    ${RoleService.isAdmin() ? 'Admin' : 'User'}
                </span>
            </div>
        </header>
    `;
}

function switchRole(role) {
    RoleService.setRole(role);
    Toast.info(`เปลี่ยนเป็นมุมมอง ${role === 'admin' ? 'Admin' : 'User'} แล้ว`);
    renderApp();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
        sidebar.classList.toggle('sidebar-open');
        if (overlay) overlay.classList.toggle('overlay-active');
    }
}
