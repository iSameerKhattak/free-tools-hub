import React from 'react';
import {
  Braces,
  FileText,
  CaseSensitive,
  Binary,
  Link2,
  Fingerprint,
  Clock,
  GitCompare,
  FileCode2,
  QrCode,
  Wrench
} from 'lucide-react';

const ICON_MAP = {
  Braces,
  FileText,
  CaseSensitive,
  Binary,
  Link2,
  Fingerprint,
  Clock,
  GitCompare,
  FileCode2,
  QrCode
};

export default function ToolIcon({ name, size = 22, className = '', style = {} }) {
  const IconComponent = ICON_MAP[name] || Wrench;
  return <IconComponent size={size} className={className} style={style} />;
}
