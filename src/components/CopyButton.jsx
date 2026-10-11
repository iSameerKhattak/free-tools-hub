import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardAndDownload';

export default function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = 'btn btn-secondary',
  disabled = false,
  size = 16,
  title = 'Copy to clipboard'
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled || !text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      className={`${className} ${copied ? 'btn-copied' : ''}`}
      title={title}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
