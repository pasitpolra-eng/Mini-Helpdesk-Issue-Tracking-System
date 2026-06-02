// ============================================================
// route.js — API Endpoint for analytical dashboard statistics
// Route: /api/stats
// ============================================================

import { NextResponse } from 'next/server';
import { DbService } from '@/lib/db';

export async function GET() {
    try {
        const [tickets, issueTypes] = await Promise.all([
            DbService.getTickets(),
            DbService.getIssueTypes()
        ]);

        const stats = {
            total: tickets.length,
            byStatus: {
                'Open': 0,
                'In Progress': 0,
                'Waiting for Information': 0,
                'Resolved': 0,
                'Closed': 0,
                'Cancelled': 0
            },
            byPriority: {
                'Low': 0,
                'Medium': 0,
                'High': 0,
                'Urgent': 0
            },
            byIssueType: {},
            recentTickets: tickets.slice(0, 5)
        };

        // Initialize issue types count
        issueTypes.forEach(it => {
            stats.byIssueType[it.name] = 0;
        });

        // Count ticket values
        tickets.forEach(t => {
            if (stats.byStatus[t.status] !== undefined) {
                stats.byStatus[t.status]++;
            }
            if (stats.byPriority[t.priority] !== undefined) {
                stats.byPriority[t.priority]++;
            }
            if (t.issue_type) {
                if (stats.byIssueType[t.issue_type] === undefined) {
                    stats.byIssueType[t.issue_type] = 0;
                }
                stats.byIssueType[t.issue_type]++;
            }
        });

        return NextResponse.json(stats);
    } catch (e) {
        console.error('API Error in GET /api/stats:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
