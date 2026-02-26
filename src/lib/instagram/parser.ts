import { ParsedPost } from '@/lib/types';

// 📚 LEARN: "Defensive parsing" means handling all possible formats that
// real-world data comes in, rather than assuming it's perfect.
// Instagram has changed their export format at least 3 times.
// We try each known format and return the first one that works.

interface InstagramExportV1 {
  saved_saved_media: Array<{
    title: string;
    string_map_data: {
      'Saved on': {
        value: string;
        timestamp: number;
      };
    };
  }>;
}

interface InstagramExportV2 {
  saved_posts: Array<{
    title?: string;
    href: string;
    timestamp: number;
  }>;
}

// V3: just an array at root level
type InstagramExportV3 = Array<{
  title?: string;
  href?: string;
  url?: string;
  timestamp?: number;
  saved_on?: number;
}>;

function isV1Format(data: unknown): data is InstagramExportV1 {
  return (
    typeof data === 'object' &&
    data !== null &&
    'saved_saved_media' in data &&
    Array.isArray((data as InstagramExportV1).saved_saved_media)
  );
}

function isV2Format(data: unknown): data is InstagramExportV2 {
  return (
    typeof data === 'object' &&
    data !== null &&
    'saved_posts' in data &&
    Array.isArray((data as InstagramExportV2).saved_posts)
  );
}

function isV3Format(data: unknown): data is InstagramExportV3 {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object';
}

function parseV1(data: InstagramExportV1): ParsedPost[] {
  const results: ParsedPost[] = [];
  for (const item of data.saved_saved_media) {
    const savedOn = item.string_map_data?.['Saved on'];
    if (!savedOn?.value) continue;
    const post: ParsedPost = {
      url: savedOn.value,
      savedAt: savedOn.timestamp || Math.floor(Date.now() / 1000),
    };
    if (item.title) post.caption = item.title;
    results.push(post);
  }
  return results;
}

function parseV2(data: InstagramExportV2): ParsedPost[] {
  const results: ParsedPost[] = [];
  for (const item of data.saved_posts) {
    if (!item.href) continue;
    const post: ParsedPost = {
      url: item.href,
      savedAt: item.timestamp || Math.floor(Date.now() / 1000),
    };
    if (item.title) post.caption = item.title;
    results.push(post);
  }
  return results;
}

function parseV3(data: InstagramExportV3): ParsedPost[] {
  const results: ParsedPost[] = [];
  for (const item of data) {
    const url = item.href || item.url;
    if (!url) continue;
    const post: ParsedPost = {
      url,
      savedAt: item.timestamp || item.saved_on || Math.floor(Date.now() / 1000),
    };
    if (item.title) post.caption = item.title;
    results.push(post);
  }
  return results;
}

// 📚 LEARN: The main parser tries all known formats in order.
// This "try-catch cascade" pattern is common when dealing with unpredictable external data.
export function parseInstagramExport(rawJson: unknown): ParsedPost[] {
  // Try format v1: { saved_saved_media: [...] }
  if (isV1Format(rawJson)) {
    const posts = parseV1(rawJson);
    if (posts.length > 0) return posts;
  }

  // Try format v2: { saved_posts: [...] }
  if (isV2Format(rawJson)) {
    const posts = parseV2(rawJson);
    if (posts.length > 0) return posts;
  }

  // Try format v3: array at root level
  if (isV3Format(rawJson)) {
    const posts = parseV3(rawJson);
    if (posts.length > 0) return posts;
  }

  throw new Error(
    'Unrecognized Instagram export format. Expected one of:\n' +
    '• { "saved_saved_media": [...] } (Instagram Data Export v1)\n' +
    '• { "saved_posts": [...] } (Instagram Data Export v2)\n' +
    '• A root-level array of post objects\n\n' +
    'Please make sure you uploaded the correct JSON file from your Instagram data export.'
  );
}

// 📚 LEARN: URL validation prevents garbage data from entering our store.
// We use a simple regex rather than a full URL parser — good enough for Instagram URLs.
const INSTAGRAM_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?/i;

export function isValidInstagramUrl(url: string): boolean {
  return INSTAGRAM_URL_REGEX.test(url.trim());
}

export function parseUrlList(text: string): ParsedPost[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const posts: ParsedPost[] = [];

  for (const line of lines) {
    if (isValidInstagramUrl(line)) {
      posts.push({
        url: line,
        savedAt: Math.floor(Date.now() / 1000),
      });
    }
  }

  return posts;
}
