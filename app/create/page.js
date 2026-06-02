// ============================================================
// page.js — Create Ticket Page
// Route: /create
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PlusCircle, Info, User, Send } from 'lucide-react';
export default function CreateTicketPage() {
    const router = useRouter();
    const { user, setUser, toast, confirm } = useApp();
    const [issueTypes, setIssueTypes] = useState([]);

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
    
    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [issueType, setIssueType] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [location, setLocation] = useState('');
    const [requesterName, setRequesterName] = useState(user.name);
    const [requesterEmail, setRequesterEmail] = useState(user.email);
    const [submitting, setSubmitting] = useState(false);

    // Sync state if simulated user profile loads later
    useEffect(() => {
        setRequesterName(user.name);
        setRequesterEmail(user.email);
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim() || !description.trim() || !issueType || !location.trim() || !requesterName.trim()) {
            toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    issue_type: issueType,
                    priority,
                    location: location.trim(),
                    requester_name: requesterName.trim(),
                    requester_email: requesterEmail.trim()
                })
            });

            if (res.ok) {
                const ticket = await res.json();
                
                // Save user profile state for next time
                setUser(requesterName.trim(), requesterEmail.trim());

                // Reset form
                setTitle('');
                setDescription('');
                setIssueType('');
                setPriority('Medium');
                setLocation('');

                // Display beautiful custom declarative Modal
                confirm(
                    '✅ แจ้งปัญหาสำเร็จ!',
                    '',
                    () => router.push(`/tickets/${ticket.id}`),
                    {
                        confirmText: 'ดูรายละเอียด Ticket',
                        cancelText: 'แจ้งปัญหาเพิ่มเติม',
                        onCancel: () => {},
                        content: (
                            <div className="success-ticket-info">
                                <div className="ticket-id-display">
                                    <span className="label">Ticket ID</span>
                                    <span className="value">{ticket.ticket_no}</span>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                    ปัญหาของคุณถูกบันทึกเข้าระบบเรียบร้อยแล้ว<br />
                                    คุณสามารถใช้เลข Ticket ID นี้ในการติดตามสถานะการดำเนินงานได้
                                </p>
                            </div>
                        )
                    }
                );
            } else {
                const err = await res.json();
                toast.error(`เกิดข้อผิดพลาด: ${err.error || 'ไม่สามารถสร้างตั๋วได้'}`);
            }
        } catch (err) {
            console.error('Error submitting ticket:', err);
            toast.error('ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-create fade-in">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">
                        <PlusCircle style={{ width: 24, height: 24, marginRight: 8, verticalAlign: 'middle', display: 'inline' }} />
                        แจ้งปัญหาใหม่
                    </h1>
                    <p className="page-subtitle">กรอกรายละเอียดปัญหาเพื่อสร้าง Ticket ใหม่ในระบบ</p>
                </div>
            </div>

            <form className="ticket-form glass-card" onSubmit={handleSubmit}>
                {/* Issue Info Section */}
                <div className="form-section">
                    <h3 className="form-section-title">
                        <Info style={{ width: 18, height: 18 }} />
                        ข้อมูลปัญหา
                    </h3>
                    
                    <div className="form-group">
                        <label className="form-label">หัวข้อปัญหา <span className="required">*</span></label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="เช่น คอมพิวเตอร์ห้อง Lab 301 เปิดไม่ติด" 
                            required 
                            maxLength={200}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <span className="form-hint">อธิบายย่อสรุปสั้นๆ ชัดเจน</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">รายละเอียดปัญหา <span className="required">*</span></label>
                        <textarea 
                            className="form-input form-textarea" 
                            placeholder="อธิบายรายละเอียดปัญหา อาการ หรือข้อความแสดงข้อผิดพลาด..." 
                            required 
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">ประเภทปัญหา <span className="required">*</span></label>
                            <select 
                                className="form-input form-select" 
                                required
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                            >
                                <option value="">-- เลือกประเภท --</option>
                                {issueTypes.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">ระดับความเร่งด่วน <span className="required">*</span></label>
                            <select 
                                className="form-input form-select" 
                                required
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="Low">Low — ไม่เร่งด่วน</option>
                                <option value="Medium">Medium — ทั่วไป</option>
                                <option value="High">High — ส่งผลต่อการทำงาน</option>
                                <option value="Urgent">Urgent — ต้องแก้ไขโดยด่วนที่สุด</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">สถานที่เกิดเหตุ <span className="required">*</span></label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="เช่น ห้อง Lab 301 ชั้น 3 อาคาร IT" 
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                {/* Requester Info Section */}
                <div className="form-section">
                    <h3 className="form-section-title">
                        <User style={{ width: 18, height: 18 }} />
                        ข้อมูลผู้แจ้ง
                    </h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">ชื่อผู้แจ้ง <span className="required">*</span></label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="ชื่อ-นามสกุล" 
                                required 
                                value={requesterName}
                                onChange={(e) => setRequesterName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">อีเมลติดต่อ</label>
                            <input 
                                type="email" 
                                className="form-input" 
                                placeholder="email@example.com"
                                value={requesterEmail}
                                onChange={(e) => setRequesterEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => router.push('/')}
                        disabled={submitting}
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg" 
                        disabled={submitting}
                    >
                        <Send style={{ width: 18, height: 18 }} />
                        {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งแจ้งปัญหา'}
                    </button>
                </div>
            </form>
        </div>
    );
}
