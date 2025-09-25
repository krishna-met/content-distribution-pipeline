import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';

interface ContentInputProps {
  content: string;
  onContentChange: (content: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function ContentInput({ 
  content, 
  onContentChange, 
  onProcess, 
  isProcessing 
}: ContentInputProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-blue-600" />
          Content Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your original content here... (e.g., blog post, article, announcement)"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[150px] resize-none"
          disabled={isProcessing}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {content.length} characters
          </span>
          <Button 
            onClick={onProcess} 
            disabled={!content.trim() || isProcessing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}