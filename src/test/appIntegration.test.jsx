import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { TOOLS_CATALOG } from '../data/toolsCatalog';

describe('Full App Integration: Navigation, Dark Mode, and All 10 Tools', () => {
  beforeEach(() => {
    window.location.hash = '';
    window.scrollTo = () => {};
    localStorage.clear();
  });

  it('toggles dark mode and updates document data-theme attribute', () => {
    render(<App />);
    const toggleBtn = screen.getByRole('button', { name: /Switch to dark mode/i });
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    const lightBtn = screen.getByRole('button', { name: /Switch to light mode/i });
    fireEvent.click(lightBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('navigates into every single one of the 10 tools and back to homepage', () => {
    render(<App />);

    for (const tool of TOOLS_CATALOG) {
      // Open tool via card on homepage
      const card = screen.getByRole('button', { name: `Open ${tool.name}` });
      fireEvent.click(card);

      // Verify tool heading is displayed
      expect(screen.getByRole('heading', { name: tool.name, level: 1 })).toBeInTheDocument();

      // Return to All Tools homepage
      const backBtn = screen.getByRole('button', { name: /Back to all tools/i });
      fireEvent.click(backBtn);

      expect(
        screen.getByRole('heading', { name: /Everyday Developer & Text Tools/i })
      ).toBeInTheDocument();
    }
  });
});
