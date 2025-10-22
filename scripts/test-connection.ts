#!/usr/bin/env node
/**
 * Database connection test script
 *
 * This script tests the connection to the PostgreSQL database
 * and displays basic connection information.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { getPool } from '../lib/db';

async function testConnection() {
  const pool = getPool();

  console.log('Testing database connection...\n');

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');

    // Get database version
    const versionResult = await client.query('SELECT version()');
    console.log('\n📊 Database Info:');
    console.log('Version:', versionResult.rows[0].version.split(',')[0]);

    // Get current database name
    const dbResult = await client.query('SELECT current_database()');
    console.log('Database:', dbResult.rows[0].current_database);

    // Get current user
    const userResult = await client.query('SELECT current_user');
    console.log('User:', userResult.rows[0].current_user);

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\n📋 Existing Tables:');
    if (tablesResult.rows.length === 0) {
      console.log('  No tables found. Run "yarn db:init" to create tables.');
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    }

    // Get row counts if tables exist
    if (tablesResult.rows.length > 0) {
      console.log('\n📈 Table Row Counts:');
      for (const row of tablesResult.rows) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
          console.log(`  ${row.table_name}: ${countResult.rows[0].count} rows`);
        } catch (err) {
          console.log(`  ${row.table_name}: Error counting rows`);
        }
      }
    }

    client.release();
    console.log('\n✅ Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log('\nDatabase connection is working properly.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDatabase connection test failed:', error);
    process.exit(1);
  });
