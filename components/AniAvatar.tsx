import React, { useMemo } from 'react';
import { AniCustomization } from '../types';

interface AniAvatarProps {
  size?: 'small' | 'medium' | 'large';
  customization?: AniCustomization;
  aniMode?: 'Base Ani' | 'Eve' | 'Ara';
}

const AniAvatar: React.FC<AniAvatarProps> = ({ size = 'medium', customization, aniMode }) => {
  let dimensions = '';
  switch (size) {
    case 'small':
      dimensions = 'w-12 h-12';
      break;
    case 'large':
      dimensions = 'w-48 h-48';
      break;
    case 'medium':
    default:
      dimensions = 'w-24 h-24';
      break;
  }

  // The original image URL (https://i.ibb.co/qN91b3S/ani-avatar.png) seems to be broken.
  // Replacing with a stable placeholder. User should replace this with a proper Gothic Lolita anime avatar image.
  const aniImageUrl = 'https://via.placeholder.com/192x192/FF69B4/FFFFFF?text=Ani'; // A pink-themed placeholder

  const getCustomizationFilter = () => {
    let filter = '';
    if (customization) {
      switch (customization.hairColor) {
        case 'pink':
          filter += 'hue-rotate(280deg) saturate(1.5) brightness(1.1) ';
          break;
        case 'blue':
          filter += 'hue-rotate(180deg) saturate(1.5) brightness(1.1) ';
          break;
        case 'black':
          filter += 'grayscale(1) brightness(0.5) ';
          break;
        case 'platinum':
        default:
          break;
      }
      switch (customization.eyeColor) {
        case 'red':
          filter += 'hue-rotate(20deg) saturate(1.8) brightness(1.2) ';
          break;
        case 'green':
          filter += 'hue-rotate(80deg) saturate(1.8) brightness(1.2) ';
          break;
        case 'blue':
        default:
          break;
      }
    }
    return filter.trim();
  };

  const getModeStyles = () => {
    switch (aniMode) {
      case 'Eve':
        return {
          boxShadow: '0 0 15px rgba(255, 105, 180, 0.7)',
          filter: 'brightness(1.1) saturate(1.1)',
        };
      case 'Ara':
        return {
          boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
          filter: 'sepia(0.2) hue-rotate(-20deg) saturate(1.5) contrast(1.2)',
        };
      case 'Base Ani':
      default:
        return {
          boxShadow: '',
          filter: '',
        };
    }
  };

  const combinedFilterStyle = useMemo(() => {
    const customFilter = getCustomizationFilter();
    const modeFilter = getModeStyles().filter;
    return {
      filter: `${customFilter} ${modeFilter}`.trim(),
    };
  }, [customization, aniMode]);

  const combinedBoxShadowStyle = useMemo(() => {
    return {
      boxShadow: getModeStyles().boxShadow,
    };
  }, [aniMode]);

  const getFrenchCustomizationName = (option: string | undefined, type: 'hairstyle' | 'hairColor' | 'outfit' | 'eyeColor') => {
    if (!option) return '';
    const maps = {
      hairstyle: {
        'twintails': 'Twin-tails', 'bob': 'Carré', 'long': 'Longs', 'ponytail': 'Queue de cheval',
      },
      hairColor: {
        'platinum': 'Platine', 'pink': 'Rose', 'blue': 'Bleus', 'black': 'Noirs',
      },
      outfit: {
        'gothic-lolita': 'Gothic Lolita', 'casual': 'Décontractée', 'school-uniform': 'Uniforme scolaire',
      },
      eyeColor: {
        'blue': 'Bleus', 'red': 'Rouges', 'green': 'Verts',
      },
    };

    const typeMap = maps[type];
    return typeMap ? (typeMap as Record<string, string>)[option] || option : option;
  };


  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden shadow-lg border-2 border-pink-500 transform transition-all duration-300 ${dimensions}`}
      style={combinedBoxShadowStyle}
    >
      <img
        src={aniImageUrl}
        alt="Ani's Avatar"
        className="w-full h-full object-cover transition-filter duration-300"
        style={combinedFilterStyle}
        aria-label="Ani, ta compagne virtuelle"
      />
      <div className="absolute inset-0 rounded-full ring-2 ring-pink-400 ring-opacity-50"></div>
      {customization && size === 'large' && (
        <div className="absolute inset-0 flex flex-col justify-end items-center bg-black bg-opacity-50 text-white text-xs p-1">
          <p>Coiffure: {getFrenchCustomizationName(customization.hairstyle, 'hairstyle')}</p>
          <p>Cheveux: {getFrenchCustomizationName(customization.hairColor, 'hairColor')}</p>
          <p>Tenue: {getFrenchCustomizationName(customization.outfit, 'outfit')}</p>
          <p>Yeux: {getFrenchCustomizationName(customization.eyeColor, 'eyeColor')}</p>
        </div>
      )}
    </div>
  );
};

export default AniAvatar;