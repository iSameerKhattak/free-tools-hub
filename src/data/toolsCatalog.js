export const CATEGORIES = [
  { id: 'all', label: 'All Tools', description: 'All 10 browser-based utilities' },
  { id: 'developer', label: 'Developer & Data', description: 'JSON, timestamps, UUIDs, and code inspection' },
  { id: 'text', label: 'Text & Writing', description: 'Word counting, case conversion, diffing, and Markdown' },
  { id: 'encoders', label: 'Encoders & QR', description: 'Base64, URL encoding, and QR code generation' }
];

export const TOOLS_CATALOG = [
  {
    id: 'json-formatter',
    number: 1,
    name: 'JSON Formatter & Validator',
    shortName: 'JSON Formatter',
    category: 'developer',
    categoryLabel: 'Developer & Data',
    description: 'Prettify, minify, sort keys, and validate JSON data with exact line and column error pinpointing.',
    keywords: ['json', 'format', 'validate', 'prettify', 'minify', 'lint', 'syntax', 'parser', 'sort keys'],
    highlights: ['2 / 4 Space & Tab Indent', 'Line & Column Error Pinpointing', 'Key Sorting & Tree Stats'],
    icon: 'Braces',
    accent: '#2563eb'
  },
  {
    id: 'word-counter',
    number: 2,
    name: 'Word & Character Counter',
    shortName: 'Word Counter',
    category: 'text',
    categoryLabel: 'Text & Writing',
    description: 'Count words, characters, sentences, paragraphs, reading/speaking time, and top keyword density in real time.',
    keywords: ['word', 'character', 'counter', 'length', 'reading time', 'sentences', 'paragraphs', 'keyword density', 'essay'],
    highlights: ['Live Word & Character Stats', 'Reading & Speaking Time', 'Top Keyword Density'],
    icon: 'FileText',
    accent: '#059669'
  },
  {
    id: 'case-converter',
    number: 3,
    name: 'Text Case Converter',
    shortName: 'Case Converter',
    category: 'text',
    categoryLabel: 'Text & Writing',
    description: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE.',
    keywords: ['case', 'uppercase', 'lowercase', 'title case', 'camelCase', 'snake_case', 'kebab-case', 'PascalCase', 'text transform'],
    highlights: ['10+ Naming & Text Formats', 'Instant One-Click Transform', 'Download & Copy Output'],
    icon: 'CaseSensitive',
    accent: '#7c3aed'
  },
  {
    id: 'base64-tool',
    number: 4,
    name: 'Base64 Encoder & Decoder',
    shortName: 'Base64 Converter',
    category: 'encoders',
    categoryLabel: 'Encoders & QR',
    description: 'Encode and decode UTF-8 text and emoji safely to standard or URL-safe Base64 with strict validation.',
    keywords: ['base64', 'encode', 'decode', 'utf8', 'url-safe', 'atob', 'btoa', 'binary'],
    highlights: ['Full UTF-8 & Emoji Support', 'URL-Safe Base64 Option', 'Strict Validation & Error Reporting'],
    icon: 'Binary',
    accent: '#d97706'
  },
  {
    id: 'url-tool',
    number: 5,
    name: 'URL Encoder & Decoder',
    shortName: 'URL Encoder',
    category: 'encoders',
    categoryLabel: 'Encoders & QR',
    description: 'Encode or decode URI components and full URLs, plus inspect and parse URL query parameters into a clean table.',
    keywords: ['url', 'uri', 'encode', 'decode', 'percent', 'query string', 'parameters', 'encodeURIComponent'],
    highlights: ['Component vs Full URL Mode', 'Query String Inspector', 'Malformed Escape Detection'],
    icon: 'Link2',
    accent: '#0891b2'
  },
  {
    id: 'uuid-generator',
    number: 6,
    name: 'UUID Generator',
    shortName: 'UUID Generator',
    category: 'developer',
    categoryLabel: 'Developer & Data',
    description: 'Generate cryptographically random UUID v4, timestamp-ordered UUID v7, NIL UUIDs, and validate existing UUID strings.',
    keywords: ['uuid', 'guid', 'v4', 'v7', 'random', 'unique id', 'identifier', 'bulk generate'],
    highlights: ['UUID v4 (Random) & v7 (Time-Ordered)', 'Bulk Generation up to 500 IDs', 'Format & Hyphen Options + Validator'],
    icon: 'Fingerprint',
    accent: '#4f46e5'
  },
  {
    id: 'timestamp-converter',
    number: 7,
    name: 'Timestamp Converter',
    shortName: 'Timestamp Converter',
    category: 'developer',
    categoryLabel: 'Developer & Data',
    description: 'Convert Unix epoch timestamps (seconds or milliseconds) to ISO 8601, UTC, local time, and relative time—or date back to epoch.',
    keywords: ['timestamp', 'epoch', 'unix', 'date', 'time', 'utc', 'iso 8601', 'milliseconds', 'seconds', 'timezone'],
    highlights: ['Live Unix Clock', 'Auto-Detects Seconds vs Milliseconds', 'Bidirectional Date ↔ Epoch'],
    icon: 'Clock',
    accent: '#e11d48'
  },
  {
    id: 'diff-checker',
    number: 8,
    name: 'Text Diff Checker',
    shortName: 'Diff Checker',
    category: 'text',
    categoryLabel: 'Text & Writing',
    description: 'Compare two blocks of text or code side-by-side or inline by lines, words, or characters with addition/deletion statistics.',
    keywords: ['diff', 'compare', 'difference', 'text', 'code', 'merge', 'lines', 'words', 'changes'],
    highlights: ['Line, Word & Character Diff Modes', 'Ignore Whitespace / Case Options', 'Unified Patch Export'],
    icon: 'GitCompare',
    accent: '#0d9488'
  },
  {
    id: 'markdown-preview',
    number: 9,
    name: 'Markdown Editor & Preview',
    shortName: 'Markdown Editor',
    category: 'text',
    categoryLabel: 'Text & Writing',
    description: 'Write GitHub-Flavored Markdown with formatting toolbar, live sanitized HTML preview, and export to .md or standalone .html.',
    keywords: ['markdown', 'md', 'preview', 'html', 'editor', 'gfm', 'tables', 'documentation', 'readme'],
    highlights: ['Live Split-Pane Preview', 'Formatting Toolbar & Cheat Sheet', 'Export Markdown (.md) or HTML (.html)'],
    icon: 'FileCode2',
    accent: '#9333ea'
  },
  {
    id: 'qr-generator',
    number: 10,
    name: 'QR Code Generator',
    shortName: 'QR Generator',
    category: 'encoders',
    categoryLabel: 'Encoders & QR',
    description: 'Create customizable QR codes for URLs, plain text, Wi-Fi networks, or emails with custom colors, error correction, and PNG/SVG download.',
    keywords: ['qr', 'qrcode', 'barcode', 'wifi', 'image', 'png', 'svg', 'generator', 'scan'],
    highlights: ['Text/URL, Wi-Fi & Email Presets', 'Custom Colors, Size & Error Correction', 'Download High-Res PNG or Vector SVG'],
    icon: 'QrCode',
    accent: '#ea580c'
  }
];
