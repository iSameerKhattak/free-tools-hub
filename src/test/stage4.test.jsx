import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimestampConverterTool, {
  parseEpochInput,
  parseDateToEpoch
} from '../tools/TimestampConverterTool';
import DiffCheckerTool, { computeTextDiff } from '../tools/DiffCheckerTool';

describe('Stage 4: Timestamp Converter and Text Diff Checker', () => {
  it('converts Unix timestamps in seconds and milliseconds to ISO 8601 and back', () => {
    const secResult = parseEpochInput('1700000000', 'auto', 1700000060000);
    expect(secResult.isValid).toBe(true);
    expect(secResult.detectedUnit).toBe('Seconds');
    expect(secResult.iso8601).toBe('2023-11-14T22:13:20.000Z');
    expect(secResult.relative).toBe('1 minute ago');

    const msResult = parseEpochInput('1700000000000', 'auto');
    expect(msResult.isValid).toBe(true);
    expect(msResult.detectedUnit).toBe('Milliseconds');
    expect(msResult.seconds).toBe(1700000000);

    const badEpoch = parseEpochInput('not-a-timestamp');
    expect(badEpoch.isValid).toBe(false);

    const dateRes = parseDateToEpoch('2023-11-14T22:13:20.000Z');
    expect(dateRes.isValid).toBe(true);
    expect(dateRes.seconds).toBe(1700000000);

    render(<TimestampConverterTool />);
    expect(screen.getByTestId('ts-iso')).toBeInTheDocument();
  });

  it('computes line, word, and character diffs and generates unified patches', () => {
    const diff = computeTextDiff('alpha\nbeta\n', 'alpha\ngamma\n', {
      granularity: 'lines'
    });
    expect(diff.isIdentical).toBe(false);
    expect(diff.addedCount).toBe(1);
    expect(diff.removedCount).toBe(1);
    expect(diff.unifiedPatch).toContain('-beta');
    expect(diff.unifiedPatch).toContain('+gamma');

    const same = computeTextDiff('hello world', 'HELLO WORLD', {
      granularity: 'words',
      ignoreCase: true
    });
    expect(same.isIdentical).toBe(true);

    render(<DiffCheckerTool />);
    expect(screen.getByTestId('diff-added')).toBeInTheDocument();
  });
});
