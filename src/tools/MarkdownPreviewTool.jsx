import React, { useState, useMemo, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  FileCode2,
  Bold,
  Italic,
  Heading2,
  Code,
  Link,
  List,
  Quote,
  Table,
  Download,
  Trash2
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_MARKDOWN = `# Welcome to FreeTools Hub Markdown Editor

Write **GitHub-Flavored Markdown** on the left and see the **sanitized live HTML preview** on the right.

## Key Features
- **100% Client-Side**: Powered by \`marked\` and sanitized with \`DOMPurify\`.
- **Instant Export**: Download your notes as \`.md\` or a standalone styled \`.html\` page.
- **Formatting Toolbar**: Insert headings, code blocks, links, and tables in one click.

### Code Example
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! Welcome to FreeTools Hub.\`;
}
console.log(greet('Developer'));
\`\`\`

### Feature Comparison Table
| Tool | Local Processing | Export Formats |
| :--- | :---: | :--- |
| Markdown Editor | Yes | \`.md\`, \`.html\` |
| JSON Formatter | Yes | \`.json\` |
| QR Generator | Yes | \`.png\`, \`.svg\` |

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra
`;

marked.setOptions({
  gfm: true,
  breaks: true
});

export function renderSafeMarkdown(markdownText) {
  if (!markdownText) return '';
  const rawHtml = marked.parse(markdownText);
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }
  });
}

export function buildStandaloneHtmlDocument(title, sanitizedBodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.65;
      color: #1e293b;
      max-width: 800px;
      margin: 2.5rem auto;
      padding: 0 1.25rem;
    }
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #f1f5f9;
      border-radius: 6px;
    }
    code { padding: 0.15em 0.4em; }
    pre { padding: 1rem; overflow-x: auto; }
    pre code { padding: 0; background: transparent; }
    blockquote {
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      border-left: 4px solid #3b82f6;
      background: #f8fafc;
      color: #475569;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 0.5rem 0.75rem;
      text-align: left;
    }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
${sanitizedBodyHtml}
</body>
</html>`;
}

export default function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [rightTab, setRightTab] = useState('preview'); // 'preview' | 'html'
  const textareaRef = useRef(null);

  const sanitizedHtml = useMemo(() => renderSafeMarkdown(markdown), [markdown]);

  const insertSnippet = (prefix, suffix = '', placeholder = 'text') => {
    const el = textareaRef.current;
    if (!el) {
      setMarkdown((prev) => `${prev}${prefix}${placeholder}${suffix}`);
      return;
    }
    const start = el.selectionStart ?? markdown.length;
    const end = el.selectionEnd ?? markdown.length;
    const selected = markdown.slice(start, end) || placeholder;
    const updated =
      markdown.slice(0, start) + prefix + selected + suffix + markdown.slice(end);
    setMarkdown(updated);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  return (
    <div className="tool-panel">
      {/* Formatting Toolbar */}
      <div className="tool-toolbar">
        <div className="toolbar-group" role="toolbar" aria-label="Markdown formatting">
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('**', '**', 'bold text')}
            title="Bold"
          >
            <Bold size={14} />
            <span>Bold</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('*', '*', 'italic text')}
            title="Italic"
          >
            <Italic size={14} />
            <span>Italic</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('\n## ', '', 'Section Heading')}
            title="Heading"
          >
            <Heading2 size={14} />
            <span>Heading</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('[', '](https://example.com)', 'link text')}
            title="Link"
          >
            <Link size={14} />
            <span>Link</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('\n```js\n', '\n```\n', '// code here')}
            title="Code block"
          >
            <Code size={14} />
            <span>Code</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('\n> ', '', 'Quoted note')}
            title="Blockquote"
          >
            <Quote size={14} />
            <span>Quote</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => insertSnippet('\n- ', '', 'List item')}
            title="List"
          >
            <List size={14} />
            <span>List</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() =>
              insertSnippet(
                '\n| Column A | Column B |\n| :--- | :--- |\n| Value 1 | Value 2 |\n',
                '',
                ''
              )
            }
            title="Table"
          >
            <Table size={14} />
            <span>Table</span>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMarkdown(SAMPLE_MARKDOWN)}
          >
            <FileCode2 size={15} />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger-text"
            onClick={() => setMarkdown('')}
            disabled={!markdown}
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Split Editor & Preview */}
      <div className="split-editor-grid">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="markdown-editor-textarea" className="pane-title">
              Markdown Input (.md)
            </label>
            <div className="pane-actions">
              <CopyButton text={markdown} label="Copy .md" />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!markdown.trim()}
                onClick={() =>
                  downloadTextFile(
                    markdown,
                    'document.md',
                    'text/markdown;charset=utf-8'
                  )
                }
              >
                <Download size={16} />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <textarea
            id="markdown-editor-textarea"
            ref={textareaRef}
            className="code-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type Markdown here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <div className="segmented-control" role="tablist" aria-label="Preview mode">
              <button
                type="button"
                role="tab"
                aria-selected={rightTab === 'preview'}
                className={`segmented-btn ${rightTab === 'preview' ? 'active' : ''}`}
                onClick={() => setRightTab('preview')}
              >
                Live Preview
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={rightTab === 'html'}
                className={`segmented-btn ${rightTab === 'html' ? 'active' : ''}`}
                onClick={() => setRightTab('html')}
              >
                Sanitized HTML Source
              </button>
            </div>

            <div className="pane-actions">
              <CopyButton
                text={sanitizedHtml}
                label="Copy HTML"
                disabled={!sanitizedHtml}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!sanitizedHtml}
                onClick={() =>
                  downloadTextFile(
                    buildStandaloneHtmlDocument('Markdown Export', sanitizedHtml),
                    'document.html',
                    'text/html;charset=utf-8'
                  )
                }
              >
                <Download size={16} />
                <span>Download .html</span>
              </button>
            </div>
          </div>

          {rightTab === 'preview' ? (
            <div
              className="markdown-preview-surface"
              data-testid="markdown-preview-output"
              dangerouslySetInnerHTML={{
                __html:
                  sanitizedHtml ||
                  '<p class="placeholder-muted">Rendered Markdown preview will appear here...</p>'
              }}
            />
          ) : (
            <textarea
              className="code-textarea output-readonly"
              value={sanitizedHtml}
              readOnly
              aria-label="Sanitized HTML source"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
