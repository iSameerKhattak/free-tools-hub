import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Wifi,
  Mail,
  Globe,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile, downloadDataUrl } from '../utils/clipboardAndDownload';

export function buildQrPayload(preset, fields) {
  if (preset === 'wifi') {
    const ssid = (fields.ssid || '').replace(/([\\;,:])/g, '\\$1');
    const password = (fields.password || '').replace(/([\\;,:])/g, '\\$1');
    const encryption = fields.encryption || 'WPA';
    const hidden = fields.hidden ? 'true' : 'false';
    if (!ssid.trim()) return '';
    return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
  }

  if (preset === 'email') {
    const email = (fields.email || '').trim();
    if (!email) return '';
    const params = new URLSearchParams();
    if (fields.subject) params.set('subject', fields.subject);
    if (fields.body) params.set('body', fields.body);
    const query = params.toString();
    return query ? `mailto:${email}?${query}` : `mailto:${email}`;
  }

  return fields.text || '';
}

export async function generateQrCodeAssets(
  payload,
  {
    errorCorrectionLevel = 'M',
    width = 300,
    margin = 2,
    darkColor = '#0f172a',
    lightColor = '#ffffff'
  } = {}
) {
  if (!payload || !payload.trim()) {
    return {
      isEmpty: true,
      ok: false,
      svgString: '',
      pngDataUrl: '',
      error: null
    };
  }

  if (payload.length > 2500) {
    return {
      isEmpty: false,
      ok: false,
      svgString: '',
      pngDataUrl: '',
      error:
        'Input exceeds recommended QR Code capacity (max ~2,500 characters). Shorten the text or URL so scanners can read it reliably.'
    };
  }

  const options = {
    errorCorrectionLevel,
    width: Number(width) || 300,
    margin: Number(margin) ?? 2,
    color: {
      dark: darkColor || '#0f172a',
      light: lightColor || '#ffffff'
    }
  };

  try {
    const svgString = await QRCode.toString(payload, {
      ...options,
      type: 'svg'
    });

    let pngDataUrl = '';
    try {
      pngDataUrl = await QRCode.toDataURL(payload, options);
    } catch {
      // Fallback for headless test environments without HTMLCanvasElement 2d context
      pngDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }

    return {
      isEmpty: false,
      ok: true,
      svgString,
      pngDataUrl,
      error: null
    };
  } catch (err) {
    return {
      isEmpty: false,
      ok: false,
      svgString: '',
      pngDataUrl: '',
      error:
        err.message ||
        'Could not generate QR code for the provided input and settings.'
    };
  }
}

