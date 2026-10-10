'use client';

import * as React from 'react';
import { Copy, Check, MessageSquareText, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';
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
  const { t, lang } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(comment.text);
      setCopied(true);
      toast({
        title: t('toast.copied'),
        description: t('toast.copiedDesc'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t('toast.copyFailed'),
        description: t('toast.copyFailedDesc'),
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
              {comment.wordCount} {t('comment.words')}
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
                {t('comment.copied')}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {t('comment.copy')}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* English comment */}
        <div className="ltr flex items-start gap-2 rounded-md bg-muted/50 p-3 text-[15px] leading-relaxed">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="font-medium">{comment.text}</p>
        </div>

        {/* Persian translation so the user understands what it means */}
        {comment.persianTranslation && (
          <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-sm leading-relaxed">
            <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div>
              <span className="ml-1 text-[11px] font-semibold text-primary">
                {t('comment.translation')}:
              </span>
              <span className="text-foreground">{comment.persianTranslation}</span>
            </div>
          </div>
        )}

        {comment.reasoning && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{t('comment.why')} </span>
            {comment.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
