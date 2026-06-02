// ============================================================
// page.js — Ticket List Page with Search & Filter
// Route: /tickets
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { List, Plus, Search, X } from 'lucide-react';
import { TicketGrid } from '@/components/TicketCard';
export default function TicketListPage() {
    const [issueTypes, setIssueTypes] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch issue types on mount
    useEffect(() => {
        async function fetchIssueTypes() {
            try {
                const res = await fetch('/api/issue-types');
                if (res.ok) {
                    const data = await res.json();
                    setIssueTypes(data);
                }
            } catch (e) {
                console.error('Error fetching issue types:', e);
            }
        }
        fetchIssueTypes();
    }, []);

    // Filter states
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [issueType, setIssueType] = useState('');

    // Fetch and filter tickets dynamically
    useEffect(() => {
        async function fetchTickets() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query.trim()) params.append('query', query.trim());
                if (status) params.append('status', status);
                if (priority) params.append('priority', priority);
                if (issueType) params.append('issue_type', issueType);

                const res = await fetch(`/api/tickets?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data);
                }
            } catch (e) {
                console.error('Error fetching tickets:', e);
            } finally {
                setLoading(false);
            }
        }
        
        // Debounce search slightly
        const timer = setTimeout(fetchTickets, 150);
        return () => clearTimeout(timer);
    }, [query, status, priority, issueType]);

    const clearFilters = () => {
        setQuery('');
        setStatus('');
        setPriority('');
        setIssueType('');
    };

    return (
        <div className="page-ticket-list fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">
                        <List style={{ width: 24, height: 24, marginRight: 8, display: 'inline', verticalAlign: 'middle' }} />
                        รายการ Ticket ทั้งหมด
                    </h1>
                    <p className="page-subtitle">ค้นหา ตรวจสอบ และติดตามความคืบหน้าของปัญหาไอทีทั้งหมดในระบบ</p>
                </div>
                <Link href="/create" className="btn btn-primary">
                    <Plus style={{ width: 16, height: 16 }} />
                    แจ้งปัญหาใหม่
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="filter-bar glass-card">
                <div className="search-box">
                    <Search className="search-icon" style={{ width: 18, height: 18 }} />
                    <input 
                        type="text" 
                        className="form-input search-input" 
                        placeholder="ค้นหาด้วย Ticket ID, หัวข้อ หรือรายละเอียด..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                
                <div className="filter-row">
                    <select 
                        className="form-input form-select filter-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">ทุกสถานะ</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Waiting for Information">Waiting for Information</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select 
                        className="form-input form-select filter-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="">ทุกระดับ</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>

                    <select 
                        className="form-input form-select filter-select"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                    >
                        <option value="">ทุกประเภท</option>
                        {issueTypes.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                    </select>

                    <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                        <X style={{ width: 14, height: 14 }} />
                        ล้างตัวกรอง
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="results-header">
                <span className="results-count">
                    {loading ? 'กำลังค้นหา...' : `พบ ${tickets.length} รายการ`}
                </span>
            </div>

            <div id="ticket-list-container">
                {loading ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: '3rem' }}>กำลังโหลดรายการตั๋วปัญหา...</p>
                ) : (
                    <TicketGrid tickets={tickets} />
                )}
            </div>
        </div>
    );
}
