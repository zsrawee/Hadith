/**
 * Hadith database access layer.
 * Uses sql.js directly (not the `hadith` npm package) to:
 * 1. Avoid bundling the 133MB data directory from the package
 * 2. Properly configure WASM loading on Vercel serverless
 * 3. Support CDN-based DB download for cold starts
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

// sql.js is dynamically imported to control WASM loading
let SQL: any = null;

// Connection state
let db: any = null;
let dbPath: string | null = null;

/** Check if a file exists */
function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/** Get the database download URL from env or construct from Vercel deployment */
function getDBUrl(): string | null {
  if (process.env.HADITH_DB_URL) return process.env.HADITH_DB_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/data/hadith.db`;
  return null;
}

/**
 * Download the DB file to a temp path.
 * Uses fetch() which works in both Node.js 18+ (Vercel) and modern runtimes.
 */
async function downloadDB(targetPath: string): Promise<void> {
  const url = getDBUrl();
  if (!url) {
    throw new Error(
      'Hadith DB not found. Set HADITH_DB_URL env var or deploy via Vercel ' +
      '(the DB is served as a static asset from public/data/hadith.db).'
    );
  }
  console.log('⏳ Downloading hadith database from', url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download DB: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, buffer);
  console.log('✅ Hadith DB downloaded to', targetPath);
}

/** Resolve database path: check cache, then download, then fallback to local dev */
async function resolveDBPath(): Promise<string> {
  const isVercel = !!process.env.VERCEL;
  
  // 1. Check /tmp cache (warm starts and recent downloads)
  const cachePath = path.join(os.tmpdir(), 'hadith-cache', 'hadith.db');
  if (fileExists(cachePath)) {
    console.log('✅ Using cached DB at', cachePath);
    return cachePath;
  }

  // 2. Download from URL (for Vercel or when HADITH_DB_URL is set)
  const dbUrl = getDBUrl();
  if (dbUrl) {
    console.log('⏳ DB not cached, downloading from:', dbUrl);
    try {
      await downloadDB(cachePath);
      return cachePath;
    } catch (downloadErr: any) {
      console.error('❌ DB download failed:', downloadErr.message);
      if (isVercel) {
        throw new Error(
          'Failed to download DB from ' + dbUrl + '. ' +
          'Ensure HADITH_DB_URL is set in Vercel project settings, ' +
          'or the deployment URL serves /data/hadith.db. ' +
          'Original error: ' + downloadErr.message
        );
      }
      // On local, fall through to local file fallback
    }
  } else if (isVercel) {
    // On Vercel with no download URL - this is a config error
    throw new Error(
      'Hadith DB not found on Vercel. ' +
      'Set HADITH_DB_URL in Vercel project settings to the DB file URL, ' +
      'or ensure VERCEL_URL is available for auto-detection.'
    );
  }

  // 3. Fallback: local development paths (only runs locally, not on Vercel)
  const publicPath = path.join(process.cwd(), 'public', 'data', 'hadith.db');
  if (fileExists(publicPath)) {
    console.log('✅ Found local DB at', publicPath);
    return publicPath;
  }

  throw new Error(
    'Hadith DB not found. For local dev: run "npm run prebuild". ' +
    'For Vercel: set HADITH_DB_URL environment variable.'
  );
}

/**
 * Format a raw hadith row from sql.js into a consistent object.
 * Mirrors the hadith package's _formatHadith method.
 */
function formatHadith(row: any): any {
  if (!row) return null;
  return {
    urn: row.urn ? String(row.urn) : '',
    collection_id: parseInt(row.collection_id),
    book_id: parseInt(row.book_id),
    chapter_id: row.chapter_id ? parseInt(row.chapter_id) : null,
    display_number: parseFloat(row.display_number) || 0,
    order_in_book: parseInt(row.order_in_book) || 0,
    narrator_prefix: row.narrator_prefix || '',
    content: row.content || '',
    narrator_postfix: row.narrator_postfix || '',
    narrator_prefix_diacless: row.narrator_prefix_diacless || '',
    content_diacless: row.content_diacless || '',
    narrator_postfix_diacless: row.narrator_postfix_diacless || '',
    comments: row.comments || '',
    grades: row.grades || '',
    narrators: row.narrators || '',
    related_hadiths: row.related_hadiths || '',
  };
}

/** Initialize the database connection */
async function initDB(): Promise<void> {
  if (db) return;

  dbPath = await resolveDBPath();
  console.log('⏳ Loading sql.js WASM...');

  // Load sql.js - uses default WASM resolution (relative to module location)
  // On Vercel: serverComponentsExternalPackages ensures sql.js is kept in node_modules
  // where sql-wasm.wasm is adjacent to sql-wasm.js
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  console.log('⏳ Reading database file...');
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
  console.log('✅ Hadith DB connected from', dbPath);
}

/**
 * Query helper: execute a SQL query and return all rows as objects.
 */
function queryAll(sql: string, params: any[] = []): any[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Query helper: execute a SQL query and return the first row, or null.
 */
function queryOne(sql: string, params: any[] = []): any | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// ──── Public API ────

export const hadithAPI = {
  /** Ensure DB is initialized */
  async ensureConnected(): Promise<void> {
    await initDB();
  },

  // ─── Collections ───

  async getCollections(): Promise<any[]> {
    await initDB();
    return queryAll('SELECT * FROM collection');
  },

  async getCollection(id: number): Promise<any | null> {
    await initDB();
    return queryOne('SELECT * FROM collection WHERE id = ?', [id]);
  },

  // ─── Books ───

  async getBooks(collectionId?: number): Promise<any[]> {
    await initDB();
    if (collectionId !== undefined) {
      return queryAll('SELECT * FROM book WHERE collection_id = ? ORDER BY id', [collectionId]);
    }
    return queryAll('SELECT * FROM book ORDER BY id');
  },

  // ─── Hadiths ───

  async getHadiths(
    collectionId: number,
    options: { limit?: number; offset?: number; bookId?: number } = {}
  ): Promise<{ hadiths: any[]; total: number }> {
    await initDB();

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM hadith_content WHERE c1 = ?';
    const countParams: any[] = [collectionId];
    if (options.bookId) {
      countSql += ' AND c2 = ?';
      countParams.push(options.bookId);
    }
    const countResult = queryOne(countSql, countParams);
    const total = countResult?.total || 0;

    // Get hadiths
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    let dataSql = `
      SELECT
        c0 as urn,
        c1 as collection_id,
        c2 as book_id,
        c3 as display_number,
        c4 as order_in_book,
        c5 as chapter_id,
        c6 as narrator_prefix,
        c7 as content,
        c8 as narrator_postfix,
        c9 as narrator_prefix_diacless,
        c10 as content_diacless,
        c11 as narrator_postfix_diacless,
        c12 as comments,
        c13 as grades,
        c14 as narrators,
        c15 as related_hadiths
      FROM hadith_content
      WHERE c1 = ?
    `;
    const dataParams: any[] = [collectionId];
    if (options.bookId) {
      dataSql += ' AND c2 = ?';
      dataParams.push(options.bookId);
    }
    dataSql += ' ORDER BY c4 LIMIT ? OFFSET ?';
    dataParams.push(limit, offset);

    const rows = queryAll(dataSql, dataParams);
    const hadiths = rows.map(formatHadith);

    // Attach English translations
    const promises = hadiths.map(async (h) => {
      if (h.urn) {
        const en = await queryEnglishByUrn(h.urn);
        return { ...h, english: en };
      }
      return h;
    });

    return { hadiths: await Promise.all(promises), total };
  },

  async getHadithByUrn(urn: string | number): Promise<any | null> {
    await initDB();
    const sql = `
      SELECT
        c0 as urn,
        c1 as collection_id,
        c2 as book_id,
        c3 as display_number,
        c4 as order_in_book,
        c5 as chapter_id,
        c6 as narrator_prefix,
        c7 as content,
        c8 as narrator_postfix,
        c9 as narrator_prefix_diacless,
        c10 as content_diacless,
        c11 as narrator_postfix_diacless,
        c12 as comments,
        c13 as grades,
        c14 as narrators,
        c15 as related_hadiths
      FROM hadith_content
      WHERE c0 = ?
      LIMIT 1
    `;
    const row = queryOne(sql, [String(urn)]);
    if (!row) return null;
    const hadith = formatHadith(row);
    if (hadith.urn) {
      const en = await queryEnglishByUrn(hadith.urn);
      return { ...hadith, english: en };
    }
    return hadith;
  },

  async getRandomHadith(
    collectionId?: number,
    excludeUrn?: string
  ): Promise<any | null> {
    await initDB();

    // Count rows
    let countSql = 'SELECT COUNT(*) as cnt FROM hadith_content';
    const countParams: any[] = [];
    if (collectionId) {
      countSql += ' WHERE c1 = ?';
      countParams.push(collectionId);
    }
    const countResult = queryOne(countSql, countParams);
    const total = countResult?.cnt || 0;
    if (total === 0) return null;

    // Random offset (up to 100 retries to avoid getting the excluded URN)
    for (let attempt = 0; attempt < 100; attempt++) {
      const offset = Math.floor(Math.random() * total);
      let sql = `
        SELECT
          c0 as urn,
          c1 as collection_id,
          c2 as book_id,
          c3 as display_number,
          c4 as order_in_book,
          c5 as chapter_id,
          c6 as narrator_prefix,
          c7 as content,
          c8 as narrator_postfix,
          c9 as narrator_prefix_diacless,
          c10 as content_diacless,
          c11 as narrator_postfix_diacless,
          c12 as comments,
          c13 as grades,
          c14 as narrators,
          c15 as related_hadiths
        FROM hadith_content
      `;
      const params: any[] = [];
      if (collectionId) {
        sql += ' WHERE c1 = ?';
        params.push(collectionId);
      }
      sql += ' LIMIT 1 OFFSET ?';
      params.push(offset);

      const row = queryOne(sql, params);
      if (!row) return null;

      const hadith = formatHadith(row);
      if (excludeUrn && hadith.urn === excludeUrn) continue;

      if (hadith.urn) {
        const en = await queryEnglishByUrn(hadith.urn);
        return { ...hadith, english: en };
      }
      return hadith;
    }

    return null;
  },

  // ─── Search ───

  async search(
    query: string,
    collectionId?: number,
    limit?: number
  ): Promise<{ arabic: any[]; english: any[]; total: number }> {
    await initDB();
    const searchLimit = limit || 20;

    // Arabic search: match against content_diacless (c10)
    const arabicTerms = query
      .split(/[\s,]+/)
      .filter((t) => t.length > 0)
      .map((t) => `%${t}%`);

    let arabicSql = `
      SELECT
        c0 as urn,
        c1 as collection_id,
        c2 as book_id,
        c3 as display_number,
        c4 as order_in_book,
        c5 as chapter_id,
        c6 as narrator_prefix,
        c7 as content,
        c8 as narrator_postfix,
        c9 as narrator_prefix_diacless,
        c10 as content_diacless,
        c11 as narrator_postfix_diacless,
        c12 as comments,
        c13 as grades,
        c14 as narrators,
        c15 as related_hadiths
      FROM hadith_content
      WHERE 1=1
    `;
    const arabicParams: any[] = [];
    for (const term of arabicTerms) {
      arabicSql += ' AND c10 LIKE ?';
      arabicParams.push(term);
    }
    if (collectionId) {
      arabicSql += ' AND c1 = ?';
      arabicParams.push(collectionId);
    }
    arabicSql += ' LIMIT ?';
    arabicParams.push(searchLimit);

    const arabicRows = queryAll(arabicSql, arabicParams).map(formatHadith);

    // English search
    const englishTerms = query
      .split(/[\s,]+/)
      .filter((t) => /[a-zA-Z]/.test(t))
      .map((t) => `%${t}%`);

    let englishHadiths: any[] = [];
    if (englishTerms.length > 0) {
      let englishSql = `
        SELECT
          c0 as urn,
          c1 as book_id,
          c2 as hadith_number,
          c3 as body
        FROM hadith_english
        WHERE 1=1
      `;
      const englishParams: any[] = [];
      for (const term of englishTerms) {
        englishSql += ' AND c3 LIKE ?';
        englishParams.push(term);
      }
      if (collectionId) {
        // Filter by joined collection
        englishSql +=
          ' AND c0 IN (SELECT c0 FROM hadith_content WHERE c1 = ?)';
        englishParams.push(collectionId);
      }
      englishSql += ' LIMIT ?';
      englishParams.push(searchLimit);

      const englishStmt = db.prepare(englishSql);
      if (englishParams.length > 0) englishStmt.bind(englishParams);
      while (englishStmt.step()) {
        englishHadiths.push(englishStmt.getAsObject());
      }
      englishStmt.free();
    }

    // Format English results
    const formattedEnglish = englishHadiths.map((row: any) => ({
      urn: row.urn ? String(row.urn) : '',
      book_id: parseInt(row.book_id) || 0,
      hadith_number: row.hadith_number || '',
      body: row.body || '',
    }));

    return {
      arabic: arabicRows,
      english: formattedEnglish,
      total: arabicRows.length + formattedEnglish.length,
    };
  },

  // ─── Stats ───

  async getStats(): Promise<any> {
    await initDB();
    const collections = await this.getCollections();
    const stats = queryAll(
      'SELECT c1 as collection_id, COUNT(*) as count FROM hadith_content GROUP BY c1'
    );

    return {
      version: '1.0.0',
      collections: collections.map((c: any) => ({
        id: c.id,
        title: c.title,
        title_en: c.title_en,
        status: c.status,
      })),
      statistics: stats,
    };
  },
};

/**
 * Query English translation for a given URN.
 */
async function queryEnglishByUrn(urn: string): Promise<any | null> {
  if (!db) return null;
  const sql = `
    SELECT
      c0 as urn,
      c1 as book_id,
      c2 as hadith_number,
      c3 as body
    FROM hadith_english
    WHERE c0 = ?
    LIMIT 1
  `;
  return queryOne(sql, [urn]);
}
