import React, { useState, useMemo } from 'react';
import { CaseSensitive, Download, Trash2, ArrowRightLeft } from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_TEXT = `freeTools hub: fast & local browser utilities for everyday developers!
convert_variable_names or headline text in one click.`;

const MINOR_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'so', 'the', 'to', 'up', 'via', 'yet'
]);

export function splitIntoWords(line) {
  if (!line || !line.trim()) return [];
  return line
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-./:]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function convertTextCase(text, mode) {
  if (!text) return '';

  switch (mode) {
    case 'uppercase':
      return text.toUpperCase();

    case 'lowercase':
      return text.toLowerCase();

    case 'title':
      return text
        .toLowerCase()
        .split('\n')
        .map((line) => {
          const tokens = line.split(/(\s+)/);
          const wordIndices = tokens
            .map((tok, idx) => (/\S/.test(tok) ? idx : -1))
            .filter((idx) => idx !== -1);

          return tokens
            .map((tok, idx) => {
              if (!/\S/.test(tok)) return tok;
              const isFirstOrLast =
                idx === wordIndices[0] || idx === wordIndices[wordIndices.length - 1];
              const clean = tok.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
              if (!isFirstOrLast && MINOR_WORDS.has(clean)) {
                return tok;
              }
              return tok.replace(/[a-z0-9]/i, (ch) => ch.toUpperCase());
            })
            .join('');
        })
        .join('\n');

    case 'sentence':
      return text
        .toLowerCase()
        .replace(/(^\s*[a-z]|[.!?]\s+[a-z]|\n\s*[a-z])/g, (match) =>
          match.toUpperCase()
        );

    case 'camel':
      return text
        .split('\n')
        .map((line) => {
          const words = splitIntoWords(line).map((w) => w.toLowerCase());
          if (words.length === 0) return '';
          return (
            words[0] +
            words
              .slice(1)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join('')
          );
        })
        .join('\n');

    case 'pascal':
      return text
        .split('\n')
        .map((line) => {
          const words = splitIntoWords(line).map((w) => w.toLowerCase());
          return words
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join('');
        })
        .join('\n');

    case 'snake':
      return text
        .split('\n')
        .map((line) =>
          splitIntoWords(line)
            .map((w) => w.toLowerCase())
            .join('_')
        )
        .join('\n');

    case 'kebab':
      return text
        .split('\n')
        .map((line) =>
          splitIntoWords(line)
            .map((w) => w.toLowerCase())
            .join('-')
        )
        .join('\n');

    case 'constant':
      return text
        .split('\n')
        .map((line) =>
          splitIntoWords(line)
            .map((w) => w.toUpperCase())
            .join('_')
        )
        .join('\n');

    case 'dot':
      return text
        .split('\n')
        .map((line) =>
          splitIntoWords(line)
            .map((w) => w.toLowerCase())
            .join('.')
        )
        .join('\n');

    case 'alternating': {
      let toggle = false;
      return Array.from(text)
        .map((ch) => {
          if (/[a-z]/i.test(ch)) {
            const res = toggle ? ch.toUpperCase() : ch.toLowerCase();
            toggle = !toggle;
            return res;
          }
          return ch;
        })
        .join('');
    }

    case 'inverse':
      return Array.from(text)
        .map((ch) =>
          ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
        )
        .join('');

    default:
      return text;
  }
}

export const CASE_MODES = [
  { id: 'uppercase', label: 'UPPERCASE', example: 'HELLO WORLD' },
  { id: 'lowercase', label: 'lowercase', example: 'hello world' },
  { id: 'title', label: 'Title Case', example: 'Hello World' },
  { id: 'sentence', label: 'Sentence case', example: 'Hello world.' },
  { id: 'camel', label: 'camelCase', example: 'helloWorld' },
  { id: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { id: 'snake', label: 'snake_case', example: 'hello_world' },
  { id: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { id: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { id: 'dot', label: 'dot.case', example: 'hello.world' },
  { id: 'alternating', label: 'aLtErNaTiNg', example: 'hElLo wOrLd' },
  { id: 'inverse', label: 'iNVERSE cASE', example: 'hELLO wORLD' }
];

export default function CaseConverterTool() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [activeMode, setActiveMode] = useState('title');

  const convertedOutput = useMemo(
    () => convertTextCase(input, activeMode),
    [input, activeMode]
  );

  const allPreviews = useMemo(
    () =>
      CASE_MODES.map((m) => ({
        ...m,
        value: convertTextCase(input, m.id)
      })),
    [input]
  );

  return (
    <div className="tool-panel">
      {/* Mode Selector Grid */}
      <div className="case-buttons-grid" role="group" aria-label="Case conversion modes">
        {CASE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`case-mode-btn ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => setActiveMode(mode.id)}
          >
            <strong>{mode.label}</strong>
            <small>{mode.example}</small>
          </button>
        ))}
      </div>

      <div className="tool-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">
            Active Format:{' '}
            <strong>{CASE_MODES.find((m) => m.id === activeMode)?.label}</strong>
          </span>
        </div>
        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!convertedOutput}
            onClick={() => setInput(convertedOutput)}
            title="Replace input with converted output"
          >
            <ArrowRightLeft size={15} />
            <span>Use Output as Input</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setInput(SAMPLE_TEXT)}
          >
            <CaseSensitive size={16} />
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

      {/* Split Input / Output */}
      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="case-input-area" className="pane-title">
              Original Text
            </label>
            <span className="pane-meta">{input.length} chars</span>
          </div>
          <textarea
            id="case-input-area"
            className="code-textarea prose-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to convert..."
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="case-output-area" className="pane-title">
              Converted Output ({CASE_MODES.find((m) => m.id === activeMode)?.label})
            </label>
            <div className="pane-actions">
              <CopyButton text={convertedOutput} label="Copy Output" />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!convertedOutput}
                onClick={() =>
                  downloadTextFile(convertedOutput, `converted-${activeMode}.txt`)
                }
              >
                <Download size={16} />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
          <textarea
            id="case-output-area"
            className="code-textarea prose-textarea output-readonly"
            value={convertedOutput}
            readOnly
            placeholder="Converted text will appear here..."
          />
        </div>
      </div>

      {/* Instant All-Formats Reference Table */}
      <div className="all-cases-section">
        <h3 className="subsection-title">Instant Preview Across All 12 Formats</h3>
        <div className="all-cases-grid">
          {allPreviews.map((item) => (
            <div
              key={item.id}
              className={`all-case-card ${activeMode === item.id ? 'active' : ''}`}
            >
              <div className="all-case-card-header">
                <span className="all-case-label">{item.label}</span>
                <CopyButton
                  text={item.value}
                  label="Copy"
                  className="btn btn-ghost btn-xs"
                  size={14}
                />
              </div>
              <pre className="all-case-preview">{item.value || '—'}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
