import React, { useState, useEffect } from 'react';
import 'src/components/css/ToneSelector.css';

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

interface TonesResponse {
  success: boolean;
  tones: string[];
  default: string;
}

interface ToneDescription {
  [key: string]: string;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onToneChange }) => {
  const [availableTones, setAvailableTones] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fallback tones in case API fails
  const defaultTones = [
    'professional', 'casual', 'friendly', 'persuasive',
    'creative', 'authoritative', 'humorous', 'inspirational',
    'conversational', 'educational', 'urgent', 'empathetic'
  ];

  useEffect(() => {
    const fetchTones = async () => {
      try {
        setLoading(true);
        setError('');

        // Check if we're in development and backend might not be running
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/api/content/tones'  // Adjust port as needed
          : '/api/content/tones';

        console.log('Fetching tones from:', apiUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON, got ${contentType}. Server may not be running or endpoint missing.`);
        }

        const data: TonesResponse = await response.json();
        console.log('Tones response:', data);

        if (data.success && Array.isArray(data.tones)) {
          setAvailableTones(data.tones);
          console.log('✅ Loaded tones from API:', data.tones);
        } else {
          throw new Error('Invalid response format from tones API');
        }

      } catch (err) {
        console.error('❌ Failed to load tones:', err);

        let errorMessage = 'Unknown error';
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Request timeout - server may be slow';
          } else if (err.message.includes('fetch')) {
            errorMessage = 'Cannot connect to server - is it running?';
          } else if (err.message.includes('<!DOCTYPE')) {
            errorMessage = 'Server returned HTML instead of JSON - check backend endpoint';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);

        // Use fallback tones
        setAvailableTones(defaultTones);
        console.log('🔄 Using fallback tones:', defaultTones);

      } finally {
        setLoading(false);
      }
    };

    fetchTones();
  }, []);

  const toneDescriptions: ToneDescription = {
    professional: 'Formal and business-appropriate',
    casual: 'Relaxed and conversational',
    friendly: 'Warm and approachable',
    persuasive: 'Compelling and convincing',
    creative: 'Original and imaginative',
    authoritative: 'Expert and confident',
    humorous: 'Light-hearted and fun',
    inspirational: 'Motivating and uplifting',
    conversational: 'Natural and engaging',
    educational: 'Informative and clear',
    urgent: 'Time-sensitive and direct',
    empathetic: 'Understanding and caring'
  };

  const getToneEmoji = (tone: string): string => {
    const emojis: { [key: string]: string } = {
      professional: '👔',
      casual: '😊',
      friendly: '🤝',
      persuasive: '🎯',
      creative: '🎨',
      authoritative: '👨‍⚖️',
      humorous: '😄',
      inspirational: '✨',
      conversational: '💬',
      educational: '📚',
      urgent: '⚡',
      empathetic: '❤️'
    };
    return emojis[tone] || '📝';
  };

  // Ensure selected tone is available
  useEffect(() => {
    if (availableTones.length > 0 && !availableTones.includes(selectedTone)) {
      onToneChange(availableTones[0]);
    }
  }, [availableTones, selectedTone, onToneChange]);

  if (loading) {
    return (
      <div className="tone-selector loading">
        <div className="loading-spinner"></div>
        <span>Loading tones...</span>
      </div>
    );
  }

  return (
    <div className="tone-selector">
      <label htmlFor="tone-select" className="tone-label">
        Select Writing Tone:
      </label>

      {error && (
        <div className="tone-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <span className="error-note">(Using default tones)</span>
        </div>
      )}

      <div className="tone-select-wrapper">
        <select
          id="tone-select"
          value={selectedTone}
          onChange={(e) => onToneChange(e.target.value)}
          className="tone-select"
        >
          {availableTones.map(tone => (
            <option key={tone} value={tone}>
              {getToneEmoji(tone)} {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </option>
          ))}
        </select>
        <div className="tone-description">
          {toneDescriptions[selectedTone] || 'Select a tone for your content'}
        </div>
      </div>

      
    </div>
  );
};

export default ToneSelector;
