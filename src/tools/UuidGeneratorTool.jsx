import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

function getRandomBytes(count) {
  const bytes = new Uint8Array(count);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < count; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

function bytesToUuidHex(bytes) {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20, 32)}`;
}

export function generateUuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122/9562 variant
  return bytesToUuidHex(bytes);
}

export function generateUuidV7(nowMs = Date.now()) {
  const bytes = getRandomBytes(16);
  const timestamp = BigInt(nowMs);
  bytes[0] = Number((timestamp >> 40n) & 0xffn);
  bytes[1] = Number((timestamp >> 32n) & 0xffn);
  bytes[2] = Number((timestamp >> 24n) & 0xffn);
  bytes[3] = Number((timestamp >> 16n) & 0xffn);
  bytes[4] = Number((timestamp >> 8n) & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // Version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 9562 variant
  return bytesToUuidHex(bytes);
}

export function formatUuidString(uuid, { uppercase = false, hyphens = true, braces = false } = {}) {
  let out = hyphens ? uuid : uuid.replace(/-/g, '');
  out = uppercase ? out.toUpperCase() : out.toLowerCase();
  if (braces) out = `{${out}}`;
  return out;
}

export function validateAndInspectUuid(input) {
  if (!input || !input.trim()) {
    return { isEmpty: true, isValid: false };
  }
  const cleaned = input.trim().replace(/^\{|\}$/g, '');
  const withHyphens =
    /^[0-9a-fA-F]{32}$/.test(cleaned)
      ? `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(
          12,
          16
        )}-${cleaned.slice(16, 20)}-${cleaned.slice(20, 32)}`
      : cleaned;

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (!uuidRegex.test(withHyphens)) {
    return {
      isEmpty: false,
      isValid: false,
      error:
        'Invalid UUID format: expected 32 hexadecimal digits in 8-4-4-4-12 format (e.g. 550e8400-e29b-41d4-a716-446655440000).'
    };
  }

  const lower = withHyphens.toLowerCase();
  if (lower === '00000000-0000-0000-0000-000000000000') {
    return {
      isEmpty: false,
      isValid: true,
      normalized: lower,
      version: 'NIL (All Zeros)',
      variant: 'Special NIL UUID'
    };
  }

  const versionChar = lower.charAt(14);
  const variantChar = parseInt(lower.charAt(19), 16);

  let variant = 'Unknown';
  if ((variantChar & 0x8) === 0) variant = 'NCS backward compatible';
  else if ((variantChar & 0xc) === 0x8) variant = 'RFC 4122 / RFC 9562 Standard';
  else if ((variantChar & 0xe) === 0xc) variant = 'Microsoft GUID';
  else variant = 'Reserved';

  let extractedDate = null;
  if (versionChar === '7') {
    const hexTs = lower.slice(0, 8) + lower.slice(9, 13);
    const ms = parseInt(hexTs, 16);
    if (!Number.isNaN(ms)) {
      extractedDate = new Date(ms).toISOString();
    }
  }

  return {
    isEmpty: false,
    isValid: true,
    normalized: lower,
    version: `Version ${versionChar}`,
    variant,
    extractedDate
  };
}

export default function UuidGeneratorTool() {
  const [version, setVersion] = useState('v4'); // 'v4' | 'v7' | 'nil'
  const [quantityInput, setQuantityInput] = useState('5');
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [outputFormat, setOutputFormat] = useState('lines'); // 'lines' | 'json' | 'sql'
  const [rawUuids, setRawUuids] = useState(() =>
    Array.from({ length: 5 }, () => generateUuidV4())
  );
  const [inspectInput, setInspectInput] = useState('');

  const parsedQty = Number(quantityInput);
  const quantityError =
    !Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 500
      ? 'Please enter a whole number between 1 and 500.'
      : null;

  const generateBatch = (targetVersion = version, targetCount = parsedQty) => {
    const safeCount =
      Number.isInteger(targetCount) && targetCount >= 1 && targetCount <= 500
        ? targetCount
        : 5;

    if (targetVersion === 'nil') {
      setRawUuids(['00000000-0000-0000-0000-000000000000']);
      return;
    }

    const baseNow = Date.now();
    const list = Array.from({ length: safeCount }, (_, idx) =>
      targetVersion === 'v7' ? generateUuidV7(baseNow + idx) : generateUuidV4()
    );
    setRawUuids(list);
  };

  const formattedList = useMemo(
    () =>
      rawUuids.map((id) =>
        formatUuidString(id, { uppercase, hyphens, braces })
      ),
    [rawUuids, uppercase, hyphens, braces]
  );

  const combinedOutput = useMemo(() => {
    if (outputFormat === 'json') {
      return JSON.stringify(formattedList, null, 2);
    }
    if (outputFormat === 'sql') {
      return `(${formattedList.map((u) => `'${u}'`).join(', ')})`;
    }
    return formattedList.join('\n');
  }, [formattedList, outputFormat]);

  const inspection = useMemo(
    () => validateAndInspectUuid(inspectInput),
    [inspectInput]
  );

  return (
    <div className="tool-panel">
      {/* Controls */}
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <label htmlFor="uuid-version-select" className="toolbar-label">
            Version:
          </label>
          <select
            id="uuid-version-select"
            className="form-select"
            value={version}
            onChange={(e) => {
              const nextVer = e.target.value;
              setVersion(nextVer);
              generateBatch(nextVer, parsedQty);
            }}
          >
            <option value="v4">UUID v4 (Cryptographically Random)</option>
            <option value="v7">UUID v7 (Timestamp-Ordered RFC 9562)</option>
            <option value="nil">NIL UUID (All Zeros)</option>
          </select>

          <label htmlFor="uuid-qty-input" className="toolbar-label">
            Count (1–500):
          </label>
          <input
            id="uuid-qty-input"
            type="number"
            min="1"
            max="500"
            className="form-input form-input-sm"
            value={quantityInput}
            disabled={version === 'nil'}
            onChange={(e) => {
              const val = e.target.value;
              setQuantityInput(val);
              const num = Number(val);
              if (Number.isInteger(num) && num >= 1 && num <= 500) {
                generateBatch(version, num);
              }
            }}
          />

          <button
            type="button"
            className="btn btn-primary"
            disabled={Boolean(quantityError)}
            onClick={() => generateBatch(version, parsedQty)}
          >
            <RefreshCw size={16} />
            <span>Regenerate UUIDs</span>
          </button>
        </div>

        <div className="toolbar-group">
          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
            />
            <span>Hyphens (-)</span>
          </label>

          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
            <span>UPPERCASE</span>
          </label>

          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={braces}
              onChange={(e) => setBraces(e.target.checked)}
            />
            <span>Braces {'{ }'}</span>
          </label>

          <select
            className="form-select"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            aria-label="Output wrapper format"
          >
            <option value="lines">Plain Text (One per line)</option>
            <option value="json">JSON Array</option>
            <option value="sql">SQL IN (...) List</option>
          </select>
        </div>
      </div>

      {quantityError && (
        <div className="status-banner status-error" role="alert">
          <div className="status-error-header">
            <AlertTriangle size={18} />
            <div>
              <strong>Invalid Quantity</strong>
              <p className="error-detail-msg">{quantityError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Output Split */}
      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <span className="pane-title">
              Generated UUIDs ({formattedList.length})
            </span>
            <div className="pane-actions">
              <CopyButton text={combinedOutput} label="Copy All" />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  downloadTextFile(
                    combinedOutput,
                    outputFormat === 'json' ? 'uuids.json' : 'uuids.txt'
                  )
                }
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>

          {formattedList.length <= 15 && outputFormat === 'lines' ? (
            <ul className="uuid-interactive-list">
              {formattedList.map((uuid, idx) => (
                <li key={`${uuid}-${idx}`} className="uuid-list-row">
                  <code className="uuid-code">{uuid}</code>
                  <div className="uuid-row-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setInspectInput(uuid)}
                      title="Inspect this UUID"
                    >
                      Inspect
                    </button>
                    <CopyButton
                      text={uuid}
                      label="Copy"
                      className="btn btn-secondary btn-xs"
                      size={13}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <textarea
              className="code-textarea output-readonly"
              value={combinedOutput}
              readOnly
              aria-label="Bulk UUID output"
              spellCheck={false}
            />
          )}
        </div>

        {/* UUID Validator & Inspector */}
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="uuid-inspect-input" className="pane-title">
              <Fingerprint size={16} /> UUID Validator &amp; Version Inspector
            </label>
          </div>
          <div className="inspector-card-body">
            <p className="helper-text">
              Paste any UUID string below to verify its structure, RFC variant, and version
              (including embedded timestamps for UUID v7).
            </p>
            <input
              id="uuid-inspect-input"
              type="text"
              className="form-input code-input"
              value={inspectInput}
              onChange={(e) => setInspectInput(e.target.value)}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              spellCheck={false}
            />

            {!inspection.isEmpty && inspection.isValid && (
              <div className="inspection-result valid" role="status">
                <div className="inspection-badge-row">
                  <CheckCircle2 size={18} />
                  <strong>Valid UUID</strong>
                </div>
                <dl className="inspection-dl">
                  <div>
                    <dt>Canonical Form</dt>
                    <dd>
                      <code>{inspection.normalized}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>Detected Version</dt>
                    <dd>{inspection.version}</dd>
                  </div>
                  <div>
                    <dt>Variant</dt>
                    <dd>{inspection.variant}</dd>
                  </div>
                  {inspection.extractedDate && (
                    <div>
                      <dt>Embedded v7 Timestamp</dt>
                      <dd>
                        <code>{inspection.extractedDate}</code>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {!inspection.isEmpty && !inspection.isValid && (
              <div className="inspection-result invalid" role="alert">
                <div className="inspection-badge-row">
                  <AlertTriangle size={18} />
                  <strong>Invalid UUID</strong>
                </div>
                <p>{inspection.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
