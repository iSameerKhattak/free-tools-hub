import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Minimize2,
  ArrowDownAZ,
  Download,
  Trash2,
  FileJson
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_JSON = `{
  "service": "FreeTools Hub",
  "version": 1.0,
  "localProcessing": true,
  "features": [
    "JSON Formatter",
    "Word Counter",
    "Base64 Converter",
    "QR Code Generator"
  ],
  "author": {
    "role": "Developer",
    "preferences": {
      "theme": "dark",
      "indentation": 2
    }
  }
}`;

export function sortJsonKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const sorted = {};
    Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        sorted[key] = sortJsonKeysDeep(value[key]);
      });
    return sorted;
  }
  return value;
}

export function computeJsonStats(value) {
  let keysCount = 0;
  let maxDepth = 0;

  function traverse(node, depth) {
    if (depth > maxDepth) maxDepth = depth;
    if (Array.isArray(node)) {
      node.forEach((item) => traverse(item, depth + 1));
    } else if (node !== null && typeof node === 'object') {
      const keys = Object.keys(node);
      keysCount += keys.length;
      keys.forEach((k) => traverse(node[k], depth + 1));
    }
  }

  traverse(value, 0);
  const rootType = Array.isArray(value)
    ? `Array (${value.length} items)`
    : value === null
    ? 'null'
    : typeof value === 'object'
    ? `Object (${Object.keys(value).length} top-level keys)`
    : typeof value;

  return { rootType, keysCount, maxDepth };
}

export function extractJsonErrorLocation(rawInput, errorMessage) {
  const posMatch = errorMessage.match(/position\s+(\d+)/i);
  const lineColMatch = errorMessage.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  let line = null;
  let column = null;

  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  } else if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const upToPos = rawInput.slice(0, pos);
    const lines = upToPos.split('\n');
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  }

  let snippet = null;
  if (line !== null) {
    const allLines = rawInput.split('\n');
    const targetLine = allLines[line - 1] ?? '';
    snippet = {
      line,
      column: column || 1,
      lineContent: targetLine
    };
  }

  return {
    message: errorMessage,
    line,
    column,
    snippet
  };
}

export function formatAndValidateJson(rawInput, options = {}) {
  const { indent = 2, minify = false, sortKeys = false } = options;

  if (!rawInput || !rawInput.trim()) {
    return {
      isEmpty: true,
      isValid: false,
      output: '',
      error: null,
      stats: null
    };
  }

  try {
    let parsed = JSON.parse(rawInput);
    if (sortKeys) {
      parsed = sortJsonKeysDeep(parsed);
    }
    const spaceArg = minify ? 0 : indent === 'tab' ? '\t' : Number(indent);
    const output = JSON.stringify(parsed, null, spaceArg);
    const stats = computeJsonStats(parsed);

    return {
      isEmpty: false,
      isValid: true,
      output,
      error: null,
      stats: {
        ...stats,
        bytes: new Blob([output]).size,
        lines: output.split('\n').length
      }
    };
  } catch (err) {
    const errorDetails = extractJsonErrorLocation(rawInput, err.message || 'Invalid JSON syntax');
    return {
      isEmpty: false,
      isValid: false,
      output: '',
      error: errorDetails,
      stats: null
    };
  }
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState('2');
  const [minify, setMinify] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);

  const result = useMemo(
    () =>
      formatAndValidateJson(input, {
        indent: indent === 'tab' ? 'tab' : Number(indent),
        minify,
        sortKeys
      }),
    [input, indent, minify, sortKeys]
  );

  const handleFormatClick = () => {
    setMinify(false);
    if (result.isValid) {
      const formatted = formatAndValidateJson(input, {
        indent: indent === 'tab' ? 'tab' : Number(indent),
        minify: false,
        sortKeys
      });
      if (formatted.isValid) setInput(formatted.output);
    }
  };

  const handleMinifyClick = () => {
    setMinify(true);
  };

  return (
    <div className="tool-panel">
      {/* Control Toolbar */}
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <label htmlFor="json-indent-select" className="toolbar-label">
            Indentation:
          </label>
          <select
            id="json-indent-select"
            className="form-select"
            value={indent}
            disabled={minify}
            onChange={(e) => {
              setMinify(false);
              setIndent(e.target.value);
            }}
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
            <option value="tab">1 Tab</option>
          </select>

          <button
            type="button"
            className={`btn ${!minify ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleFormatClick}
          >
            <Sparkles size={16} />
            <span>Prettify JSON</span>
          </button>

          <button
            type="button"
            className={`btn ${minify ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleMinifyClick}
          >
            <Minimize2 size={16} />
            <span>Minify</span>
          </button>

          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
            />
            <ArrowDownAZ size={15} />
            <span>Sort Keys A→Z</span>
          </label>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMinify(false);
              setInput(SAMPLE_JSON);
            }}
          >
            <FileJson size={16} />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger-text"
            onClick={() => setInput('')}
            disabled={!input}
          >
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Validation Status Banner */}
      {!result.isEmpty && result.isValid && (
        <div className="status-banner status-valid" role="status">
          <div className="status-banner-left">
            <CheckCircle2 size={18} />
            <strong>Valid JSON</strong>
            <span className="status-meta-sep">•</span>
            <span>Root: {result.stats.rootType}</span>
            <span className="status-meta-sep">•</span>
            <span>Total Keys: {result.stats.keysCount}</span>
            <span className="status-meta-sep">•</span>
            <span>Depth: {result.stats.maxDepth}</span>
            <span className="status-meta-sep">•</span>
            <span>{result.stats.bytes} bytes</span>
          </div>
        </div>
      )}

      {!result.isEmpty && !result.isValid && result.error && (
        <div className="status-banner status-error" role="alert">
          <div className="status-error-header">
            <AlertTriangle size={18} />
            <div>
              <strong>Invalid JSON Syntax</strong>
              {result.error.line && (
                <span className="error-location-badge">
                  Line {result.error.line}, Column {result.error.column}
                </span>
              )}
              <p className="error-detail-msg">{result.error.message}</p>
            </div>
          </div>
          {result.error.snippet && (
            <pre className="error-code-snippet">
              <code>
                {`Line ${result.error.snippet.line}: ${result.error.snippet.lineContent}\n`}
                {`${' '.repeat(String(result.error.snippet.line).length + 6 + Math.max(0, result.error.snippet.column - 1))}^`}
              </code>
            </pre>
          )}
        </div>
      )}

      {/* Split Editor / Output Grid */}
      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="json-input-area" className="pane-title">
              Input JSON
            </label>
            <span className="pane-meta">{input.length} chars</span>
          </div>
          <textarea
            id="json-input-area"
            className="code-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste or type raw JSON here (e.g. {"hello": "world"})...'
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="json-output-area" className="pane-title">
              {minify ? 'Minified JSON Output' : 'Formatted JSON Output'}
            </label>
            <div className="pane-actions">
              <CopyButton
                text={result.output}
                disabled={!result.isValid}
                label="Copy JSON"
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!result.isValid}
                onClick={() =>
                  downloadTextFile(
                    result.output,
                    minify ? 'minified.json' : 'formatted.json',
                    'application/json;charset=utf-8'
                  )
                }
              >
                <Download size={16} />
                <span>Download .json</span>
              </button>
            </div>
          </div>
          <textarea
            id="json-output-area"
            className="code-textarea output-readonly"
            value={
              result.isEmpty
                ? ''
                : result.isValid
                ? result.output
                : 'Fix the JSON syntax error highlighted above to generate formatted output.'
            }
            readOnly
            placeholder="Formatted JSON output will appear here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
