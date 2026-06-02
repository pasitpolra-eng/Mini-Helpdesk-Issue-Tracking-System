// ============================================================
// route.js — API Endpoint for Issue Types listing & creation
// Route: /api/issue-types
// ============================================================

import { NextResponse } from 'next/server';
import { DbService } from '@/lib/db';

export async function GET() {
    try {
        const types = await DbService.getIssueTypes();
        return NextResponse.json(types);
    } catch (e) {
        console.error('API Error in GET /api/issue-types:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Validation
        if (!body.name) {
            return NextResponse.json({ error: 'Missing name field' }, { status: 400 });
        }

        const newType = await DbService.createIssueType(body);
        return NextResponse.json(newType, { status: 201 });
    } catch (e) {
        console.error('API Error in POST /api/issue-types:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


