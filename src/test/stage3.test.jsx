import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UrlEncoderTool, { processUrlTransform, parseUrlDetails } from '../tools/UrlEncoderTool';
import UuidGeneratorTool, {
  generateUuidV4,
  generateUuidV7,
  formatUuidString,
  validateAndInspectUuid
} from '../tools/UuidGeneratorTool';

describe('Stage 3: URL Encoder/Decoder and UUID Generator', () => {
  it('encodes/decodes URLs, parses query strings, and catches malformed % sequences', () => {
    const encoded = processUrlTransform('hello world & more=100%', {
      mode: 'encode',
      scope: 'component'
    });
    expect(encoded.ok).toBe(true);
    expect(encoded.output).toBe('hello%20world%20%26%20more%3D100%25');

    const decoded = processUrlTransform(encoded.output, {
      mode: 'decode',
      scope: 'component'
    });
    expect(decoded.ok).toBe(true);
    expect(decoded.output).toBe('hello world & more=100%');

    const malformed = processUrlTransform('%E0%A4%A', { mode: 'decode' });
    expect(malformed.ok).toBe(false);
    expect(malformed.error).toContain('Malformed URL');

    const parsed = parseUrlDetails('https://example.com/api?page=2&tag=json#section');
    expect(parsed.isFullUrl).toBe(true);
    expect(parsed.host).toBe('example.com');
    expect(parsed.params).toEqual([
      { key: 'page', value: '2' },
      { key: 'tag', value: 'json' }
    ]);

    render(<UrlEncoderTool />);
    expect(screen.getByText(/Parsed URL & Query Parameters Inspector/i)).toBeInTheDocument();
  });

  it('generates valid v4 and v7 UUIDs, formats them, and validates UUID strings', () => {
    const v4 = generateUuidV4();
    const v7 = generateUuidV7(1700000000000);

    const inspect4 = validateAndInspectUuid(v4);
    expect(inspect4.isValid).toBe(true);
    expect(inspect4.version).toBe('Version 4');

    const inspect7 = validateAndInspectUuid(v7);
    expect(inspect7.isValid).toBe(true);
    expect(inspect7.version).toBe('Version 7');
    expect(inspect7.extractedDate).toBe(new Date(1700000000000).toISOString());

    const noHyphenUpper = formatUuidString(v4, {
      uppercase: true,
      hyphens: false,
      braces: true
    });
    expect(noHyphenUpper.startsWith('{')).toBe(true);
    expect(noHyphenUpper).not.toContain('-');

    const bad = validateAndInspectUuid('not-a-valid-uuid');
    expect(bad.isValid).toBe(false);

    render(<UuidGeneratorTool />);
    expect(screen.getByText(/Regenerate UUIDs/i)).toBeInTheDocument();
  });
});
