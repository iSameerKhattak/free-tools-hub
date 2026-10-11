import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ToolLayout from './components/ToolLayout';
import { TOOLS_CATALOG } from './data/toolsCatalog';

import JsonFormatterTool from './tools/JsonFormatterTool';
import WordCounterTool from './tools/WordCounterTool';
import CaseConverterTool from './tools/CaseConverterTool';
import Base64Tool from './tools/Base64Tool';
import UrlEncoderTool from './tools/UrlEncoderTool';
import UuidGeneratorTool from './tools/UuidGeneratorTool';
import TimestampConverterTool from './tools/TimestampConverterTool';
import DiffCheckerTool from './tools/DiffCheckerTool';
import MarkdownPreviewTool from './tools/MarkdownPreviewTool';
import QrGeneratorTool from './tools/QrGeneratorTool';

const TOOL_COMPONENTS = {
  'json-formatter': JsonFormatterTool,
  'word-counter': WordCounterTool,
  'case-converter': CaseConverterTool,
  'base64-tool': Base64Tool,
  'url-tool': UrlEncoderTool,
  'uuid-generator': UuidGeneratorTool,
  'timestamp-converter': TimestampConverterTool,
  'diff-checker': DiffCheckerTool,
  'markdown-preview': MarkdownPreviewTool,
  'qr-generator': QrGeneratorTool
};

function parseToolFromHash() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('tool/')) {
    const id = hash.slice(5);
    if (TOOLS_CATALOG.some((t) => t.id === id)) {
      return id;
    }
  }
  return null;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('freetools_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch {
      // ignore localStorage errors
    }
    return 'light';
  });

  const [activeToolId, setActiveToolId] = useState(() => parseToolFromHash());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('freetools_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => {
      setActiveToolId(parseToolFromHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelectTool = (toolId) => {
    setActiveToolId(toolId);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/tool/${toolId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoHome = () => {
    setActiveToolId(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '#/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeTool = TOOLS_CATALOG.find((t) => t.id === activeToolId) || null;
  const ActiveToolComponent = activeTool ? TOOL_COMPONENTS[activeTool.id] : null;

  return (
    <div className="app-shell">
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeToolId={activeToolId}
        onSelectTool={handleSelectTool}
        onGoHome={handleGoHome}
        onQuickSearchFocus={() => searchInputRef.current?.focus()}
      />

      <div className="app-content">
        {activeTool && ActiveToolComponent ? (
          <ToolLayout
            tool={activeTool}
            onSelectTool={handleSelectTool}
            onGoHome={handleGoHome}
          >
            <ActiveToolComponent />
          </ToolLayout>
        ) : (
          <HomePage
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onSelectTool={handleSelectTool}
            searchInputRef={searchInputRef}
          />
        )}
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <strong>FreeTools Hub</strong>
            <p>
              10 fast, privacy-first browser utilities. Built with React, Vite, and
              permissive open-source libraries (MIT / ISC / BSD-3-Clause). Zero server
              uploads, no login, and free forever.
            </p>
          </div>
          <div className="footer-links-col">
            <span className="footer-heading">Quick Jump to Tools</span>
            <div className="footer-tools-links">
              {TOOLS_CATALOG.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className="footer-tool-link"
                  onClick={() => handleSelectTool(tool.id)}
                >
                  {tool.number}. {tool.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
