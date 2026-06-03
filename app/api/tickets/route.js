// ============================================================
// route.js — API Endpoint for Tickets search/filter & create
// Route: /api/tickets
// ============================================================

import { NextResponse } from 'next/server';
import { DbService } from '@/lib/db';
import { NotificationService } from '@/lib/notifications';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const issue_type = searchParams.get('issue_type');
        const assigned_to = searchParams.get('assigned_to');
        const requester_name = searchParams.get('requester_name');
        const requester_email = searchParams.get('requester_email');

        let tickets = await DbService.getTickets();

        if (query) {
            const q = query.toLowerCase().trim();
            tickets = tickets.filter(t =>
                t.ticket_no.toLowerCase().includes(q) ||
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
            );
        }

        if (status) {
            tickets = tickets.filter(t => t.status === status);
        }

        if (priority) {
            tickets = tickets.filter(t => t.priority === priority);
        }

        if (issue_type) {
            tickets = tickets.filter(t => t.issue_type === issue_type);
        }

        if (assigned_to) {
            if (assigned_to === 'unassigned') {
                tickets = tickets.filter(t => !t.assigned_to);
            } else {
                tickets = tickets.filter(t => t.assigned_to === assigned_to);
            }
        }

        if (requester_name) {
            tickets = tickets.filter(t => t.requester_name.toLowerCase().trim() === requester_name.toLowerCase().trim());
        }

        if (requester_email) {
            tickets = tickets.filter(t => t.requester_email && t.requester_email.toLowerCase().trim() === requester_email.toLowerCase().trim());
        }

        return NextResponse.json(tickets);
    } catch (e) {
        console.error('API Error in GET /api/tickets:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Validation
        if (!body.title || !body.description || !body.issue_type || !body.location || !body.requester_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTicket = await DbService.createTicket(body);
        
        // Dispatch notifications (async)
        await NotificationService.dispatch(newTicket, 'create');

        return NextResponse.json(newTicket, { status: 201 });
    } catch (e) {
        console.error('API Error in POST /api/tickets:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
