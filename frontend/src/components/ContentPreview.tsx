import { AdaptedContent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Twitter, Linkedin, Instagram, Mail, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContentPreviewProps {
  adaptedContent: AdaptedContent;
  selectedPlatforms: string[];
}

export default function ContentPreview({ adaptedContent, selectedPlatforms }: ContentPreviewProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(platform));
      toast.success(`${platform} content copied to clipboard!`);
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(platform);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  const platformConfigs = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-500',
      content: adaptedContent.twitter,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      content: adaptedContent.linkedin,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      content: adaptedContent.instagram,
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      icon: Mail,
      color: 'text-purple-600',
      content: adaptedContent.newsletter,
    },
  ];

  const filteredPlatforms = platformConfigs.filter(platform => 
    selectedPlatforms.includes(platform.id)
  );

  if (filteredPlatforms.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Select platforms to see content previews</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {filteredPlatforms.map((platform) => {
        const IconComponent = platform.icon;
        const isCopied = copiedItems.has(platform.id);

        return (
          <Card key={platform.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className={`h-5 w-5 ${platform.color}`} />
                  {platform.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {platform.id !== 'newsletter' && (
                    <Badge variant="outline">
                      {platform.content.characterCount} chars
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const textToCopy = platform.id === 'twitter' 
                        ? platform.content.tweets.join('\n\n')
                        : platform.id === 'newsletter'
                        ? `Subject: ${platform.content.subject}\n\n${platform.content.content}`
                        : platform.content.post || platform.content.caption;
                      copyToClipboard(textToCopy, platform.name);
                    }}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {platform.id === 'twitter' && (
                <div className="space-y-3">
                  {platform.content.tweets.map((tweet, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm">{tweet}</p>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {platform.content.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {platform.id === 'linkedin' && (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{platform.content.post}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {platform.content.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {platform.id === 'instagram' && (
                <div className="space-y-3">
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{platform.content.caption}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {platform.content.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {platform.id === 'newsletter' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Subject Line</h4>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium">{platform.content.subject}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Preview Text</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{platform.content.preview}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Email Content</h4>
                    <div className="p-4 bg-white border rounded-lg max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">{platform.content.content}</pre>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}