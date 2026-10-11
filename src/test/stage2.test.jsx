import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CaseConverterTool, { convertTextCase } from '../tools/CaseConverterTool';
import Base64Tool, { encodeBase64Utf8, decodeBase64Utf8 } from '../tools/Base64Tool';

describe('Stage 2: Text Case Converter and Base64 Encoder/Decoder', () => {
  it('converts text across all major case styles accurately', () => {
    expect(convertTextCase('hello world', 'uppercase')).toBe('HELLO WORLD');
    expect(convertTextCase('HELLO WORLD', 'lowercase')).toBe('hello world');
    expect(convertTextCase('the quick brown fox in the park', 'title')).toBe(
      'The Quick Brown Fox in the Park'
    );
    expect(convertTextCase('hello world example', 'camel')).toBe('helloWorldExample');
    expect(convertTextCase('hello world example', 'pascal')).toBe('HelloWorldExample');
    expect(convertTextCase('helloWorldExample', 'snake')).toBe('hello_world_example');
    expect(convertTextCase('Hello World Example', 'kebab')).toBe('hello-world-example');
    expect(convertTextCase('Hello World Example', 'constant')).toBe('HELLO_WORLD_EXAMPLE');

    render(<CaseConverterTool />);
    expect(screen.getByText('Instant Preview Across All 12 Formats')).toBeInTheDocument();
  });

  it('encodes and decodes UTF-8 and URL-safe Base64 and catches invalid Base64', () => {
    const sample = 'Hello 🚀 FreeTools Hub — Café!';
    const encoded = encodeBase64Utf8(sample);
    expect(encoded.ok).toBe(true);

    const decoded = decodeBase64Utf8(encoded.output);
    expect(decoded.ok).toBe(true);
    expect(decoded.output).toBe(sample);

    const urlSafe = encodeBase64Utf8('subjects?_d=1', { urlSafe: true });
    expect(urlSafe.ok).toBe(true);
    expect(urlSafe.output).not.toContain('+');
    expect(urlSafe.output).not.toContain('/');
    expect(decodeBase64Utf8(urlSafe.output).output).toBe('subjects?_d=1');

    const bad = decodeBase64Utf8('!!!not-base64$$$');
    expect(bad.ok).toBe(false);
    expect(bad.error).toContain('Invalid Base64');

    render(<Base64Tool />);
    const decodeTab = screen.getByRole('tab', { name: /Decode/i });
    fireEvent.click(decodeTab);
    expect(screen.getByText(/Valid Base64 Decoded to UTF-8/i)).toBeInTheDocument();
  });
});
