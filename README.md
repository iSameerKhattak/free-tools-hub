# FreeTools Hub 🛠️

**FreeTools Hub** is a fast, privacy-first, mobile-friendly collection of **10 essential browser-based utilities** for developers, students, and writers.

Every tool runs **100% locally inside your web browser**—there is no login, no database, no paid API, no AI API, and zero server uploads.

---

## ✨ Features

- **10 Complete Utilities**:
  1. **JSON Formatter & Validator**: Prettify (2 spaces, 4 spaces, or tabs), minify, recursively sort keys A→Z, inspect structure depth/key count, and pinpoint syntax errors by line and column.
  2. **Word & Character Counter**: Real-time word, character (with/without spaces), sentence, paragraph, and line counts, plus reading/speaking time estimates and top keyword density analysis.
  3. **Text Case Converter**: Convert between `UPPERCASE`, `lowercase`, `Title Case`, `Sentence case`, `camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `CONSTANT_CASE`, `dot.case`, `aLtErNaTiNg`, and `iNVERSE cASE` with an instant 12-format comparison grid.
  4. **Base64 Encoder & Decoder**: Full UTF-8 and emoji support (`TextEncoder` / `TextDecoder`), Standard and URL-Safe Base64 modes, and strict alphabet/length validation.
  5. **URL Encoder & Decoder**: Encode or decode URI components (`encodeURIComponent`) or full URLs (`encodeURI`), optional `+` space handling, and an automatic **Query Parameters Inspector Table**.
  6. **UUID Generator**: Generate cryptographically random **UUID v4**, timestamp-ordered **UUID v7** (RFC 9562), or **NIL UUIDs** in bulk (1–500), format with/without hyphens or braces, export as plain text/JSON/SQL, and validate/inspect any existing UUID.
  7. **Timestamp Converter**: Live Unix epoch clock, auto-detected seconds/milliseconds to ISO 8601, UTC, local timezone, and relative time—plus human date strings back to Unix timestamps.
  8. **Text Diff Checker**: Compare two blocks of text or code by **Lines**, **Words**, or **Characters** with `Ignore Whitespace` and `Ignore Case` toggles, visual inline/line highlights, and unified `.diff` patch export.
  9. **Markdown Editor & Preview**: Write GitHub-Flavored Markdown with a formatting toolbar, live HTML preview sanitized with `DOMPurify`, and one-click export to `.md` or standalone styled `.html`.
  10. **QR Code Generator**: Generate custom QR codes for **URLs/Text**, **Wi-Fi Networks**, or **Emails** with adjustable error correction (`L`, `M`, `Q`, `H`), size, quiet margin, custom colors, and instant download as `.PNG` or vector `.SVG`.

- **Built-In UX Conveniences**:
  - Instant search bar (press `/` anywhere to focus search) and category filter tabs
  - Light & Dark Mode with system preference detection and `localStorage` persistence
  - One-click **Copy to Clipboard** buttons with visual confirmation
  - One-click **Download** buttons (`.json`, `.txt`, `.diff`, `.md`, `.html`, `.png`, `.svg`)
  - **Load Sample** and **Clear** buttons in every tool
  - Clear, friendly validation and error messages

---

## 📦 Open-Source Libraries & License Verification

All dependencies use permissive open-source licenses suitable for personal or commercial public websites:

| Package | Version | License | Purpose |
| :--- | :--- | :--- | :--- |
| `react` & `react-dom` | `^18.3.1` | **MIT** | User interface components and state management |
| `vite` & `@vitejs/plugin-react` | `^6.2.0` | **MIT** | Fast local dev server and static production bundler |
| `lucide-react` | `^0.475.0` | **ISC** | Clean, accessible SVG icons |
| `diff` (`jsdiff`) | `^7.0.0` | **BSD-3-Clause** | Line, word, character, and unified patch text diffing |
| `marked` | `^15.0.7` | **MIT** | Fast GitHub-Flavored Markdown parser |
| `dompurify` | `^3.2.4` | **MPL-2.0 OR Apache-2.0** | Sanitizes rendered Markdown HTML to prevent XSS |
| `qrcode` | `^1.5.4` | **MIT** | Client-side PNG and SVG QR code generation |
| `vitest` & `@testing-library/react` | `^3.0.7` | **MIT** | Automated unit and component testing |

---

## 🗂️ Project Structure (Beginner Guide)

```text
free-tools-hub/
├── index.html                      # Main HTML entry page
├── package.json                    # Dependencies and npm scripts
├── vite.config.js                  # Vite dev server, build, and test config
├── public/
│   └── favicon.svg                 # Site icon
└── src/
    ├── main.jsx                    # Mounts React into index.html
    ├── App.jsx                     # Theme state, hash routing, and page shell
    ├── data/
    │   └── toolsCatalog.js         # Metadata, categories, and keywords for all 10 tools
    ├── components/
    │   ├── Navbar.jsx              # Sticky header, tool quick-jumper, and dark mode toggle
    │   ├── HomePage.jsx            # Hero section, search bar, category tabs, and tool grid
    │   ├── ToolLayout.jsx          # Shared tool wrapper, breadcrumbs, and related tools
    │   ├── CopyButton.jsx          # Reusable copy-to-clipboard button
    │   └── ToolIcon.jsx            # Dynamic Lucide icon renderer
    ├── tools/                      # The 10 individual browser tools
    │   ├── JsonFormatterTool.jsx
    │   ├── WordCounterTool.jsx
    │   ├── CaseConverterTool.jsx
    │   ├── Base64Tool.jsx
    │   ├── UrlEncoderTool.jsx
    │   ├── UuidGeneratorTool.jsx
    │   ├── TimestampConverterTool.jsx
    │   ├── DiffCheckerTool.jsx
    │   ├── MarkdownPreviewTool.jsx
    │   └── QrGeneratorTool.jsx
    ├── utils/
    │   └── clipboardAndDownload.js # Clipboard and file download helpers
    ├── styles/
    │   └── index.css               # Light/Dark mode variables and responsive styles
    └── test/                       # Automated tests for every stage and tool
