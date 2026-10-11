import React, { useState, useMemo } from 'react';
import {
  Binary,
  ArrowRightLeft,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_PLAIN = 'FreeTools Hub 🚀 — 100% local UTF-8 Base64 encoding & decoding!';

export function encodeBase64Utf8(input, { urlSafe = false } = {}) {
  if (!input) return { ok: true, output: '', error: null };
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    let encoded = btoa(binary);
    if (urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return { ok: true, output: encoded, error: null };
  } catch (err) {
    return {
      ok: false,
      output: '',
      error: err.message || 'Failed to encode text to Base64.'
    };
  }
}

export function decodeBase64Utf8(input) {
  if (!input || !input.trim()) {
    return { ok: true, output: '', error: null };
  }

  // Remove whitespace/newlines
  const cleaned = input.replace(/\s+/g, '');

  // Validate Base64 / Base64URL character set
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(cleaned)) {
    return {
      ok: false,
      output: '',
      error:
        'Invalid Base64 string: contains characters outside the Base64 alphabet (A–Z, a–z, 0–9, +, /, -, _, =).'
    };
  }

  // Normalize URL-safe Base64 to standard Base64
  let normalized = cleaned.replace(/-/g, '+').replace(/_/g, '/');
  const mod = normalized.length % 4;
  if (mod === 1) {
    return {
      ok: false,
      output: '',
      error:
        'Invalid Base64 length: a valid Base64 string cannot have a remainder of 1 when divided by 4.'
    };
  }
  if (mod > 0) {
    normalized += '='.repeat(4 - mod);
  }

  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const decoded = decoder.decode(bytes);
    return { ok: true, output: decoded, error: null };
  } catch {
    return {
      ok: false,
      output: '',
      error:
        'Could not decode Base64 as valid UTF-8 text. Check that your Base64 string is complete and represents UTF-8 text.'
    };
  }
}

export default function Base64Tool() {
  const [mode, setMode] = useState('encode'); // 'encode' | 'decode'
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState(SAMPLE_PLAIN);

  const result = useMemo(() => {
    if (mode === 'encode') {
      return encodeBase64Utf8(input, { urlSafe });
    }
    return decodeBase64Utf8(input);
  }, [mode, input, urlSafe]);

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    if (result.ok && result.output) {
      setInput(result.output);
    }
    setMode(newMode);
  };

  const handleSwap = () => {
    if (!result.ok) return;
    setInput(result.output);
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="tool-panel">
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <div className="segmented-control" role="tablist" aria-label="Base64 mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'encode'}
              className={`segmented-btn ${mode === 'encode' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('encode')}
            >
              Encode (Text → Base64)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'decode'}
              className={`segmented-btn ${mode === 'decode' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('decode')}
            >
              Decode (Base64 → Text)
            </button>
          </div>

          {mode === 'encode' && (
            <label className="checkbox-pill">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
              />
              <span>URL-Safe Base64 (- and _, no =)</span>
            </label>
          )}
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSwap}
            disabled={!result.ok || !result.output}
            title="Swap input and output and flip mode"
          >
            <ArrowRightLeft size={15} />
            <span>Swap Input ↔ Output</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMode('encode');
              setInput(SAMPLE_PLAIN);
            }}
          >
            <Binary size={15} />
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
              <strong>Base64 Decoding Error</strong>
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
              {mode === 'encode'
                ? urlSafe
                  ? 'Encoded to URL-Safe Base64'
                  : 'Encoded to Standard Base64'
                : 'Valid Base64 Decoded to UTF-8'}
            </strong>
            <span className="status-meta-sep">•</span>
            <span>Input: {new Blob([input]).size} bytes</span>
            <span className="status-meta-sep">•</span>
            <span>Output: {new Blob([result.output]).size} bytes</span>
          </div>
        </div>
      )}

      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="base64-input-area" className="pane-title">
              {mode === 'encode' ? 'Plain UTF-8 Text Input' : 'Base64 String Input'}
            </label>
            <span className="pane-meta">{input.length} chars</span>
          </div>
          <textarea
            id="base64-input-area"
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'Type or paste plain text or UTF-8 emoji to encode...'
                : 'Paste a Base64 or Base64URL string here to decode...'
            }
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="base64-output-area" className="pane-title">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded UTF-8 Text Output'}
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
                    mode === 'encode' ? 'encoded-base64.txt' : 'decoded-text.txt'
                  )
                }
              >
                <Download size={16} />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
          <textarea
            id="base64-output-area"
            className="code-textarea output-readonly"
            value={result.ok ? result.output : ''}
            readOnly
            placeholder="Result will appear here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
