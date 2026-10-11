import React from 'react';
import { Sun, Moon, Wrench, Shield, Grid, Search } from 'lucide-react';
import { TOOLS_CATALOG } from '../data/toolsCatalog';

export default function Navbar({
  theme,
  onToggleTheme,
  activeToolId,
  onSelectTool,
  onGoHome,
  onQuickSearchFocus
}) {
  return (
    <header className="site-navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <button
            type="button"
            className="brand-logo-btn"
            onClick={onGoHome}
            aria-label="FreeTools Hub Home"
          >
            <span className="brand-logo-mark">
              <Wrench size={18} />
            </span>
            <span className="brand-logo-text">
              FreeTools<span className="brand-logo-accent">Hub</span>
            </span>
          </button>

          <span className="navbar-privacy-pill" title="Zero backend tracking or server uploads">
            <Shield size={13} />
            <span>Local-First &amp; Private</span>
          </span>
        </div>

        <div className="navbar-center">
          <div className="quick-jump-wrapper">
            <label htmlFor="quick-tool-select" className="sr-only">
              Quick Jump to Tool
            </label>
            <Grid size={15} className="quick-jump-icon" />
            <select
              id="quick-tool-select"
              className="quick-jump-select"
              value={activeToolId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) onGoHome();
                else onSelectTool(val);
              }}
              aria-label="Jump to tool"
            >
              <option value="">All 10 Tools (Homepage)</option>
              {TOOLS_CATALOG.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.number}. {tool.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="navbar-right">
          {activeToolId && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                onGoHome();
                setTimeout(() => {
                  if (onQuickSearchFocus) onQuickSearchFocus();
                }, 50);
              }}
              title="Search all tools"
            >
              <Search size={16} />
              <span className="hide-mobile">Search Tools</span>
            </button>
          )}

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="theme-toggle-label">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
