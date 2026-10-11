import React from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import ToolIcon from './ToolIcon';
import { TOOLS_CATALOG } from '../data/toolsCatalog';

export default function ToolLayout({ tool, onSelectTool, onGoHome, children }) {
  if (!tool) return null;

  const relatedTools = TOOLS_CATALOG.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  );

  return (
    <div className="tool-page-container">
      <div className="tool-breadcrumb-bar">
        <button
          type="button"
          className="btn-back-home"
          onClick={onGoHome}
          aria-label="Back to all tools"
        >
          <ArrowLeft size={16} />
          <span>All Tools</span>
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-category">{tool.categoryLabel}</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{tool.name}</span>
      </div>

      <header className="tool-header-card">
        <div className="tool-header-main">
          <div
            className="tool-header-icon"
            style={{
              backgroundColor: `${tool.accent}18`,
              color: tool.accent,
              borderColor: `${tool.accent}35`
            }}
          >
            <ToolIcon name={tool.icon} size={28} />
          </div>
          <div className="tool-header-text">
            <div className="tool-header-badges">
              <span className="badge badge-category">{tool.categoryLabel}</span>
              <span className="badge badge-privacy" title="All data stays inside your browser">
                <ShieldCheck size={13} />
                100% Local In-Browser
              </span>
            </div>
            <h1 className="tool-title">{tool.name}</h1>
            <p className="tool-subtitle">{tool.description}</p>
          </div>
        </div>
      </header>

      <main className="tool-workspace">{children}</main>

      {relatedTools.length > 0 && (
        <section className="related-tools-section" aria-label="Related tools">
          <div className="related-tools-header">
            <Sparkles size={16} />
            <h2>More in {tool.categoryLabel}</h2>
          </div>
          <div className="related-tools-grid">
            {relatedTools.map((rel) => (
              <button
                key={rel.id}
                type="button"
                className="related-tool-chip"
                onClick={() => onSelectTool(rel.id)}
              >
                <span
                  className="related-tool-icon"
                  style={{ backgroundColor: `${rel.accent}18`, color: rel.accent }}
                >
                  <ToolIcon name={rel.icon} size={18} />
                </span>
                <span className="related-tool-info">
                  <strong>{rel.shortName}</strong>
                  <small>{rel.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
