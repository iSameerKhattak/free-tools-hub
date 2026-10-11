import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../components/HomePage';
import JsonFormatterTool, { formatAndValidateJson } from '../tools/JsonFormatterTool';
import WordCounterTool, { analyzeTextStats } from '../tools/WordCounterTool';

describe('Stage 1: Homepage, JSON Formatter, and Word Counter', () => {
  it('renders homepage with all 10 tools and filters by search and category', () => {
    const onSearchChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onSelectTool = vi.fn();

    const { rerender } = render(
      <HomePage
        searchQuery=""
        onSearchChange={onSearchChange}
        selectedCategory="all"
        onCategoryChange={onCategoryChange}
        onSelectTool={onSelectTool}
      />
    );

    expect(screen.getByText('JSON Formatter & Validator')).toBeInTheDocument();
    expect(screen.getByText('QR Code Generator')).toBeInTheDocument();

    // Filter by search query
    rerender(
      <HomePage
        searchQuery="uuid"
        onSearchChange={onSearchChange}
        selectedCategory="all"
        onCategoryChange={onCategoryChange}
        onSelectTool={onSelectTool}
      />
    );
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
    expect(screen.queryByText('QR Code Generator')).not.toBeInTheDocument();
  });

  it('formats, minifies, sorts keys, and pinpoints errors in JSON Formatter', () => {
    const valid = formatAndValidateJson('{"b":1,"a":{"d":4,"c":3}}', {
      indent: 2,
      minify: false,
      sortKeys: true
    });
    expect(valid.isValid).toBe(true);
    expect(Object.keys(JSON.parse(valid.output))).toEqual(['a', 'b']);
    expect(Object.keys(JSON.parse(valid.output).a)).toEqual(['c', 'd']);

    const minified = formatAndValidateJson('{"x": 10, "y": 20}', {
      minify: true
    });
    expect(minified.output).toBe('{"x":10,"y":20}');

    const invalid = formatAndValidateJson('{\n  "name": "test",\n  "broken": \n}');
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toBeTruthy();

    render(<JsonFormatterTool />);
    expect(screen.getByText('Valid JSON')).toBeInTheDocument();
  });

  it('accurately counts words, characters, sentences, and paragraphs in Word Counter', () => {
    const sample = 'Hello world! This is sentence two.\n\nSecond paragraph here.';
    const stats = analyzeTextStats(sample);
    expect(stats.words).toBe(9);
    expect(stats.sentences).toBe(3);
    expect(stats.paragraphs).toBe(2);
    expect(stats.characters).toBe(sample.length);

    render(<WordCounterTool />);
    const textarea = screen.getByLabelText('Your Text');
    fireEvent.change(textarea, { target: { value: 'One two three.' } });
    expect(screen.getByTestId('stat-words').textContent).toBe('3');
  });
});
