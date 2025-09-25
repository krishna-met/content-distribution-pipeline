import React, { useState } from 'react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import contentService from '../../../backend/services/contentService';

const ContentGenerator = () => {
  const [formData, setFormData] = useState({
    content: '',
    platforms: ['twitter', 'linkedin'],
    tone: 'professional'
  });

  // Content generation mutation
  const generateMutation = useMutation(
    (data) => contentService.generateContent(data),
    {
      onSuccess: (data) => {
        toast.success('Content generated successfully!');
        console.log('Generated content:', data);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to generate content');
        console.error('Generation error:', error);
      }
    }
  );

  // Content analysis mutation
  const analyzeMutation = useMutation(
    (content) => contentService.analyzeContent(content),
    {
      onSuccess: (data) => {
        toast.success('Content analyzed successfully!');
        console.log('Analysis:', data);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to analyze content');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Please enter some content to generate');
      return;
    }

    if (formData.platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    generateMutation.mutate(formData);
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const availablePlatforms = ['twitter', 'linkedin', 'instagram', 'youtube'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          AI Content Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Original Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your original content here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availablePlatforms.map(platform => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {platform}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="engaging">Engaging</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={generateMutation.isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateMutation.isLoading ? 'Generating...' : 'Generate Content'}
            </button>
            
            <button
              type="button"
              onClick={() => analyzeMutation.mutate(formData.content)}
              disabled={analyzeMutation.isLoading || !formData.content.trim()}
              className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzeMutation.isLoading ? 'Analyzing...' : 'Analyze Content'}
            </button>
          </div>
        </form>

        {/* Results Display */}
        {generateMutation.data && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Generated Content</h2>
            
            {Object.entries(generateMutation.data.data.generatedContent).map(([platform, data]) => (
              <div key={platform} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 capitalize mb-2">
                  {platform}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap mb-2">
                  {data.content}
                </p>
                {data.usage && (
                  <div className="text-xs text-gray-500">
                    Tokens used: {data.usage.total_tokens}
                  </div>
                )}
              </div>
            ))}

            {generateMutation.data.data.errors && generateMutation.data.data.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Errors</h3>
                {generateMutation.data.data.errors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">
                    {error.platform}: {error.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {analyzeMutation.data && (
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sentiment</p>
                <p className="font-medium text-gray-800">{analyzeMutation.data.data.sentiment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Engagement Score</p>
                <p className="font-medium text-gray-800">{analyzeMutation.data.data.engagementScore}/10</p>
              </div>
            </div>
            {analyzeMutation.data.data.suggestions && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Suggestions</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {analyzeMutation.data.data.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;