// ============================================================
// page.js — Create Ticket Page
// Route: /create
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { PlusCircle, Info, User, Send, Loader } from 'lucide-react';
export default function CreateTicketPage() {
    const router = useRouter();
    const { user, setUser, toast, confirm, isRealAuth } = useApp();
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
    const [requesterGroup, setRequesterGroup] = useState(user.group || 'นักศึกษา');
    const [submitting, setSubmitting] = useState(false);
    
    // File upload states
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);

    const handleFileUpload = async (file) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error('ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 10MB)');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setUploadedFiles(prev => [...prev, { name: data.name, url: data.url }]);
                toast.success('อัปโหลดไฟล์เรียบร้อย');
            } else {
                const err = await res.json();
                toast.error(`อัปโหลดล้มเหลว: ${err.error || 'กรุณาลองใหม่อีกครั้ง'}`);
            }
        } catch (e) {
            console.error('Upload error:', e);
            toast.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        } finally {
            setUploadingFile(false);
        }
    };

    // Sync state if simulated user profile loads later
    useEffect(() => {
        setRequesterName(user.name);
        setRequesterEmail(user.email);
        setRequesterGroup(user.group || 'นักศึกษา');
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
            let finalDescription = description.trim();
            if (uploadedFiles.length > 0) {
                finalDescription += '\n\n';
                uploadedFiles.forEach(file => {
                    finalDescription += `📎 [${file.name}](${file.url})\n`;
                });
            }

            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: finalDescription,
                    issue_type: issueType,
                    priority,
                    location: location.trim(),
                    requester_name: requesterName.trim(),
                    requester_email: requesterEmail.trim(),
                    requester_group: requesterGroup
                })
            });

            if (res.ok) {
                const ticket = await res.json();
                
                // Save user profile state for next time
                setUser(requesterName.trim(), requesterEmail.trim(), requesterGroup);

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

                    <div className="form-group">
                        <label className="form-label">ไฟล์แนบ (รูปภาพ หรือ เอกสาร) <span className="optional">(ตัวเลือกเสริม)</span></label>
                        <div 
                            className="file-upload-zone"
                            style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: '8px',
                                padding: '2rem 1.5rem',
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            onDrop={async (e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                const files = Array.from(e.dataTransfer.files);
                                if (files.length > 0) handleFileUpload(files[0]);
                            }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input 
                                type="file" 
                                id="file-input" 
                                style={{ display: 'none' }} 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    if (files.length > 0) handleFileUpload(files[0]);
                                }}
                            />
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                ลากและวางไฟล์ที่นี่ หรือ <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>คลิกเพื่อเลือกไฟล์</span>
                            </p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>
                                รองรับรูปภาพ, PDF, เอกสาร (สูงสุด 10MB)
                            </span>
                        </div>

                        {uploadingFile && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                                <Loader className="animate-spin" style={{ width: 16, height: 16 }} />
                                <span>กำลังอัปโหลดไฟล์...</span>
                            </div>
                        )}

                        {uploadedFiles.length > 0 && (
                            <div className="uploaded-files-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                            📎 {file.name}
                                        </span>
                                        <button 
                                            type="button" 
                                            className="btn btn-danger-ghost btn-sm" 
                                            style={{ padding: '2px 8px', minHeight: 'auto', height: 24, fontSize: '0.8rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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

                        <div className="form-group">
                            <label className="form-label">กลุ่มผู้ใช้งาน <span className="required">*</span></label>
                            <select 
                                className="form-input form-select"
                                required
                                value={requesterGroup}
                                onChange={(e) => setRequesterGroup(e.target.value)}
                                disabled={isRealAuth}
                                style={isRealAuth ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                            >
                                <option value="นักศึกษา">นักศึกษา</option>
                                <option value="อาจารย์">อาจารย์</option>
                                <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                                <option value="เจ้าหน้าที่ผู้รับผิดชอบงาน IT หรือผู้ดูแลอุปกรณ์">เจ้าหน้าที่ IT / ผู้ดูแลอุปกรณ์</option>
                                <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                            </select>
                            {isRealAuth && (
                                <span className="form-hint" style={{ color: 'var(--warning-color, #f59e0b)' }}>
                                    กลุ่มผู้ใช้งานถูกกำหนดจากบัญชีที่เข้าสู่ระบบ
                                </span>
                            )}
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
