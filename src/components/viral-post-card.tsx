'use client';

import * as React from 'react';
import { Copy, Check, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import type { ViralPost } from '@/lib/comment-generator';

const HOOK_COLORS: Record<string, string> = {
  contrarian: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-900',
  list: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-900',
  story: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border-purple-200 dark:border-purple-900',
  thread: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-200 dark:border-cyan-900',
  question: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-900',
  hot_take: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200 border-orange-200 dark:border-orange-900',
  data_point: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900',
  vulnerability: 'bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200 border-pink-200 dark:border-pink-900',
  mixed: 'bg-muted text-muted-foreground border-border',
};

interface ViralPostCardProps {
  post: ViralPost;
  index: number;
}

export function ViralPostCard({ post, index }: ViralPostCardProps) {
  const [copied, setCopied] = React.useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.text);
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

  const colorClass = HOOK_COLORS[post.hookKey] || HOOK_COLORS['mixed'];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn('font-medium', colorClass)}>
              <Flame className="ml-1 h-3 w-3" />
              {post.hookLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {post.wordCount} {t('comment.words')}
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
        {/* English post */}
        <div className="ltr flex items-start gap-2 rounded-md bg-muted/50 p-3 text-[15px] leading-relaxed">
          <Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
          <p className="whitespace-pre-wrap font-medium">{post.text}</p>
        </div>

        {/* Persian translation */}
        {post.persianTranslation && (
          <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-sm leading-relaxed">
            <div>
              <span className="ml-1 text-[11px] font-semibold text-primary">
                {t('comment.translation')}:
              </span>
              <span className="text-foreground">{post.persianTranslation}</span>
            </div>
          </div>
        )}

        {post.reasoning && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{t('comment.why')} </span>
            {post.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
