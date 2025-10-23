#!/usr/bin/env node
/**
 * Setup Verification Script
 *
 * This script checks if your environment is properly configured
 * and helps diagnose common setup issues.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function success(msg: string) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function error(msg: string) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function warning(msg: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

function info(msg: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
}

function header(msg: string) {
  console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`);
}

async function verifySetup() {
  console.log(`${colors.bold}Budget Tracker - Setup Verification${colors.reset}\n`);

  let hasIssues = false;

  // Check 1: .env file exists
  header('1. Checking environment configuration...');
  const envPath = path.join(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    success('.env file exists');

    // Load and verify DATABASE_URL
    dotenv.config();
    if (process.env.DATABASE_URL) {
      success('DATABASE_URL is configured');

      // Check if it's still the example URL
      if (process.env.DATABASE_URL.includes('username:password@host')) {
        warning('DATABASE_URL appears to be using example credentials');
        info('  Please update .env with your actual Neon.tech database URL');
        hasIssues = true;
      }
    } else {
      error('DATABASE_URL not found in .env');
      hasIssues = true;
    }
  } else {
    error('.env file not found');
    info('  Create .env file by copying .env.example:');
    info('  $ cp .env.example .env');
    info('  Then edit .env and add your Neon.tech DATABASE_URL');
    hasIssues = true;
  }

  // Check 2: node_modules exists
  header('2. Checking dependencies...');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  if (fs.existsSync(nodeModulesPath)) {
    success('Dependencies installed');
  } else {
    error('node_modules not found');
    info('  Run: yarn install');
    hasIssues = true;
  }

  // Check 3: Database connection (if .env exists)
  if (fs.existsSync(envPath) && process.env.DATABASE_URL) {
    header('3. Checking database connection...');

    try {
      const { getPool } = await import('../lib/db');
      const pool = getPool();

      const client = await pool.connect();
      success('Successfully connected to database');

      // Check for tables
      const tablesResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      client.release();
      await pool.end();

      if (tablesResult.rows.length === 0) {
        warning('Database is empty - no tables found');
        info('  Run the initialization script:');
        info('  $ yarn db:init');
        hasIssues = true;
      } else {
        success(`Found ${tablesResult.rows.length} table(s):`);
        tablesResult.rows.forEach((row: any) => {
          console.log(`    - ${row.table_name}`);
        });
      }
    } catch (err: any) {
      error('Failed to connect to database');
      console.log(`  ${colors.red}Error: ${err.message}${colors.reset}`);

      if (err.code === 'EAI_AGAIN') {
        info('  This is a DNS resolution error. Possible causes:');
        info('  - Network connectivity issues');
        info('  - DNS server problems');
        info('  - Firewall blocking database connections');
      } else if (err.code === 'ENOTFOUND') {
        info('  Database host not found. Check your DATABASE_URL');
      } else if (err.code === 'ECONNREFUSED') {
        info('  Connection refused. Check if database is running');
      }

      hasIssues = true;
    }
  }

  // Summary
  header('Summary');
  if (hasIssues) {
    console.log(`\n${colors.yellow}${colors.bold}⚠ Setup incomplete - please address the issues above${colors.reset}\n`);
    console.log('Quick setup steps:');
    console.log('1. Create .env file: cp .env.example .env');
    console.log('2. Edit .env and add your Neon.tech DATABASE_URL');
    console.log('3. Install dependencies: yarn install');
    console.log('4. Initialize database: yarn db:init');
    console.log('5. Run this script again: yarn verify:setup\n');
  } else {
    console.log(`\n${colors.green}${colors.bold}✓ Everything looks good! You're ready to go!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('- Start development server: yarn dev');
    console.log('- Test database: yarn db:test\n');
  }
}

// Run verification
verifySetup()
  .catch((err) => {
    console.error(`\n${colors.red}Verification failed:${colors.reset}`, err);
    process.exit(1);
  });