export default function QrGeneratorTool() {
  const [preset, setPreset] = useState('url'); // 'url' | 'wifi' | 'email'
  const [fields, setFields] = useState({
    text: 'https://github.com/iSameerKhattak/free-tools-hub',
    ssid: 'FreeTools_Guest_WiFi',
    password: 'supersecretpassword',
    encryption: 'WPA',
    hidden: false,
    email: 'hello@example.com',
    subject: 'FreeTools Hub Feedback',
    body: 'Hi! Here is my feedback on FreeTools Hub:'
  });

  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
  const [width, setWidth] = useState(280);
  const [margin, setMargin] = useState(2);
  const [darkColor, setDarkColor] = useState('#0f172a');
  const [lightColor, setLightColor] = useState('#ffffff');

  const [qrState, setQrState] = useState({
    isEmpty: false,
    ok: true,
    svgString: '',
    pngDataUrl: '',
    error: null
  });

  const payload = useMemo(() => buildQrPayload(preset, fields), [preset, fields]);

  const lowContrastWarning =
    darkColor.toLowerCase() === lightColor.toLowerCase()
      ? 'Foreground and background colors are identical—QR scanners will not be able to read this code.'
      : null;

  useEffect(() => {
    let cancelled = false;
    generateQrCodeAssets(payload, {
      errorCorrectionLevel,
      width,
      margin,
      darkColor,
      lightColor
    }).then((res) => {
      if (!cancelled) setQrState(res);
    });
    return () => {
      cancelled = true;
    };
  }, [payload, errorCorrectionLevel, width, margin, darkColor, lightColor]);

  const updateField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="tool-panel">
      {/* Preset Selector Toolbar */}
      <div className="tool-toolbar">
        <div className="toolbar-group">
          <div className="segmented-control" role="tablist" aria-label="QR content type">
            <button
              type="button"
              role="tab"
              aria-selected={preset === 'url'}
              className={`segmented-btn ${preset === 'url' ? 'active' : ''}`}
              onClick={() => setPreset('url')}
            >
              <Globe size={15} />
              <span>URL / Plain Text</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={preset === 'wifi'}
              className={`segmented-btn ${preset === 'wifi' ? 'active' : ''}`}
              onClick={() => setPreset('wifi')}
            >
              <Wifi size={15} />
              <span>Wi-Fi Login</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={preset === 'email'}
              className={`segmented-btn ${preset === 'email' ? 'active' : ''}`}
              onClick={() => setPreset('email')}
            >
              <Mail size={15} />
              <span>Email Message</span>
            </button>
          </div>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setDarkColor('#0f172a');
              setLightColor('#ffffff');
              setWidth(280);
              setMargin(2);
              setErrorCorrectionLevel('M');
            }}
          >
            <RefreshCw size={15} />
            <span>Reset Style</span>
          </button>
        </div>
      </div>

      {lowContrastWarning && (
        <div className="status-banner status-error" role="alert">
          <div className="status-error-header">
            <AlertTriangle size={18} />
            <div>
              <strong>Low Contrast Warning</strong>
              <p className="error-detail-msg">{lowContrastWarning}</p>
            </div>
          </div>
        </div>
      )}

      {!qrState.isEmpty && !qrState.ok && qrState.error && (
        <div className="status-banner status-error" role="alert">
          <div className="status-error-header">
            <AlertTriangle size={18} />
            <div>
              <strong>QR Generation Error</strong>
              <p className="error-detail-msg">{qrState.error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="split-editor-grid">
        {/* Left Pane: Input & Customization */}
        <div className="editor-pane">
          <div className="pane-header">
            <span className="pane-title">1. QR Content &amp; Appearance</span>
            <span className="pane-meta">{payload.length} chars encoded</span>
          </div>

          <div className="qr-form-body">
            {preset === 'url' && (
              <div className="form-field">
                <label htmlFor="qr-text-input" className="form-label">
                  Website URL or Text Content
                </label>
                <textarea
                  id="qr-text-input"
                  className="code-textarea qr-textarea"
                  value={fields.text}
                  onChange={(e) => updateField('text', e.target.value)}
                  placeholder="Enter a URL (https://...) or any text to encode into a QR code..."
                />
              </div>
            )}

            {preset === 'wifi' && (
              <div className="qr-preset-grid">
                <div className="form-field">
                  <label htmlFor="wifi-ssid" className="form-label">
                    Network Name (SSID)
                  </label>
                  <input
                    id="wifi-ssid"
                    type="text"
                    className="form-input"
                    value={fields.ssid}
                    onChange={(e) => updateField('ssid', e.target.value)}
                    placeholder="e.g. Home_Network_5G"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="wifi-password" className="form-label">
                    Wi-Fi Password
                  </label>
                  <input
                    id="wifi-password"
                    type="text"
                    className="form-input"
                    value={fields.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Wi-Fi password"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="wifi-enc" className="form-label">
                    Security Type
                  </label>
                  <select
                    id="wifi-enc"
                    className="form-select"
                    value={fields.encryption}
                    onChange={(e) => updateField('encryption', e.target.value)}
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
              </div>
            )}

            {preset === 'email' && (
              <div className="qr-preset-grid">
                <div className="form-field">
                  <label htmlFor="qr-email-to" className="form-label">
                    Recipient Email
                  </label>
                  <input
                    id="qr-email-to"
                    type="email"
                    className="form-input"
                    value={fields.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="qr-email-subject" className="form-label">
                    Subject Line
                  </label>
                  <input
                    id="qr-email-subject"
                    type="text"
                    className="form-input"
                    value={fields.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="qr-email-body" className="form-label">
                    Message Body
                  </label>
                  <textarea
                    id="qr-email-body"
                    className="code-textarea qr-textarea"
                    value={fields.body}
                    onChange={(e) => updateField('body', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Style Controls */}
            <div className="qr-options-grid">
              <div className="form-field">
                <label htmlFor="qr-ecc-select" className="form-label">
                  Error Correction
                </label>
                <select
                  id="qr-ecc-select"
                  className="form-select"
                  value={errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                >
                  <option value="L">Low (L — ~7% recovery)</option>
                  <option value="M">Medium (M — ~15% recovery)</option>
                  <option value="Q">Quartile (Q — ~25% recovery)</option>
                  <option value="H">High (H — ~30% recovery)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="qr-size-range" className="form-label">
                  Size: <strong>{width}px</strong>
                </label>
                <input
                  id="qr-size-range"
                  type="range"
                  min="180"
                  max="520"
                  step="20"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="qr-margin-range" className="form-label">
                  Quiet Margin: <strong>{margin} blocks</strong>
                </label>
                <input
                  id="qr-margin-range"
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                />
              </div>

              <div className="qr-color-row">
                <div className="form-field">
                  <label htmlFor="qr-dark-color" className="form-label">
                    Foreground
                  </label>
                  <div className="color-picker-wrap">
                    <input
                      id="qr-dark-color"
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                    />
                    <code>{darkColor}</code>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="qr-light-color" className="form-label">
                    Background
                  </label>
                  <div className="color-picker-wrap">
                    <input
                      id="qr-light-color"
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                    />
                    <code>{lightColor}</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="qr-raw-payload-box">
              <div className="qr-raw-header">
                <span>Encoded Payload String</span>
                <CopyButton
                  text={payload}
                  label="Copy Payload"
                  className="btn btn-ghost btn-xs"
                  size={13}
                />
              </div>
              <code className="qr-raw-code" data-testid="qr-payload-code">
                {payload || '(Empty)'}
              </code>
            </div>
          </div>
        </div>

        {/* Right Pane: Live QR Preview & Downloads */}
        <div className="editor-pane">
          <div className="pane-header">
            <span className="pane-title">
              <QrCode size={16} /> 2. Live Scannable QR Code
            </span>
            <div className="pane-actions">
              <CopyButton
                text={qrState.svgString}
                disabled={!qrState.ok || !qrState.svgString}
                label="Copy SVG"
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!qrState.ok || !qrState.svgString}
                onClick={() =>
                  downloadTextFile(
                    qrState.svgString,
                    'qrcode.svg',
                    'image/svg+xml;charset=utf-8'
                  )
                }
              >
                <Download size={15} />
                <span>Download .SVG</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!qrState.ok || !qrState.pngDataUrl}
                onClick={() => downloadDataUrl(qrState.pngDataUrl, 'qrcode.png')}
              >
                <Download size={15} />
                <span>Download .PNG</span>
              </button>
            </div>
          </div>

          <div className="qr-preview-stage">
            {qrState.isEmpty ? (
              <div className="qr-empty-placeholder">
                <QrCode size={48} />
                <p>Enter content on the left to generate a live QR code.</p>
              </div>
            ) : qrState.ok && qrState.svgString ? (
              <div
                className="qr-svg-frame"
                data-testid="qr-svg-preview"
                style={{ width: `${Math.min(width, 360)}px` }}
                dangerouslySetInnerHTML={{ __html: qrState.svgString }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
