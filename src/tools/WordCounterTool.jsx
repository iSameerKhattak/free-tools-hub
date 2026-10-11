import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Sparkles,
  Clock,
  Mic,
  Hash
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

const SAMPLE_TEXT = `FreeTools Hub is a fast, privacy-first collection of browser utilities designed for developers, students, and everyday writers.

Because every tool runs locally inside your web browser, your text, JSON payloads, and documents never leave your device. You can count words, check character limits for social posts or essays, and inspect keyword frequency instantaneously!`;

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
  'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its',
  'let', 'put', 'say', 'she', 'too', 'use', 'with', 'that', 'this', 'from',
  'your', 'have', 'more', 'will', 'into', 'than', 'them', 'then', 'some',
  'what', 'when', 'where', 'which', 'while', 'about', 'after', 'other', 'their',
  'there', 'these', 'those', 'would', 'could', 'should', 'never'
]);

export function formatDurationSeconds(totalSeconds) {
  if (totalSeconds <= 0) return '0 sec';
  if (totalSeconds < 60) return `${Math.ceil(totalSeconds)} sec`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
}

export function analyzeTextStats(text) {
  const raw = text || '';
  const characters = raw.length;
  const charactersNoSpaces = raw.replace(/\s/g, '').length;

  const trimmed = raw.trim();
  const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const words = wordsArray.length;

  const sentences = trimmed
    ? trimmed
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter(Boolean).length
    : 0;

  const paragraphs = trimmed
    ? trimmed
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean).length
    : 0;

  const lines = raw ? raw.split('\n').length : 0;

  // Reading speed ~200 words/min, Speaking speed ~130 words/min
  const readingSeconds = (words / 200) * 60;
  const speakingSeconds = (words / 130) * 60;

  let totalWordChars = 0;
  let longestWord = '';
  const freqMap = new Map();

  for (const rawWord of wordsArray) {
    const cleaned = rawWord
      .toLowerCase()
      .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
    if (!cleaned) continue;
    totalWordChars += cleaned.length;
    if (cleaned.length > longestWord.length) {
      longestWord = cleaned;
    }
    if (cleaned.length >= 3 && !STOP_WORDS.has(cleaned)) {
      freqMap.set(cleaned, (freqMap.get(cleaned) || 0) + 1);
    }
  }

  const avgWordLength = words > 0 ? (totalWordChars / words).toFixed(1) : '0.0';

  const topKeywords = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      density: words > 0 ? ((count / words) * 100).toFixed(1) : '0.0'
    }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTime: formatDurationSeconds(readingSeconds),
    speakingTime: formatDurationSeconds(speakingSeconds),
    avgWordLength,
    longestWord: longestWord || '—',
    topKeywords
  };
}

export default function WordCounterTool() {
  const [text, setText] = useState(SAMPLE_TEXT);

  const stats = useMemo(() => analyzeTextStats(text), [text]);

  const handleNormalizeWhitespace = () => {
    setText((prev) =>
      prev
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  };

  const buildReportText = () => {
    const keywordLines =
      stats.topKeywords.length > 0
        ? stats.topKeywords
            .map((k) => `  - ${k.word}: ${k.count} (${k.density}%)`)
            .join('\n')
        : '  (None)';

    return [
      '=== FreeTools Hub — Word & Character Count Report ===',
      `Words: ${stats.words}`,
      `Characters (with spaces): ${stats.characters}`,
      `Characters (no spaces): ${stats.charactersNoSpaces}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Average Word Length: ${stats.avgWordLength} chars`,
      `Longest Word: ${stats.longestWord}`,
      `Estimated Reading Time (200 WPM): ${stats.readingTime}`,
      `Estimated Speaking Time (130 WPM): ${stats.speakingTime}`,
      '',
      'Top Keywords:',
      keywordLines,
      '',
      '--- Original Text ---',
      text
    ].join('\n');
  };

  return (
    <div className="tool-panel">
      {/* Live Metric Cards Grid */}
      <div className="stats-cards-grid" aria-label="Text statistics">
        <div className="stat-card stat-card-highlight">
          <span className="stat-label">Words</span>
          <strong className="stat-value" data-testid="stat-words">
            {stats.words}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Characters</span>
          <strong className="stat-value" data-testid="stat-chars">
            {stats.characters}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Chars (no spaces)</span>
          <strong className="stat-value" data-testid="stat-chars-no-spaces">
            {stats.charactersNoSpaces}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sentences</span>
          <strong className="stat-value" data-testid="stat-sentences">
            {stats.sentences}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Paragraphs</span>
          <strong className="stat-value" data-testid="stat-paragraphs">
            {stats.paragraphs}
          </strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Lines</span>
          <strong className="stat-value" data-testid="stat-lines">
            {stats.lines}
          </strong>
        </div>
      </div>

      {/* Toolbar */}
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <span className="reading-pill">
            <Clock size={15} />
            Reading time: <strong>{stats.readingTime}</strong>
          </span>
          <span className="reading-pill">
            <Mic size={15} />
            Speaking time: <strong>{stats.speakingTime}</strong>
          </span>
          <span className="reading-pill">
            <Hash size={15} />
            Avg word: <strong>{stats.avgWordLength} chars</strong>
          </span>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleNormalizeWhitespace}
            disabled={!text.trim()}
          >
            <Sparkles size={15} />
            <span>Clean Extra Spaces</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setText(SAMPLE_TEXT)}
          >
            <FileText size={15} />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger-text"
            onClick={() => setText('')}
            disabled={!text}
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Editor + Keyword Sidebar */}
      <div className="word-counter-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="word-counter-textarea" className="pane-title">
              Your Text
            </label>
            <div className="pane-actions">
              <CopyButton text={text} label="Copy Text" />
              <CopyButton
                text={buildReportText()}
                label="Copy Report"
                className="btn btn-secondary"
                disabled={!text.trim()}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!text.trim()}
                onClick={() =>
                  downloadTextFile(buildReportText(), 'word-count-report.txt')
                }
              >
                <Download size={16} />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          <textarea
            id="word-counter-textarea"
            className="code-textarea prose-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your article, essay, social post, or documentation here..."
          />
        </div>

        <aside className="keyword-sidebar">
          <div className="pane-header">
            <span className="pane-title">Top Keyword Density</span>
            <span className="pane-meta">Excludes stop words</span>
          </div>

          {stats.topKeywords.length === 0 ? (
            <div className="keyword-empty">
              <p>Start typing 3+ letter words to see keyword frequency and density.</p>
            </div>
          ) : (
            <ul className="keyword-list">
              {stats.topKeywords.map((item) => (
                <li key={item.word} className="keyword-item">
                  <div className="keyword-item-top">
                    <span className="keyword-word">{item.word}</span>
                    <span className="keyword-badge">
                      {item.count}× ({item.density}%)
                    </span>
                  </div>
                  <div className="keyword-bar-track">
                    <div
                      className="keyword-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(12, parseFloat(item.density) * 6))}%`
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="keyword-extra-meta">
            <div>
              <span>Longest word:</span>
              <strong>{stats.longestWord}</strong>
            </div>
            <div>
              <span>Avg word length:</span>
              <strong>{stats.avgWordLength} chars</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
