// pages/Index.tsx - Improved Layout
import React, { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import DarkModeToggle from '../components/DarkModeToggle';
import ToneSelector from '../components/ToneSelector';
import PlatformSelector from '../components/PlatformSelector';
import SentimentAnalysis from '../components/SentimentAnalysis';
import '../index.css';

interface PlatformData {
  tweets?: string[];
  post?: string;
  content?: string;
  hashtags: string[];
  characterCount: number;
  engagement_tips: string[];
  subject?: string;
  preview?: string;
}

interface AdaptedContent {
  [platform: string]: PlatformData;
}

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

interface ProcessingResult {
  success: boolean;
  data?: {
    adaptedContent: AdaptedContent;
    sentiment: SentimentData;
    tone: string;
    originalContent: string;
    platformsProcessed?: string[];
  };
  error?: string;
  metadata?: {
    processedAt: string;
    toneUsed: string;
    platformsProcessed: string[];
    contentLength: number;
    processingTime: number;
  };
}

const Index: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin', 'instagram', 'newsletter']);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter some content to process');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setLoading(true);
    toast.loading(`Processing content for ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}...`, { id: 'processing' });

    try {
      const response = await fetch('https://content-distribution-pipeline.onrender.com/api/content/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(), 
          tone: selectedTone,
          platforms: selectedPlatforms
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProcessingResult = await response.json();

      if (data.success) {
        setResults(data);
        toast.success(`Content generated for ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}!`, { id: 'processing' });
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Processing failed: ${errorMessage}`, { id: 'processing' });
      setResults(null);
    }

    setLoading(false);
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${platform} content copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const getCharacterColor = (count: number): string => {
    if (count < 2500) return 'text-green-600 dark:text-green-400';
    if (count < 2800) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPlatformIcon = (platform: string): string => {
    const icons: { [key: string]: string } = {
      twitter: '🐦',
      linkedin: '💼',
      instagram: '📸',
      newsletter: '📧'
    };
    return icons[platform] || '📱';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DarkModeToggle />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Content Distribution System
          </h1>
          <p className="text-lg text-muted-foreground">
            Transform your content for multiple platforms with AI-powered optimization
          </p>
        </header>

        {/* Centered Input Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-card border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Writing Tone - Moved to Top */}
              <ToneSelector
                selectedTone={selectedTone}
                onToneChange={setSelectedTone}
              />

              {/* Content Input */}
              <div className="space-y-2">
                <label htmlFor="content-input" className="text-sm font-medium">
                  Enter Your Content
                </label>
                <textarea
                  id="content-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your content here... (minimum 10 characters)"
                  rows={6}
                  maxLength={3000}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  required
                />
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${getCharacterColor(content.length)}`}>
                    {content.length}/3000 characters
                  </span>
                  {content.length < 10 && content.length > 0 && (
                    <span className="text-destructive">Minimum 10 characters required</span>
                  )}
                </div>
              </div>

              {/* Platform Selector - Made Scrollable */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Select Platforms ({selectedPlatforms.length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatforms(['twitter', 'linkedin', 'instagram', 'newsletter'])}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPlatforms([])}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Scrollable Platform Container */}
                <div className="max-h-64 overflow-y-auto border border-input rounded-md p-3 space-y-3 bg-muted/20">
                  <PlatformSelector
                    selectedPlatforms={selectedPlatforms}
                    onPlatformsChange={setSelectedPlatforms}
                  />
                </div>

                {selectedPlatforms.length === 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-2">
                    ⚠️ Please select at least one platform to generate content.
                  </div>
                )}

                {selectedPlatforms.length > 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md p-2">
                    ✅ Content will be generated for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}: {
                      selectedPlatforms
                        .map(id => {
                          const platformNames: { [key: string]: string } = {
                            twitter: 'Twitter/X',
                            linkedin: 'LinkedIn',
                            instagram: 'Instagram',
                            newsletter: 'Newsletter'
                          };
                          return platformNames[id];
                        })
                        .join(', ')
                    }
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading || content.trim().length < 10 || selectedPlatforms.length === 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  `Generate Content (${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''})`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section - Moved Under Generate Button */}
        {results && results.success && results.data && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Generated Content</h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                  {results.data.tone} tone
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md text-sm font-medium">
                  {Object.keys(results.data.adaptedContent).length} platform{Object.keys(results.data.adaptedContent).length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Sentiment Analysis Panel */}
            <div className="max-w-3xl mx-auto mb-8">
              <SentimentAnalysis sentiment={results.data.sentiment} />
            </div>

            {/* Platform Content Grid */}
            <div>
              <h3 className="text-xl font-bold text-center mb-6">Platform-Optimized Content</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(results.data.adaptedContent).map(([platform, data]) => (
                  <div key={platform} className="bg-card border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(platform)}</span>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                          {data.hashtags.length} hashtags
                        </span>
                        <button
                          onClick={() => copyToClipboard(
                            data.post || data.content || data.tweets?.join('\n\n') || '',
                            platform
                          )}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {platform === 'twitter' && data.tweets ? (
                        <div>
                          <h4 className="font-medium mb-2">Tweet Thread ({data.tweets.length} tweets)</h4>
                          <div className="space-y-3">
                            {data.tweets.map((tweet, index) => (
                              <div key={index} className="bg-muted/30 rounded-md p-3">
                                <div className="flex items-start gap-2">
                                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                                    {index + 1}
                                  </span>
                                  <p className="text-sm flex-1">{tweet}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : platform === 'newsletter' ? (
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Subject</h4>
                            <p className="text-sm">{data.subject}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Preview</h4>
                            <p className="text-sm">{data.preview}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Content</h4>
                            <div className="bg-muted/30 rounded-md p-3">
                              <p className="text-sm">{data.content}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium mb-2">Content</h4>
                          <div className="bg-muted/30 rounded-md p-3">
                            <p className="text-sm">{data.post || data.content}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">AI-Generated Hashtags ({data.hashtags.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {data.hashtags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              onClick={() => copyToClipboard(`#${tag}`, `${platform} hashtag`)}
                              title="Click to copy"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {data.engagement_tips && data.engagement_tips.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-1">
                            💡 Engagement Tips
                          </h4>
                          <ul className="space-y-1">
                            {data.engagement_tips.map((tip, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Characters: {data.characterCount}</span>
                        <span>Hashtags: {data.hashtags.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {results.metadata && (
              <div className="max-w-3xl mx-auto bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-center">Processing Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div className="text-center">
                    <span className="font-medium">Processed:</span><br />
                    {new Date(results.metadata.processedAt).toLocaleString()}
                  </div>
                  <div className="text-center">
                    <span className="font-medium">Content Length:</span><br />
                    {results.metadata.contentLength} characters
                  </div>
                  <div className="text-center">
                    <span className="font-medium">Tone Used:</span><br />
                    {results.metadata.toneUsed}
                  </div>
                  <div className="text-center">
                    <span className="font-medium">Platforms:</span><br />
                    {results.metadata.platformsProcessed}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!results && (
          <div className="max-w-2xl mx-auto bg-muted/30 border-2 border-dashed rounded-lg p-12 text-center">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-medium mb-2">Ready to Generate Content</h3>
              <p>Select your platforms, choose a tone, and enter your content to get started with AI-powered multi-platform optimization.</p>
              {selectedPlatforms.length > 0 && (
                <div className="mt-4 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected:
                  </span>{' '}
                  {selectedPlatforms.map(id => {
                    const platformNames: { [key: string]: string } = {
                      twitter: 'Twitter/X',
                      linkedin: 'LinkedIn', 
                      instagram: 'Instagram',
                      newsletter: 'Newsletter'
                    };
                    return platformNames[id];
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
