import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    return NextResponse.json(result.rows.map(row => row.name));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists
    const existing = await query('SELECT id FROM categories WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }

    const id = 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    await query('INSERT INTO categories (id, name) VALUES ($1, $2)', [id, name]);

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
