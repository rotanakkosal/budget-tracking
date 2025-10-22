import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM income ORDER BY date DESC, created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, desc, amount, notes } = body;

    const result = await query(
      'INSERT INTO income (id, date, description, amount, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, date, desc, amount, notes || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, desc, amount, notes } = body;

    const result = await query(
      'UPDATE income SET date = $2, description = $3, amount = $4, notes = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, date, desc, amount, notes || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json({ error: 'Failed to update income' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await query('DELETE FROM income WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
  }
}
