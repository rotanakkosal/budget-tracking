import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, category, desc, amount, notes } = body;

    const result = await query(
      'INSERT INTO expenses (id, date, category, description, amount, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, date, category, desc, amount, notes || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, category, desc, amount, notes } = body;

    const result = await query(
      'UPDATE expenses SET date = $2, category = $3, description = $4, amount = $5, notes = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, date, category, desc, amount, notes || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
