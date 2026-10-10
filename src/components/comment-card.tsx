'use client';

import * as React from 'react';
import { Copy, Check, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { CommentSuggestion } from '@/lib/comment-generator';

const ANGLE_COLORS: Record<string, string> = {
  question: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-900',
  agreement: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900',
  insight: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200 border-violet-200 dark:border-violet-900',
  experience: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-200 dark:border-rose-900',
  praise: 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200 border-pink-200 dark:border-pink-900',
  humor: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200 border-orange-200 dark:border-orange-900',
  counterpoint: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 border-teal-200 dark:border-teal-900',
  expansion: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-200 dark:border-cyan-900',
  resource: 'bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-200 border-lime-200 dark:border-lime-900',
};

interface CommentCardProps {
  comment: CommentSuggestion;
  index: number;
}

export function CommentCard({ comment, index }: CommentCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(comment.text);
      setCopied(true);
      toast({
        title: 'کامنت کپی شد!',
        description: 'حالا در توییت پیست (Paste) کنید.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'کپی ناموفق بود',
        description: 'لطفاً متن را دستی انتخاب و کپی کنید.',
        variant: 'destructive',
      });
    }
  };

  const colorClass =
    ANGLE_COLORS[comment.angleKey] ||
    'bg-muted text-muted-foreground border-border';

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn('font-medium', colorClass)}>
              {comment.angleLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {comment.wordCount} کلمه
            </span>
          </div>
          <Button
            size="sm"
            variant={copied ? 'default' : 'outline'}
            onClick={handleCopy}
            className="shrink-0 gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                کپی شد
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                کپی
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="ltr flex items-start gap-2 rounded-md bg-muted/50 p-3 text-[15px] leading-relaxed">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="font-medium">{comment.text}</p>
        </div>
        {comment.reasoning && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">چرا کار می‌کند: </span>
            {comment.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
