import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import CopyButton from '../components/CopyButton';
import { downloadTextFile } from '../utils/clipboardAndDownload';

export function formatRelativeTime(targetMs, referenceMs = Date.now()) {
  const diffSec = Math.round((targetMs - referenceMs) / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 5) return 'just now';

  const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const u of units) {
    if (absSec >= u.seconds) {
      const count = Math.floor(absSec / u.seconds);
      const plural = count === 1 ? u.label : `${u.label}s`;
      return diffSec > 0 ? `in ${count} ${plural}` : `${count} ${plural} ago`;
    }
  }
  return 'just now';
}

export function parseEpochInput(rawInput, unitMode = 'auto', nowMs = Date.now()) {
  if (rawInput === undefined || rawInput === null || !String(rawInput).trim()) {
    return { isEmpty: true, isValid: false };
  }

  const trimmed = String(rawInput).trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return {
      isEmpty: false,
      isValid: false,
      error:
        'Invalid timestamp: please enter a numeric Unix epoch value (e.g. 1760198400 or 1760198400000).'
    };
  }

  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return {
      isEmpty: false,
      isValid: false,
      error: 'Timestamp number is out of JavaScript safe range.'
    };
  }

  let detectedUnit = unitMode;
  if (unitMode === 'auto') {
    const abs = Math.abs(num);
    // Values >= 1e11 are treated as milliseconds (covers dates after 1973 in ms)
    detectedUnit = abs >= 1e11 ? 'ms' : 's';
  }

  const ms = detectedUnit === 'ms' ? Math.round(num) : Math.round(num * 1000);
  const date = new Date(ms);

  if (Number.isNaN(date.getTime())) {
    return {
      isEmpty: false,
      isValid: false,
      error:
        'Timestamp is outside the valid JavaScript Date range (±8.64e15 milliseconds).'
    };
  }

  const seconds = Math.floor(ms / 1000);
  return {
    isEmpty: false,
    isValid: true,
    detectedUnit: detectedUnit === 'ms' ? 'Milliseconds' : 'Seconds',
    seconds,
    milliseconds: ms,
    iso8601: date.toISOString(),
    utcString: date.toUTCString(),
    localString: date.toString(),
    relative: formatRelativeTime(ms, nowMs)
  };
}

export function parseDateToEpoch(dateStr) {
  if (!dateStr || !dateStr.trim()) {
    return { isEmpty: true, isValid: false };
  }
  const parsedMs = Date.parse(dateStr.trim());
  if (Number.isNaN(parsedMs)) {
    return {
      isEmpty: false,
      isValid: false,
      error:
        'Could not parse date string. Use ISO 8601 format like "2026-10-11T15:30:00Z" or "2026-10-11 15:30:00".'
    };
  }
  const d = new Date(parsedMs);
  return {
    isEmpty: false,
    isValid: true,
    seconds: Math.floor(parsedMs / 1000),
    milliseconds: parsedMs,
    iso8601: d.toISOString(),
    utcString: d.toUTCString()
  };
}

