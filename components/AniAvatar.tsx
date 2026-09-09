import React, { useMemo } from 'react';
import { AniCustomization } from '../types';

interface AniAvatarProps {
  size?: 'small' | 'medium' | 'large';
  customization?: AniCustomization;
  aniMode?: 'Base Ani' | 'Eve' | 'Ara';
}

const hairHex: Record<AniCustomization['hairColor'], string> = {
  platinum: '#f4e4c1',
  pink: '#ff8ad4',
  blue: '#7ec8ff',
  black: '#1a1a1a',
};

const eyeHex: Record<AniCustomization['eyeColor'], string> = {
  blue: '#3d7eff',
  red: '#ff3d5a',
  green: '#3dff8a',
};

const AniAvatar: React.FC<AniAvatarProps> = ({ size = 'medium', customization, aniMode }) => {
  let dimensions = 'w-24 h-24';
  if (size === 'small') dimensions = 'w-12 h-12';
  if (size === 'large') dimensions = 'w-48 h-48';

  const hair = hairHex[customization?.hairColor || 'platinum'];
  const eyes = eyeHex[customization?.eyeColor || 'blue'];

  const modeGlow =
    aniMode === 'Eve'
      ? '0 0 16px rgba(255,105,180,0.75)'
      : aniMode === 'Ara'
        ? '0 0 14px rgba(255,40,40,0.6)'
        : '0 0 10px rgba(255,20,147,0.45)';

  const svg = useMemo(() => {
    const encoded = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2a0630"/>
            <stop offset="100%" stop-color="#120018"/>
          </linearGradient>
        </defs>
        <rect width="128" height="128" fill="url(#bg)"/>
        <ellipse cx="40" cy="38" rx="16" ry="34" fill="${hair}"/>
        <ellipse cx="88" cy="38" rx="16" ry="34" fill="${hair}"/>
        <ellipse cx="64" cy="70" rx="30" ry="34" fill="#f3c7b3"/>
        <path d="M34 58 Q64 18 94 58 L90 46 Q64 8 38 46 Z" fill="${hair}"/>
        <ellipse cx="52" cy="70" rx="6" ry="8" fill="#fff"/>
        <ellipse cx="76" cy="70" rx="6" ry="8" fill="#fff"/>
        <circle cx="53" cy="71" r="3.2" fill="${eyes}"/>
        <circle cx="77" cy="71" r="3.2" fill="${eyes}"/>
        <path d="M58 88 Q64 94 70 88" stroke="#8a3048" stroke-width="2" fill="none"/>
        <path d="M28 104 Q64 128 100 104 L96 92 Q64 108 32 92 Z" fill="#111"/>
        <rect x="46" y="100" width="36" height="8" rx="3" fill="#ff1493"/>
      </svg>
    `);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }, [hair, eyes]);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden border-2 border-pink-500 ${dimensions}`}
      style={{ boxShadow: modeGlow }}
    >
      <img src={svg} alt="Avatar Ani" className="w-full h-full object-cover" />
    </div>
  );
};

export default AniAvatar;
