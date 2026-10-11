import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MarkdownPreviewTool, { renderSafeMarkdown } from '../tools/MarkdownPreviewTool';
import QrGeneratorTool, {
  buildQrPayload,
  generateQrCodeAssets
} from '../tools/QrGeneratorTool';

describe('Stage 5: Markdown Editor/Preview and QR Code Generator', () => {
  it('renders GitHub-Flavored Markdown and strips XSS payloads via DOMPurify', () => {
    const md = '# Title\n\n**Bold** and `code`\n\n<script>alert("xss")</script>';
    const html = renderSafeMarkdown(md);
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).not.toContain('<script>');

    render(<MarkdownPreviewTool />);
    expect(screen.getByTestId('markdown-preview-output')).toBeInTheDocument();
  });

  it('builds QR payloads for URLs, Wi-Fi, and Email and generates valid SVG QR codes', async () => {
    const wifiPayload = buildQrPayload('wifi', {
      ssid: 'MyHomeNet',
      password: 'secret123',
      encryption: 'WPA',
      hidden: false
    });
    expect(wifiPayload).toBe('WIFI:T:WPA;S:MyHomeNet;P:secret123;H:false;;');

    const emailPayload = buildQrPayload('email', {
      email: 'dev@example.com',
      subject: 'Hello',
      body: 'World'
    });
    expect(emailPayload).toBe('mailto:dev@example.com?subject=Hello&body=World');

    const qrRes = await generateQrCodeAssets('https://example.com', {
      errorCorrectionLevel: 'M',
      width: 240
    });
    expect(qrRes.ok).toBe(true);
    expect(qrRes.svgString).toContain('<svg');

    const tooLong = await generateQrCodeAssets('x'.repeat(3000));
    expect(tooLong.ok).toBe(false);
    expect(tooLong.error).toContain('capacity');

    render(<QrGeneratorTool />);
    await waitFor(() => {
      expect(screen.getByTestId('qr-svg-preview')).toBeInTheDocument();
    });
  });
});