```

---

## 🚀 Exact Local Setup Instructions

### 1. Prerequisites
Make sure you have **Node.js** (version 18 or newer) installed on your computer. You can verify by running:

```bash
node -v
npm -v
```

### 2. Install Dependencies
Open your terminal in the `free-tools-hub` folder and install the open-source packages:

```bash
npm install
```

### 3. Start the Development Server
Run the local Vite development server with hot reload:

```bash
npm run dev
```

Then open the URL shown in your terminal (typically `http://localhost:5173`) in your browser.

### 4. Run Automated Tests
To run the test suite verifying the homepage and all 10 tools:

```bash
npm test
```

### 5. Build for Production
To compile and minify the website into static HTML, CSS, and JS files inside the `dist/` folder:

```bash
npm run build
```

You can preview the production build locally at any time with:

```bash
npm run preview
```

---

## 🌐 Free Deployment Instructions

Because **FreeTools Hub** is a 100% static client-side web app (and uses hash-based tool URLs like `#/tool/json-formatter`), you can host it **for free** on any static web host without configuring server-side rewrites.

### Option A: Deploy to Vercel (Free)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project** and import your `free-tools-hub` repository.
4. Vercel automatically detects **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site will be live on a `https://*.vercel.app` URL in under a minute.

### Option B: Deploy to Netlify (Free)
1. Push your repository to GitHub.
2. Log in to [netlify.com](https://www.netlify.com) and click **Add new site → Import an existing project**.
3. Select your repository and set:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy site**.

### Option C: Deploy to Cloudflare Pages (Free)
1. Push your repository to GitHub.
2. In your Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select `free-tools-hub` and configure:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

## 📄 License

Released under the **MIT License**.
