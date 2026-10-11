import React, { useMemo, useEffect } from 'react';
import {
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { CATEGORIES, TOOLS_CATALOG } from '../data/toolsCatalog';
import ToolIcon from './ToolIcon';

export default function HomePage({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSelectTool,
  searchInputRef
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef?.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef]);

  const categoryCounts = useMemo(() => {
    const counts = { all: TOOLS_CATALOG.length };
    for (const cat of CATEGORIES) {
      if (cat.id !== 'all') {
        counts[cat.id] = TOOLS_CATALOG.filter((t) => t.category === cat.id).length;
      }
    }
    return counts;
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TOOLS_CATALOG.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const haystack = [
        tool.name,
        tool.shortName,
        tool.description,
        tool.categoryLabel,
        ...tool.keywords,
        ...tool.highlights
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="homepage-container">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-badge-row">
          <span className="hero-pill">
            <Sparkles size={14} />
            10 Free Browser-Based Utilities
          </span>
          <span className="hero-pill hero-pill-green">
            <ShieldCheck size={14} />
            Zero Server Uploads • 100% Client-Side
          </span>
        </div>

        <h1 className="hero-title">
          Everyday Developer &amp; Text Tools,{' '}
          <span className="hero-title-gradient">Instant &amp; Private</span>
        </h1>

        <p className="hero-subtitle">
          Format JSON, count words, convert text cases, encode Base64 &amp; URLs, generate UUIDs
          and QR codes, inspect timestamps, diff text, and preview Markdown—all right inside your
          browser with no sign-ups, no ads, and no cloud tracking.
        </p>

        {/* Search Box */}
        <div className="hero-search-wrapper">
          <div className="search-box">
            <Search size={20} className="search-box-icon" />
            <input
              ref={searchInputRef}
              type="search"
              className="search-box-input"
              placeholder="Search tools by name or keyword (e.g., JSON, Base64, UUID, Markdown, epoch)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search tools"
            />
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <kbd className="search-shortcut-kbd" title="Press / to focus search">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-tabs" role="tablist" aria-label="Tool categories">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`category-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onCategoryChange(cat.id)}
              >
                <span>{cat.label}</span>
                <span className="category-count-badge">{categoryCounts[cat.id]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Header */}
      <section className="tools-catalog-section" aria-label="Tools directory">
        <div className="catalog-status-bar">
          <p className="catalog-count-text">
            Showing <strong>{filteredTools.length}</strong> of{' '}
            <strong>{TOOLS_CATALOG.length}</strong> tools
            {selectedCategory !== 'all' && (
              <>
                {' '}
                in{' '}
                <strong>
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </strong>
              </>
            )}
            {searchQuery.trim() && (
              <>
                {' '}
                matching <strong>“{searchQuery.trim()}”</strong>
              </>
            )}
          </p>

          {(searchQuery.trim() || selectedCategory !== 'all') && (
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
              }}
            >
              <RotateCcw size={14} />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="empty-search-card">
            <Search size={36} className="empty-search-icon" />
            <h2>No tools match your search</h2>
            <p>
              We couldn&apos;t find any tools matching{' '}
              <strong>“{searchQuery}”</strong> in the selected category.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
              }}
            >
              Show All 10 Tools
            </button>
          </div>
        ) : (
          <div className="tools-grid">
            {filteredTools.map((tool) => (
              <article
                key={tool.id}
                className="tool-card"
                onClick={() => onSelectTool(tool.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTool(tool.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open ${tool.name}`}
              >
                <div className="tool-card-top">
                  <div
                    className="tool-card-icon"
                    style={{
                      backgroundColor: `${tool.accent}16`,
                      color: tool.accent,
                      borderColor: `${tool.accent}30`
                    }}
                  >
                    <ToolIcon name={tool.icon} size={24} />
                  </div>
                  <div className="tool-card-meta">
                    <span className="tool-number-badge">
                      #{String(tool.number).padStart(2, '0')}
                    </span>
                    <span className="tool-category-tag">{tool.categoryLabel}</span>
                  </div>
                </div>

                <h2 className="tool-card-title">{tool.name}</h2>
                <p className="tool-card-desc">{tool.description}</p>

                <ul className="tool-card-highlights">
                  {tool.highlights.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={13} className="highlight-check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="tool-card-footer">
                  <span className="tool-card-cta">
                    Open Tool <ArrowRight size={15} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Architecture Banner */}
      <section className="trust-banner-grid" aria-label="Why FreeTools Hub">
        <div className="trust-card">
          <div className="trust-icon-box">
            <ShieldCheck size={22} />
          </div>
          <h3>100% Local Privacy</h3>
          <p>
            Every calculation, encoding, diff, and QR generation happens inside your browser&apos;s
            JavaScript engine. Your sensitive JSON, tokens, and text are never sent to a server.
          </p>
        </div>

        <div className="trust-card">
          <div className="trust-icon-box">
            <Zap size={22} />
          </div>
          <h3>Zero Latency &amp; Offline Ready</h3>
          <p>
            Because there are no API calls or database round-trips, results appear immediately as
            you type—with instant one-click copy and file download buttons.
          </p>
        </div>

        <div className="trust-card">
          <div className="trust-icon-box">
            <Sparkles size={22} />
          </div>
          <h3>No Sign-Ups or Paywalls</h3>
          <p>
            Built with clean, open-source web libraries. Bookmark any tool directly or switch
            between light and dark mode for comfortable day and night workflows.
          </p>
        </div>
      </section>
    </div>
  );
}
