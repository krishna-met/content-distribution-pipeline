// components/SentimentAnalysis.tsx
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface SentimentData {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
}

interface SentimentAnalysisProps {
  sentiment: SentimentData;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ sentiment }) => {
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentBgColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: { [key: string]: string } = {
      joy: '😊',
      anger: '😠',
      fear: '😰',
      sadness: '😢',
      surprise: '😲'
    };
    return icons[emotion] || '😐';
  };

  const getEmotionColor = (value: number) => {
    if (value >= 0.7) return 'text-red-600 dark:text-red-400';
    if (value >= 0.5) return 'text-orange-600 dark:text-orange-400';
    if (value >= 0.3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatScore = (score: number) => {
    return score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        📊 Sentiment Analysis
      </h3>

      {/* Overall Sentiment */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBgColor(sentiment.label)} ${getSentimentColor(sentiment.label)}`}>
              {sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              Score: <span className={`font-mono font-medium ${getSentimentColor(sentiment.label)}`}>
                {formatScore(sentiment.score)}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Confidence: {(sentiment.confidence * 100).toFixed(0)}%
          </div>
        </div>

        {/* Sentiment Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Negative (-1.0)</span>
            <span>Neutral (0.0)</span>
            <span>Positive (+1.0)</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            {/* Negative section */}
            <div className="absolute left-0 w-1/2 h-full bg-red-200 dark:bg-red-900/50 rounded-l-full"></div>
            {/* Positive section */}
            <div className="absolute right-0 w-1/2 h-full bg-green-200 dark:bg-green-900/50 rounded-r-full"></div>
            {/* Score indicator */}
            <div
              className={`absolute top-0 h-full w-2 rounded-full ${
                sentiment.score > 0 ? 'bg-green-600' : sentiment.score < 0 ? 'bg-red-600' : 'bg-gray-600'
              }`}
              style={{
                left: `${((sentiment.score + 1) / 2) * 100 - 1}%`,
                transform: 'translateX(-50%)'
              }}
            ></div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className="font-medium">{(sentiment.confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={sentiment.confidence * 100} className="h-2" />
        </div>
      </div>

      {/* Emotional Breakdown */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">Emotional Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(sentiment.emotions).map(([emotion, value]) => (
            <div key={emotion} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[80px]">
                <span className="text-lg">{getEmotionIcon(emotion)}</span>
                <span className="text-sm capitalize text-muted-foreground">
                  {emotion}
                </span>
              </div>
              <div className="flex-1">
                <Progress value={value * 100} className="h-2" />
              </div>
              <div className={`text-sm font-mono min-w-[45px] text-right ${getEmotionColor(value)}`}>
                {(value * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-3 bg-muted/50 rounded-md">
        <h4 className="text-sm font-medium mb-2">💡 Interpretation</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          {sentiment.label === 'positive' && (
            <p>This content expresses <strong>positive sentiment</strong> with optimism and favorable emotions.</p>
          )}
          {sentiment.label === 'negative' && (
            <p>This content shows <strong>negative sentiment</strong> with critical or unfavorable emotions.</p>
          )}
          {sentiment.label === 'neutral' && (
            <p>This content maintains <strong>neutral sentiment</strong> with balanced, factual tone.</p>
          )}

          {sentiment.confidence < 0.5 && (
            <p className="text-amber-600 dark:text-amber-400">
              ⚠️ Low confidence score suggests mixed or ambiguous emotional signals.
            </p>
          )}

          {Math.max(...Object.values(sentiment.emotions)) > 0.7 && (
            <p>
              Strong emotional intensity detected in {Object.entries(sentiment.emotions)
                .filter(([_, value]) => value > 0.7)
                .map(([emotion]) => emotion)
                .join(', ')}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;