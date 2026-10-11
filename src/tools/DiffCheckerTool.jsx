import React, { useState, useMemo } from 'react';
import {
  diffLines,
  diffWords,
  diffChars,
  createTwoFilesPatch
} from 'diff';
import {
  GitCompare,
  ArrowRightLeft,
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_LEFT = `function calculateTotal(items) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.qty;
  }
  return subtotal;
}`;

const SAMPLE_RIGHT = `function calculateTotal(items, taxRate = 0.08) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * taxRate;
  return Number((subtotal + tax).toFixed(2));
}`;

export function computeTextDiff(
  originalText = '',
  modifiedText = '',
  { granularity = 'lines', ignoreWhitespace = false, ignoreCase = false } = {}
) {
  const opts = { ignoreWhitespace, ignoreCase };

  let parts = [];
  if (granularity === 'chars') {
    parts = diffChars(originalText, modifiedText, opts);
  } else if (granularity === 'words') {
    parts = diffWords(originalText, modifiedText, opts);
  } else {
    parts = diffLines(originalText, modifiedText, opts);
  }

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  parts.forEach((p) => {
    const unitCount =
      granularity === 'lines'
        ? p.count || p.value.split('\n').filter(Boolean).length || 1
        : 1;
    if (p.added) addedCount += unitCount;
    else if (p.removed) removedCount += unitCount;
    else unchangedCount += unitCount;
  });

  const isIdentical = addedCount === 0 && removedCount === 0;
  const unifiedPatch = createTwoFilesPatch(
    'original.txt',
    'modified.txt',
    originalText,
    modifiedText,
    'Original',
    'Modified'
  );

  return {
    parts,
    addedCount,
    removedCount,
    unchangedCount,
    isIdentical,
    unifiedPatch
  };
}

export default function DiffCheckerTool() {
  const [originalText, setOriginalText] = useState(SAMPLE_LEFT);
  const [modifiedText, setModifiedText] = useState(SAMPLE_RIGHT);
  const [granularity, setGranularity] = useState('lines'); // 'lines' | 'words' | 'chars'
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [viewMode, setViewMode] = useState('highlight'); // 'highlight' | 'patch'

  const diffResult = useMemo(
    () =>
      computeTextDiff(originalText, modifiedText, {
        granularity,
        ignoreWhitespace,
        ignoreCase
      }),
    [originalText, modifiedText, granularity, ignoreWhitespace, ignoreCase]
  );

  const handleSwap = () => {
    setOriginalText(modifiedText);
    setModifiedText(originalText);
  };

  return (
    <div className="tool-panel">
      {/* Toolbar */}
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <div className="segmented-control" role="tablist" aria-label="Diff granularity">
            <button
              type="button"
              role="tab"
              aria-selected={granularity === 'lines'}
              className={`segmented-btn ${granularity === 'lines' ? 'active' : ''}`}
              onClick={() => setGranularity('lines')}
            >
              Lines
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={granularity === 'words'}
              className={`segmented-btn ${granularity === 'words' ? 'active' : ''}`}
              onClick={() => setGranularity('words')}
            >
              Words
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={granularity === 'chars'}
              className={`segmented-btn ${granularity === 'chars' ? 'active' : ''}`}
              onClick={() => setGranularity('chars')}
            >
              Characters
            </button>
          </div>

          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            />
            <span>Ignore Whitespace</span>
          </label>

          <label className="checkbox-pill">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
            <span>Ignore Case</span>
          </label>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSwap}
            title="Swap Original and Modified text"
          >
            <ArrowRightLeft size={15} />
            <span>Swap Sides</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setOriginalText(SAMPLE_LEFT);
              setModifiedText(SAMPLE_RIGHT);
            }}
          >
            <GitCompare size={15} />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger-text"
            onClick={() => {
              setOriginalText('');
              setModifiedText('');
            }}
            disabled={!originalText && !modifiedText}
          >
            <Trash2 size={15} />
            <span>Clear Both</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Inputs */}
      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="diff-original-input" className="pane-title">
              Original Text (A)
            </label>
            <span className="pane-meta">
              {originalText.split('\n').length} lines • {originalText.length} chars
            </span>
          </div>
          <textarea
            id="diff-original-input"
            className="code-textarea"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text or code here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="diff-modified-input" className="pane-title">
              Modified Text (B)
            </label>
            <span className="pane-meta">
              {modifiedText.split('\n').length} lines • {modifiedText.length} chars
            </span>
          </div>
          <textarea
            id="diff-modified-input"
            className="code-textarea"
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text or code here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff Results Section */}
      <div className="diff-output-card">
        <div className="pane-header">
          <div className="diff-stats-summary">
            <span className="pane-title">Comparison Result</span>
            {diffResult.isIdentical ? (
              <span className="diff-badge diff-badge-identical" data-testid="diff-identical">
                <CheckCircle2 size={14} /> Texts are identical
              </span>
            ) : (
              <>
                <span className="diff-badge diff-badge-added" data-testid="diff-added">
                  +{diffResult.addedCount} added
                </span>
                <span className="diff-badge diff-badge-removed" data-testid="diff-removed">
                  −{diffResult.removedCount} removed
                </span>
              </>
            )}
          </div>

          <div className="pane-actions">
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${viewMode === 'highlight' ? 'active' : ''}`}
                onClick={() => setViewMode('highlight')}
              >
                Visual Highlight
              </button>
              <button
                type="button"
                className={`segmented-btn ${viewMode === 'patch' ? 'active' : ''}`}
                onClick={() => setViewMode('patch')}
              >
                Unified Patch (.diff)
              </button>
            </div>
            <CopyButton
              text={diffResult.unifiedPatch}
              label="Copy Patch"
              className="btn btn-secondary"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                downloadTextFile(diffResult.unifiedPatch, 'changes.diff')
              }
            >
              <Download size={16} />
              <span>Download .diff</span>
            </button>
          </div>
        </div>

        {viewMode === 'patch' ? (
          <pre className="diff-patch-pre">{diffResult.unifiedPatch}</pre>
        ) : granularity === 'lines' ? (
          <div className="diff-lines-container" role="region" aria-label="Line diff output">
            {diffResult.parts.map((part, idx) => {
              const rawLines = part.value.replace(/\n$/, '').split('\n');
              const typeClass = part.added
                ? 'diff-line-added'
                : part.removed
                ? 'diff-line-removed'
                : 'diff-line-unchanged';
              const prefix = part.added ? '+' : part.removed ? '-' : ' ';

              return rawLines.map((lineText, lineIdx) => (
                <div
                  key={`${idx}-${lineIdx}`}
                  className={`diff-line-row ${typeClass}`}
                >
                  <span className="diff-line-prefix">{prefix}</span>
                  <code className="diff-line-code">{lineText || ' '}</code>
                </div>
              ));
            })}
          </div>
        ) : (
          <pre className="diff-inline-pre" role="region" aria-label="Inline diff output">
            {diffResult.parts.map((part, idx) => {
              if (part.added) {
                return (
                  <ins key={idx} className="diff-inline-added">
                    {part.value}
                  </ins>
                );
              }
              if (part.removed) {
                return (
                  <del key={idx} className="diff-inline-removed">
                    {part.value}
                  </del>
                );
              }
              return <span key={idx}>{part.value}</span>;
            })}
          </pre>
        )}
      </div>
    </div>
  );
}