export default function TimestampConverterTool() {
  const [liveNowMs, setLiveNowMs] = useState(() => Date.now());
  const [clockPaused, setClockPaused] = useState(false);

  const [epochInput, setEpochInput] = useState(() =>
    String(Math.floor(Date.now() / 1000))
  );
  const [unitMode, setUnitMode] = useState('auto'); // 'auto' | 's' | 'ms'
  const [dateInput, setDateInput] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (clockPaused) return undefined;
    const timer = setInterval(() => {
      setLiveNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [clockPaused]);

  const epochResult = useMemo(
    () => parseEpochInput(epochInput, unitMode, liveNowMs),
    [epochInput, unitMode, liveNowMs]
  );

  const dateResult = useMemo(() => parseDateToEpoch(dateInput), [dateInput]);

  const handleUseCurrentTime = () => {
    const now = Date.now();
    setLiveNowMs(now);
    setEpochInput(unitMode === 'ms' ? String(now) : String(Math.floor(now / 1000)));
    setDateInput(new Date(now).toISOString());
  };

  const buildDownloadReport = () => {
    const payload = {
      epochToDate: epochResult.isValid ? epochResult : null,
      dateToEpoch: dateResult.isValid ? dateResult : null
    };
    return JSON.stringify(payload, null, 2);
  };

  return (
    <div className="tool-panel">
      {/* Live Unix Epoch Banner */}
      <div className="live-epoch-banner">
        <div className="live-epoch-left">
          <span className="live-dot" />
          <span className="live-label">Current Unix Epoch:</span>
          <code className="live-epoch-code" data-testid="live-epoch-seconds">
            {Math.floor(liveNowMs / 1000)}
          </code>
          <span className="live-unit">sec</span>
          <CopyButton
            text={String(Math.floor(liveNowMs / 1000))}
            label="Copy Sec"
            className="btn btn-secondary btn-xs"
            size={13}
          />
          <span className="status-meta-sep">•</span>
          <code className="live-epoch-code-sm">{liveNowMs}</code>
          <span className="live-unit">ms</span>
        </div>

        <div className="live-epoch-right">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setClockPaused((p) => !p)}
          >
            {clockPaused ? 'Resume Clock' : 'Pause Clock'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleUseCurrentTime}
          >
            <RefreshCw size={14} />
            <span>Load Current Time</span>
          </button>
        </div>
      </div>

      {/* Two-Column Converter Grid */}
      <div className="split-editor-grid">
        {/* Column 1: Epoch -> Human Date */}
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="epoch-input-field" className="pane-title">
              <Clock size={16} /> 1. Unix Timestamp → Human Date
            </label>
            {epochResult.isValid && (
              <span className="badge badge-category">
                Detected: {epochResult.detectedUnit}
              </span>
            )}
          </div>

          <div className="converter-card-body">
            <div className="input-with-select-row">
              <input
                id="epoch-input-field"
                type="text"
                className="form-input code-input"
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                placeholder="e.g. 1760198400 or 1760198400000"
                spellCheck={false}
              />
              <select
                className="form-select"
                value={unitMode}
                onChange={(e) => setUnitMode(e.target.value)}
                aria-label="Timestamp unit"
              >
                <option value="auto">Auto-detect (s / ms)</option>
                <option value="s">Seconds (s)</option>
                <option value="ms">Milliseconds (ms)</option>
              </select>
            </div>

            {!epochResult.isEmpty && !epochResult.isValid && (
              <div className="status-banner status-error" role="alert">
                <div className="status-error-header">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>Invalid Timestamp</strong>
                    <p className="error-detail-msg">{epochResult.error}</p>
                  </div>
                </div>
              </div>
            )}

            {epochResult.isValid && (
              <div className="timestamp-results-table">
                <div className="ts-row">
                  <span className="ts-label">ISO 8601 (UTC)</span>
                  <code className="ts-value" data-testid="ts-iso">
                    {epochResult.iso8601}
                  </code>
                  <CopyButton
                    text={epochResult.iso8601}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">UTC / GMT String</span>
                  <code className="ts-value">{epochResult.utcString}</code>
                  <CopyButton
                    text={epochResult.utcString}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">Local Browser Time</span>
                  <code className="ts-value">{epochResult.localString}</code>
                  <CopyButton
                    text={epochResult.localString}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">Unix Seconds</span>
                  <code className="ts-value">{epochResult.seconds}</code>
                  <CopyButton
                    text={String(epochResult.seconds)}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">Unix Milliseconds</span>
                  <code className="ts-value">{epochResult.milliseconds}</code>
                  <CopyButton
                    text={String(epochResult.milliseconds)}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">Relative Time</span>
                  <strong className="ts-relative-badge">{epochResult.relative}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Human Date -> Epoch */}
        <div className="editor-pane">
          <div className="pane-header">
            <label htmlFor="date-string-input" className="pane-title">
              <Calendar size={16} /> 2. Human Date / ISO 8601 → Unix Timestamp
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              disabled={!epochResult.isValid && !dateResult.isValid}
              onClick={() =>
                downloadTextFile(
                  buildDownloadReport(),
                  'timestamp-conversion.json',
                  'application/json;charset=utf-8'
                )
              }
            >
              <Download size={14} />
              <span>Download JSON</span>
            </button>
          </div>

          <div className="converter-card-body">
            <input
              id="date-string-input"
              type="text"
              className="form-input code-input"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="e.g. 2026-10-11T12:00:00Z"
              spellCheck={false}
            />

            {!dateResult.isEmpty && !dateResult.isValid && (
              <div className="status-banner status-error" role="alert">
                <div className="status-error-header">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>Invalid Date Format</strong>
                    <p className="error-detail-msg">{dateResult.error}</p>
                  </div>
                </div>
              </div>
            )}

            {dateResult.isValid && (
              <div className="timestamp-results-table">
                <div className="ts-row">
                  <span className="ts-label">Unix Seconds (s)</span>
                  <code className="ts-value" data-testid="date-to-sec">
                    {dateResult.seconds}
                  </code>
                  <CopyButton
                    text={String(dateResult.seconds)}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">Unix Milliseconds (ms)</span>
                  <code className="ts-value" data-testid="date-to-ms">
                    {dateResult.milliseconds}
                  </code>
                  <CopyButton
                    text={String(dateResult.milliseconds)}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">Normalized ISO 8601</span>
                  <code className="ts-value">{dateResult.iso8601}</code>
                  <CopyButton
                    text={dateResult.iso8601}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
                <div className="ts-row">
                  <span className="ts-label">UTC String</span>
                  <code className="ts-value">{dateResult.utcString}</code>
                  <CopyButton
                    text={dateResult.utcString}
                    label="Copy"
                    className="btn btn-ghost btn-xs"
                    size={13}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
