import React, { useState, useMemo } from 'react';
import {
  Link2,
  ArrowRightLeft,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Table
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_URL =
  'https://freetools.example.com/search?q=json formatter & validator&category=developer+tools&lang=en#top';

export function processUrlTransform(
  input,
  { mode = 'encode', scope = 'component', spaceAsPlus = false } = {}
) {
  if (!input) {
    return { ok: true, output: '', error: null };
  }

  try {
    if (mode === 'encode') {
      let encoded =
        scope === 'full' ? encodeURI(input) : encodeURIComponent(input);
      if (spaceAsPlus) {
        encoded = encoded.replace(/%20/g, '+');
      }
      return { ok: true, output: encoded, error: null };
    } else {
      const prepped = spaceAsPlus ? input.replace(/\+/g, '%20') : input;
      const decoded =
        scope === 'full' ? decodeURI(prepped) : decodeURIComponent(prepped);
      return { ok: true, output: decoded, error: null };
    }
  } catch (err) {
    return {
      ok: false,
      output: '',
      error:
        'Malformed URL percent-encoding sequence (for example, an incomplete "%2" or invalid UTF-8 hex byte). Check your "%" characters.'
    };
  }
}

export function parseUrlDetails(raw) {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const params = [];
      url.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      return {
        isFullUrl: true,
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        hash: url.hash,
        params
      };
    }

    if (trimmed.includes('=') && (trimmed.includes('&') || trimmed.startsWith('?'))) {
      const query = trimmed.startsWith('?') ? trimmed.slice(1) : trimmed;
      const searchParams = new URLSearchParams(query);
      const params = [];
      searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      if (params.length > 0) {
        return {
          isFullUrl: false,
          params
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export default function UrlEncoderTool() {
  const [mode, setMode] = useState('encode'); // 'encode' | 'decode'
  const [scope, setScope] = useState('component'); // 'component' | 'full'
  const [spaceAsPlus, setSpaceAsPlus] = useState(false);
  const [input, setInput] = useState(SAMPLE_URL);

  const result = useMemo(
    () => processUrlTransform(input, { mode, scope, spaceAsPlus }),
    [input, mode, scope, spaceAsPlus]
  );

  const urlDetails = useMemo(() => {
    const candidate = mode === 'decode' && result.ok ? result.output : input;
    return parseUrlDetails(candidate);
  }, [input, mode, result]);

  const handleSwap = () => {
    if (!result.ok || !result.output) return;
    setInput(result.output);
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="tool-panel">
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <div className="segmented-control" role="tablist" aria-label="URL mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'encode'}
              className={`segmented-btn ${mode === 'encode' ? 'active' : ''}`}
              onClick={() => setMode('encode')}
            >
              Encode URL
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'decode'}
              className={`segmented-btn ${mode === 'decode' ? 'active' : ''}`}
              onClick={() => setMode('decode')}
            >
              Decode URL
            </button>
          </div>

          <select
            className="form-select"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            aria-label="Encoding scope"
          >
            <option value="component">
              URI Component (encodeURIComponent — encodes /, ?, &amp;, =)
            </option>
            <option value="full">
              Full URL (encodeURI — keeps https://, /, ?, &amp;, =)
            </option>
          </select>

          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={spaceAsPlus}
              onChange={(e) => setSpaceAsPlus(e.target.checked)}
            />
            <span>Treat spaces as &quot;+&quot; (Form Query)</span>
          </label>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSwap}
            disabled={!result.ok || !result.output}
          >
            <ArrowRightLeft size={15} />
            <span>Swap Input ↔ Output</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMode('encode');
              setInput(SAMPLE_URL);
            }}
          >
            <Link2 size={15} />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger-text"
            onClick={() => setInput('')}
            disabled={!input}
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {!result.ok && result.error && (
        <div className="status-banner status-error" role="alert">
          <div className="status-error-header">
            <AlertTriangle size={18} />
            <div>
              <strong>URL Decoding Error</strong>
              <p className="error-detail-msg">{result.error}</p>
            </div>
          </div>
        </div>
      )}

      {result.ok && input.trim() && (
        <div className="status-banner status-valid" role="status">
          <div className="status-banner-left">
            <CheckCircle2 size={18} />
            <strong>
              {mode === 'encode' ? 'URL Successfully Encoded' : 'URL Successfully Decoded'}
            </strong>
            <span className="status-meta-sep">•</span>
            <span>
              Mode: {scope === 'component' ? 'URI Component' : 'Full URI'}
            </span>
          </div>
        </div>
      )}

      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="url-input-area" className="pane-title">
              {mode === 'encode' ? 'Raw URL or Parameter Input' : 'Encoded URL Input'}
            </label>
            <span className="pane-meta">{input.length} chars</span>
          </div>
          <textarea
            id="url-input-area"
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a URL, query parameter, or percent-encoded string..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="url-output-area" className="pane-title">
              {mode === 'encode' ? 'Percent-Encoded Output' : 'Decoded Output'}
            </label>
            <div className="pane-actions">
              <CopyButton
                text={result.output}
                disabled={!result.ok || !result.output}
                label="Copy Output"
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!result.ok || !result.output}
                onClick={() =>
                  downloadTextFile(
                    result.output,
                    mode === 'encode' ? 'url-encoded.txt' : 'url-decoded.txt'
                  )
                }
              >
                <Download size={16} />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
          <textarea
            id="url-output-area"
            className="code-textarea output-readonly"
            value={result.ok ? result.output : ''}
            readOnly
            placeholder="Converted URL output will appear here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Parsed URL & Query Parameters Inspector */}
      {urlDetails && (
        <div className="url-inspector-card">
          <div className="pane-header">
            <span className="pane-title">
              <Table size={16} /> Parsed URL &amp; Query Parameters Inspector
            </span>
          </div>

          {urlDetails.isFullUrl && (
            <div className="url-parts-grid">
              <div className="url-part-box">
                <span>Protocol</span>
                <code>{urlDetails.protocol}</code>
              </div>
              <div className="url-part-box">
                <span>Host</span>
                <code>{urlDetails.host}</code>
              </div>
              <div className="url-part-box">
                <span>Path</span>
                <code>{urlDetails.pathname}</code>
              </div>
              {urlDetails.hash && (
                <div className="url-part-box">
                  <span>Hash</span>
                  <code>{urlDetails.hash}</code>
                </div>
              )}
            </div>
          )}

          {urlDetails.params.length > 0 && (
            <div className="query-params-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parameter Key</th>
                    <th>Decoded Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {urlDetails.params.map((p, idx) => (
                    <tr key={`${p.key}-${idx}`}>
                      <td>
                        <code>{p.key}</code>
                      </td>
                      <td>
                        <code>{p.value}</code>
                      </td>
                      <td>
                        <CopyButton
                          text={p.value}
                          label="Copy"
                          className="btn btn-ghost btn-xs"
                          size={13}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
