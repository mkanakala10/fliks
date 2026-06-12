import axios from 'axios';
import cheerio from 'cheerio';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

function getFirestoreClient() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const serviceAccountAbsolutePath = path.isAbsolute(SERVICE_ACCOUNT_PATH)
    ? SERVICE_ACCOUNT_PATH
    : path.join(process.cwd(), SERVICE_ACCOUNT_PATH);

  if (!fs.existsSync(serviceAccountAbsolutePath)) {
    throw new Error(`Firebase service account file not found: ${serviceAccountAbsolutePath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountAbsolutePath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin.firestore();
}

function normalizeNumber(value) {
  if (value == null) return null;
  const numeric = String(value)
    .replace(/[^0-9.\-]/g, '')
    .trim();
  return numeric === '' ? null : Number(numeric);
}

function normalizeLanguage(value) {
  if (!value) return 'Unknown';
  const normalized = String(value).trim();
  const mapping = {
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil',
    malayalam: 'Malayalam',
    kannada: 'Kannada',
    english: 'English',
  };
  const key = normalized.toLowerCase();
  return mapping[key] || normalized;
}

export async function scrapeSacnilkBoxOffice(sacnilkUrl) {
  if (!sacnilkUrl) {
    throw new Error('A valid Sacnilk movie URL is required.');
  }

  const response = await axios.get(sacnilkUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BoxOfficeScraper/1.0; +https://example.com)',
    },
  });

  const $ = cheerio.load(response.data);
  const table = $('table')
    .filter((_, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('language') && text.includes('year') && text.includes('collection');
    })
    .first();

  if (!table.length) {
    throw new Error('Could not find a Sacnilk box office table on the provided page.');
  }

  const headers = [];
  table.find('thead tr th, tbody tr th').first().closest('tr').find('th').each((_, th) => {
    headers.push($(th).text().trim().toLowerCase());
  });

  const parsedRows = [];
  table.find('tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (!cells.length) return;

    const rowData = {};
    cells.each((index, cell) => {
      const header = headers[index] || `column_${index}`;
      rowData[header] = $(cell).text().trim();
    });

    const language = normalizeLanguage(rowData.language || rowData['lang'] || rowData['region']);
    const year = parseInt(rowData.year || rowData['release year'] || rowData['yr'], 10) || null;
    const collection = normalizeNumber(rowData.collection || rowData['box office'] || rowData['gross'] || rowData['collections']);

    parsedRows.push({
      language,
      year,
      raw: rowData,
      collection,
    });
  });

  return parsedRows.filter((row) => row.language && row.year);
}

const LANGUAGE_PRIORITY = {
  Hindi: 1,
  Telugu: 2,
  Tamil: 3,
  Malayalam: 4,
  Kannada: 5,
  English: 6,
};

export function sortFinancialData(records) {
  return [...records].sort((a, b) => {
    const langA = LANGUAGE_PRIORITY[a.language] || 999;
    const langB = LANGUAGE_PRIORITY[b.language] || 999;
    if (langA !== langB) {
      return langA - langB;
    }
    if (a.year !== b.year) {
      return (a.year || 0) - (b.year || 0);
    }
    return 0;
  });
}

export async function fetchTmdbMetadata(tmdb_id) {
  if (!tmdb_id) {
    throw new Error('A tmdb_id is required for metadata lookup.');
  }
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY must be set in environment variables.');
  }

  const url = `https://api.themoviedb.org/3/movie/${tmdb_id}`;
  const response = await axios.get(url, {
    params: {
      api_key: TMDB_API_KEY,
      language: 'en-US',
    },
  });

  const data = response.data;
  return {
    tmdbId: data.id,
    title: data.title,
    posterPath: data.poster_path
      ? `https://image.tmdb.org/t/p/original${data.poster_path}`
      : null,
    genres: Array.isArray(data.genres) ? data.genres.map((genre) => genre.name) : [],
  };
}

export async function mergeAndUploadBoxOfficeRecord({ tmdbId, sacnilkUrl }) {
  if (!tmdbId || !sacnilkUrl) {
    throw new Error('Both tmdbId and sacnilkUrl are required to merge and upload a record.');
  }

  const scrapedRecords = await scrapeSacnilkBoxOffice(sacnilkUrl);
  const sortedRecords = sortFinancialData(scrapedRecords);
  const metadata = await fetchTmdbMetadata(tmdbId);

  const mergedDocument = {
    tmdbId: metadata.tmdbId,
    title: metadata.title,
    posterPath: metadata.posterPath,
    genres: metadata.genres,
    sacnilkUrl,
    boxOfficeRecords: sortedRecords,
    updatedAt: new Date().toISOString(),
  };

  const db = getFirestoreClient();
  const docRef = db.collection('box_office_records').doc(`tmdb_${metadata.tmdbId}`);
  await docRef.set(mergedDocument, { merge: true });

  return mergedDocument;
}
