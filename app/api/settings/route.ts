import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const result = await query('SELECT value FROM settings WHERE key = $1', [key]);

    if (result.rows.length === 0) {
      return NextResponse.json({ value: null });
    }

    return NextResponse.json({ value: result.rows[0].value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Upsert the setting
    const existing = await query('SELECT id FROM settings WHERE key = $1', [key]);

    if (existing.rows.length > 0) {
      await query(
        'UPDATE settings SET value = $2, updated_at = CURRENT_TIMESTAMP WHERE key = $1',
        [key, value]
      );
    } else {
      const id = 'set-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      await query('INSERT INTO settings (id, key, value) VALUES ($1, $2, $3)', [id, key, value]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
