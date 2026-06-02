// ============================================================
// page.js — Analytical Dashboard
// Route: /dashboard
// ============================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart3, Ticket, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import Chart from 'chart.js/auto';

const STATUS_COLORS = {
    'Open': '#3b82f6',
    'In Progress': '#f59e0b',
    'Waiting for Information': '#a855f7',
    'Resolved': '#22c55e',
    'Closed': '#6b7280',
    'Cancelled': '#ef4444'
};

const PRIORITY_COLORS = {
    'Low': '#22c55e',
    'Medium': '#3b82f6',
    'High': '#f59e0b',
    'Urgent': '#ef4444'
};

export default function DashboardPage() {
    const { toast } = useApp();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const statusChartRef = useRef(null);
    const priorityChartRef = useRef(null);
    const typeChartRef = useRef(null);

    const statusChartInst = useRef(null);
    const priorityChartInst = useRef(null);
    const typeChartInst = useRef(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
            }
        } catch (e) {
            console.error('Error fetching stats:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!stats) return;

        const fontColor = '#9ca3af';
        const gridColor = '#334155';

        // Destroy previous instances
        if (statusChartInst.current) statusChartInst.current.destroy();
        if (priorityChartInst.current) priorityChartInst.current.destroy();
        if (typeChartInst.current) typeChartInst.current.destroy();

        // 1. Status Doughnut Chart
        if (statusChartRef.current) {
            const labels = Object.keys(stats.byStatus);
            const data = Object.values(stats.byStatus);
            const backgroundColors = labels.map(label => STATUS_COLORS[label] || '#6366f1');

            statusChartInst.current = new Chart(statusChartRef.current, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: backgroundColors,
                        borderColor: '#1e293b',
                        borderWidth: 2,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: fontColor,
                                font: { size: 12, family: 'Inter, Sarabun, sans-serif' }
                            }
                        }
                    }
                }
            });
        }

        // 2. Priority Bar Chart
        if (priorityChartRef.current) {
            const labels = Object.keys(stats.byPriority);
            const data = Object.values(stats.byPriority);
            const backgroundColors = labels.map(label => PRIORITY_COLORS[label] || '#6366f1');

            priorityChartInst.current = new Chart(priorityChartRef.current, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'จำนวนตั๋ว',
                        data,
                        backgroundColor: backgroundColors,
                        borderRadius: 6,
                        maxBarThickness: 30
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: fontColor, font: { family: 'Inter, Sarabun, sans-serif' } }
                        },
                        y: {
                            grid: { color: gridColor },
                            ticks: { precision: 0, color: fontColor, font: { family: 'Inter, Sarabun, sans-serif' } }
                        }
                    }
                }
            });
        }

        // 3. Issue Type Horizontal Bar Chart
        if (typeChartRef.current) {
            const labels = Object.keys(stats.byIssueType);
            const data = Object.values(stats.byIssueType);

            typeChartInst.current = new Chart(typeChartRef.current, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'จำนวนปัญหาแยกตามประเภท',
                        data,
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        borderRadius: 4,
                        maxBarThickness: 20
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { color: gridColor },
                            ticks: { precision: 0, color: fontColor, font: { family: 'Inter, Sarabun, sans-serif' } }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: fontColor, font: { family: 'Inter, Sarabun, sans-serif' } }
                        }
                    }
                }
            });
        }

        return () => {
            if (statusChartInst.current) statusChartInst.current.destroy();
            if (priorityChartInst.current) priorityChartInst.current.destroy();
            if (typeChartInst.current) typeChartInst.current.destroy();
        };
    }, [stats]);

    const resolvedAndClosed = stats
        ? (stats.byStatus['Resolved'] || 0) + (stats.byStatus['Closed'] || 0)
        : 0;

    return (
        <div className="page-dashboard fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 style={{ width: 26, height: 26, color: 'var(--primary-color)' }} />
                        รายงานสถิติและ Dashboard
                    </h1>
                    <p className="page-subtitle">แสดงข้อมูลเชิงวิเคราะห์ของระบบงาน Mini Helpdesk แบบ Real-time</p>
                </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="dashboard-stats-grid">
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: '#4f46e520', color: '#4f46e5' }}>
                        <Ticket style={{ width: 24, height: 24 }} />
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">ตั๋วทั้งหมด</span>
                        <span className="dash-stat-number">{loading ? '...' : (stats?.total || 0)}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: '#eab30820', color: '#eab308' }}>
                        <Loader style={{ width: 24, height: 24 }} />
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">กำลังดำเนินการ</span>
                        <span className="dash-stat-number">{loading ? '...' : (stats?.byStatus['In Progress'] || 0)}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: '#22c55e20', color: '#22c55e' }}>
                        <CheckCircle style={{ width: 24, height: 24 }} />
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">แก้ไขเสร็จสิ้น</span>
                        <span className="dash-stat-number">{loading ? '...' : resolvedAndClosed}</span>
                    </div>
                </div>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                        <AlertTriangle style={{ width: 24, height: 24 }} />
                    </div>
                    <div className="dash-stat-info">
                        <span className="dash-stat-label">ตั๋วด่วนที่สุด</span>
                        <span className="dash-stat-number">{loading ? '...' : (stats?.byPriority['Urgent'] || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            {loading ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '5rem' }}>กำลังประมวลผลข้อมูลสถิติ...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="charts-row">
                        <div className="chart-card glass-card">
                            <div className="chart-card-header">
                                <h3 className="chart-card-title">สัดส่วนปัญหาตามสถานะ (Status)</h3>
                            </div>
                            <div className="chart-canvas-container">
                                <canvas ref={statusChartRef}></canvas>
                            </div>
                        </div>
                        <div className="chart-card glass-card">
                            <div className="chart-card-header">
                                <h3 className="chart-card-title">ระดับความเร่งด่วน (Priority)</h3>
                            </div>
                            <div className="chart-canvas-container">
                                <canvas ref={priorityChartRef}></canvas>
                            </div>
                        </div>
                    </div>

                    <div className="charts-row">
                        <div className="chart-card glass-card chart-card-full">
                            <div className="chart-card-header">
                                <h3 className="chart-card-title">จำนวนปัญหาแยกตามหมวดหมู่ประเภทปัญหา (Issue Type)</h3>
                            </div>
                            <div className="chart-canvas-container-wide">
                                <canvas ref={typeChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
