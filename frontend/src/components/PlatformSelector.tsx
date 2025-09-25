// components/PlatformSelector.tsx - Updated for new layout
import React from 'react';
import { Check } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  disabled?: boolean;
}

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatforms, 
  onPlatformsChange 
}) => {
  const platforms: Platform[] = [
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: 'Threads & tweets optimized for engagement',
      color: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      description: 'Professional posts for networking',
      color: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      description: 'Visual captions with trending hashtags',
      color: 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/30'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      icon: '📧',
      description: 'Email content with subject & preview',
      color: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
    },
    // Future platforms (disabled for now)
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      description: 'Short-form video captions (coming soon)',
      color: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30',
      disabled: true
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '🎥',
      description: 'Video descriptions & titles (coming soon)',
      color: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30',
      disabled: true
    }
  ];

  const handlePlatformToggle = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform?.disabled) return;

    if (selectedPlatforms.includes(platformId)) {
      // Remove platform
      onPlatformsChange(selectedPlatforms.filter(id => id !== platformId));
    } else {
      // Add platform
      onPlatformsChange([...selectedPlatforms, platformId]);
    }
  };

  const isSelected = (platformId: string) => selectedPlatforms.includes(platformId);

  return (
    <div className="space-y-2">
      {platforms.map((platform) => {
        const selected = isSelected(platform.id);
        return (
          <div
            key={platform.id}
            className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
              platform.disabled
                ? 'opacity-50 cursor-not-allowed'
                : selected
                ? `${platform.color} border-opacity-100 ring-2 ring-blue-200 dark:ring-blue-800`
                : `${platform.color} border-opacity-50 hover:border-opacity-100 hover:shadow-sm`
            }`}
            onClick={() => handlePlatformToggle(platform.id)}
          >
            <div className="flex items-start gap-3">
              {/* Platform Icon */}
              <div className="text-lg flex-shrink-0 mt-0.5">
                {platform.icon}
              </div>

              {/* Platform Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">
                    {platform.name}
                  </h4>
                  {platform.disabled && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {platform.description}
                </p>
              </div>

              {/* Selection Indicator */}
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected
                  ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selected && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlatformSelector;