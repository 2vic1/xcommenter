'use client';

import * as React from 'react';
import {
  Sparkles,
  Link2,
  FileText,
  Settings2,
  Wand2,
  Loader2,
  AlertCircle,
  ClipboardCheck,
  History,
  Trash2,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  MessageCircle,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { CommentCard } from '@/components/comment-card';
import { useLanguage } from '@/components/language-provider';
import { toast } from '@/hooks/use-toast';
import type { TranslationKey } from '@/lib/translations';
import { cn } from '@/lib/utils';

type Tone = 'friendly' | 'professional' | 'casual' | 'witty' | 'expert';
type CommentLength = 'short' | 'medium' | 'long';
type Angle =
  | 'mixed'
  | 'question'
  | 'agreement'
  | 'insight'
  | 'experience'
  | 'praise'
  | 'humor'
  | 'counterpoint';
type EnglishLevel = 'simple' | 'intermediate' | 'advanced';

interface CommentSuggestion {
  text: string;
  persianTranslation: string;
  angleLabel: string;
  angleKey: string;
  reasoning: string;
  wordCount: number;
}

interface GenerateResult {
  comments: CommentSuggestion[];
  tweetSummary: string;
  imagePrompt?: string;
  imageDataUrl?: string;
  imageError?: string;
}

interface HistoryEntry {
  id: string;
  tweetText: string;
  tweetSummary: string;
  comments: CommentSuggestion[];
  createdAt: number;
  settings: { tone: Tone; length: CommentLength; angle: Angle };
  imageDataUrl?: string;
}

interface RulesResponse {
  success: boolean;
  xRules?: string;
  userPreferences?: string;
  loadedAt?: number;
  cached?: boolean;
  error?: string;
}

const HISTORY_KEY = 'commentyar-history';
const MAX_HISTORY = 20;

export default function Home() {
  const { t, lang, dir } = useLanguage();

  // Input state
  const [inputMode, setInputMode] = React.useState<'link' | 'text'>('text');
  const [tweetUrl, setTweetUrl] = React.useState('');
  const [tweetContent, setTweetContent] = React.useState('');
  const [fetching, setFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState('');

  // Settings state
  const [tone, setTone] = React.useState<Tone>('friendly');
  const [length, setLength] = React.useState<CommentLength>('medium');
  const [angle, setAngle] = React.useState<Angle>('mixed');
  const [englishLevel, setEnglishLevel] = React.useState<EnglishLevel>('simple');
  const [emojiCount, setEmojiCount] = React.useState(1);
  const [emojiStyle, setEmojiStyle] = React.useState<'variety' | 'consistent'>('variety');
  const [includeQuestion, setIncludeQuestion] = React.useState(false);
  const [count, setCount] = React.useState(5);
  const [generateImageEnabled, setGenerateImageEnabled] = React.useState(false);

  // API key settings
  const [apiSource, setApiSource] = React.useState<'site' | 'personal'>('site');
  const [apiKeyInput, setApiKeyInput] = React.useState('');
  const [savedApiKey, setSavedApiKey] = React.useState('');

  // Generation state
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState<GenerateResult | null>(null);
  const [genError, setGenError] = React.useState('');
  const [imageLoading, setImageLoading] = React.useState(false);

  // History
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  // Rules
  const [rules, setRules] = React.useState<{ xRules: string; userPreferences: string } | null>(null);
  const [rulesLoading, setRulesLoading] = React.useState(true);

  // Options arrays (memoized, depend on language)
  const TONES = React.useMemo(
    () => [
      { value: 'friendly' as Tone, label: t('tone.friendly'), hint: t('tone.friendly.hint') },
      { value: 'professional' as Tone, label: t('tone.professional'), hint: t('tone.professional.hint') },
      { value: 'casual' as Tone, label: t('tone.casual'), hint: t('tone.casual.hint') },
      { value: 'witty' as Tone, label: t('tone.witty'), hint: t('tone.witty.hint') },
      { value: 'expert' as Tone, label: t('tone.expert'), hint: t('tone.expert.hint') },
    ],
    [t]
  );

  const LENGTHS = React.useMemo(
    () => [
      { value: 'short' as CommentLength, label: t('length.short'), hint: t('length.short.hint') },
      { value: 'medium' as CommentLength, label: t('length.medium'), hint: t('length.medium.hint') },
      { value: 'long' as CommentLength, label: t('length.long'), hint: t('length.long.hint') },
    ],
    [t]
  );

  const ANGLES = React.useMemo(
    () => [
      { value: 'mixed' as Angle, label: t('angle.mixed') },
      { value: 'question' as Angle, label: t('angle.question') },
      { value: 'agreement' as Angle, label: t('angle.agreement') },
      { value: 'insight' as Angle, label: t('angle.insight') },
      { value: 'experience' as Angle, label: t('angle.experience') },
      { value: 'praise' as Angle, label: t('angle.praise') },
      { value: 'humor' as Angle, label: t('angle.humor') },
      { value: 'counterpoint' as Angle, label: t('angle.counterpoint') },
    ],
    [t]
  );

  const LEVELS = React.useMemo(
    () => [
      { value: 'simple' as EnglishLevel, label: t('level.simple'), hint: t('level.simple.hint') },
      { value: 'intermediate' as EnglishLevel, label: t('level.intermediate'), hint: t('level.intermediate.hint') },
      { value: 'advanced' as EnglishLevel, label: t('level.advanced'), hint: t('level.advanced.hint') },
    ],
    [t]
  );

  // Load history, rules, and saved API key on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
      const savedKey = localStorage.getItem('commentyar-api-key');
      if (savedKey && savedKey.trim().length > 0) {
        setSavedApiKey(savedKey.trim());
        setApiSource('personal');
        setApiKeyInput(savedKey.trim());
      }
    } catch {
      // ignore
    }

    fetch('/api/rules')
      .then((r) => r.json())
      .then((data: RulesResponse) => {
        if (data.success && data.xRules !== undefined) {
          setRules({ xRules: data.xRules, userPreferences: data.userPreferences || '' });
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => setRulesLoading(false));
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      toast({ title: t('toast.urlRequired'), description: t('settings.apiKeyPlaceholder'), variant: 'destructive' });
      return;
    }
    try {
      localStorage.setItem('commentyar-api-key', trimmed);
      setSavedApiKey(trimmed);
      setApiSource('personal');
      toast({ title: t('settings.apiKeySaved') });
    } catch {
      toast({ title: t('toast.networkError'), variant: 'destructive' });
    }
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('commentyar-api-key');
    } catch {
      // ignore
    }
    setSavedApiKey('');
    setApiKeyInput('');
    setApiSource('site');
    toast({ title: t('settings.apiKeyCleared') });
  };

  const effectiveApiKey = apiSource === 'personal' && savedApiKey ? savedApiKey : undefined;

  const persistHistory = React.useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, []);

  const handleFetchTweet = async () => {
    if (!tweetUrl.trim()) {
      toast({ title: t('toast.urlRequired'), variant: 'destructive' });
      return;
    }
    setFetching(true);
    setFetchError('');
    try {
      const res = await fetch('/api/fetch-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tweetUrl }),
      });
      const data = await res.json();
      if (!data.success) {
        setFetchError(data.error || t('toast.fetchFailed'));
        toast({
          title: t('toast.fetchFailed'),
          description: t('toast.fetchFailedDesc'),
          variant: 'destructive',
        });
        return;
      }
      if (data.text && data.text.trim().length > 0) {
        setTweetContent(data.text);
        toast({
          title: t('toast.fetched'),
          description: data.author ? `@${data.author}` : undefined,
        });
      } else {
        setFetchError(data.error || t('toast.fetchEmpty'));
        toast({
          title: t('toast.fetchEmpty'),
          description: t('toast.fetchEmptyDesc'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.networkError');
      setFetchError(msg);
      toast({ title: t('toast.networkError'), description: msg, variant: 'destructive' });
    } finally {
      setFetching(false);
    }
  };

  const handleGenerate = async () => {
    let effectiveContent = tweetContent.trim();
    if (!effectiveContent && tweetUrl.trim()) {
      setFetching(true);
      setFetchError('');
      try {
        const fres = await fetch('/api/fetch-tweet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: tweetUrl }),
        });
        const fdata = await fres.json();
        if (fdata.success && fdata.text && fdata.text.trim().length > 0) {
          effectiveContent = fdata.text.trim();
          setTweetContent(effectiveContent);
          toast({
            title: t('toast.fetchedFromLink'),
            description: fdata.author ? `@${fdata.author}` : undefined,
          });
        } else {
          toast({
            title: t('toast.fetchBlocked'),
            description: t('toast.fetchBlockedDesc'),
            variant: 'destructive',
          });
          setFetchError(fdata.error || t('toast.fetchEmpty'));
          return;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('toast.networkError');
        toast({ title: t('toast.networkError'), description: msg, variant: 'destructive' });
        return;
      } finally {
        setFetching(false);
      }
    }

    if (!effectiveContent) {
      toast({
        title: t('toast.contentRequired'),
        description: t('toast.contentRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }
    setGenerating(true);
    setGenError('');
    setResult(null);
    setImageLoading(false);
    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetContent: effectiveContent,
          tone,
          length,
          angle,
          emojiCount,
          emojiStyle,
          includeQuestion,
          englishLevel,
          count,
          apiKey: effectiveApiKey,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setGenError(data.error || t('toast.genError'));
        toast({ title: t('toast.genError'), description: data.error, variant: 'destructive' });
        return;
      }
      const generated: GenerateResult = {
        comments: data.comments || [],
        tweetSummary: data.tweetSummary || '',
        imagePrompt: data.imagePrompt,
        imageDataUrl: undefined,
        imageError: undefined,
      };
      setResult(generated);

      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        tweetText: effectiveContent.slice(0, 300),
        tweetSummary: generated.tweetSummary,
        comments: generated.comments,
        createdAt: Date.now(),
        settings: { tone, length, angle },
      };
      persistHistory([entry, ...history].slice(0, MAX_HISTORY));

      toast({
        title: `${generated.comments.length} ${t('toast.generated')}`,
        description: t('toast.generatedDesc'),
      });

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // Generate the image SEPARATELY in the background (avoids the long
      // single-request timeout that was causing HTML error pages instead of JSON).
      if (generateImageEnabled && generated.imagePrompt && generated.imagePrompt.trim().length > 3) {
        generateImageInBackground(generated.imagePrompt, effectiveApiKey, entry.id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.networkError');
      setGenError(msg);
      toast({ title: t('toast.networkError'), description: msg, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Generate the relevant image in the background, separately from comments.
   * Updates the current result + history entry when the image is ready.
   */
  const generateImageInBackground = async (
    imagePrompt: string,
    apiKey: string | undefined,
    historyEntryId: string
  ) => {
    setImageLoading(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, apiKey }),
      });
      const data = await res.json();
      if (data.success && data.dataUrl) {
        // Update the current result with the image
        setResult((prev) =>
          prev ? { ...prev, imageDataUrl: data.dataUrl, imageError: undefined } : prev
        );
        // Update the history entry too
        setHistory((prevHistory) => {
          const updated = prevHistory.map((h) =>
            h.id === historyEntryId ? { ...h, imageDataUrl: data.dataUrl } : h
          );
          try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
        toast({ title: t('results.image') + ' ✓' });
      } else {
        const errMsg = data.error || 'unknown';
        setResult((prev) => (prev ? { ...prev, imageError: errMsg } : prev));
        toast({
          title: t('results.imageError'),
          description: errMsg,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.networkError');
      setResult((prev) => (prev ? { ...prev, imageError: msg } : prev));
      toast({ title: t('results.imageError'), description: msg, variant: 'destructive' });
    } finally {
      setImageLoading(false);
    }
  };

  const handleClearHistory = () => {
    persistHistory([]);
    toast({ title: t('toast.historyCleared') });
  };

  const handleRestoreFromHistory = (entry: HistoryEntry) => {
    setTweetContent(entry.tweetText);
    setResult({
      comments: entry.comments,
      tweetSummary: entry.tweetSummary,
      imageDataUrl: entry.imageDataUrl,
      imageError: undefined,
    });
    setTone(entry.settings.tone);
    setLength(entry.settings.length);
    setAngle(entry.settings.angle);
    setInputMode('text');
    toast({ title: t('toast.restored') });
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const canGenerate =
    (tweetContent.trim().length > 2 || tweetUrl.trim().length > 5) &&
    !generating &&
    !fetching;

  const isRtl = dir === 'rtl';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold sm:text-lg">{t('app.title')}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-1.5 sm:flex"
              onClick={() => document.getElementById('rules-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ShieldCheck className="h-4 w-4" />
              {t('app.rules')}
            </Button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Hero */}
        <section className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {t('hero.badge')}
          </div>
          <h2 className="mx-auto max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">
            {t('hero.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('hero.desc')}
          </p>
        </section>

        {/* Input + Settings grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Input card */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('input.title')}
                </CardTitle>
                <CardDescription>{t('input.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all',
                      inputMode === 'text'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    {t('input.tabText')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('link')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all',
                      inputMode === 'link'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Link2 className="h-4 w-4" />
                    {t('input.tabLink')}
                  </button>
                </div>

                {inputMode === 'link' ? (
                  <div className="space-y-2">
                    <Label htmlFor="tweet-url">{t('input.urlLabel')}</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="tweet-url"
                        dir="ltr"
                        placeholder={t('input.urlPlaceholder')}
                        value={tweetUrl}
                        onChange={(e) => setTweetUrl(e.target.value)}
                        className="ltr text-left"
                      />
                      <Button
                        onClick={handleFetchTweet}
                        disabled={fetching}
                        className="shrink-0 gap-1.5"
                      >
                        {fetching ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('input.fetching')}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            {t('input.fetch')}
                          </>
                        )}
                      </Button>
                    </div>
                    {fetchError && (
                      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{fetchError}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{t('input.urlHint')}</p>
                  </div>
                ) : null}

                {/* Tweet content textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tweet-content">{t('input.contentLabel')}</Label>
                    {tweetContent && (
                      <span className="text-xs text-muted-foreground">
                        {tweetContent.length} {t('input.chars')}
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="tweet-content"
                    dir="ltr"
                    placeholder="Paste the tweet text here..."
                    value={tweetContent}
                    onChange={(e) => setTweetContent(e.target.value)}
                    className="min-h-[140px] ltr text-left font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{t('input.editHint')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings card */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings2 className="h-5 w-5 text-primary" />
                  {t('settings.title')}
                </CardTitle>
                <CardDescription>{t('settings.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('settings.tone')}</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((to) => (
                        <SelectItem key={to.value} value={to.value}>
                          <span className="font-medium">{to.label}</span>
                          <span className="text-muted-foreground"> — {to.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('settings.length')}</Label>
                  <Select value={length} onValueChange={(v) => setLength(v as CommentLength)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LENGTHS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          <span className="font-medium">{l.label}</span>
                          <span className="text-muted-foreground"> — {l.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('settings.angle')}</Label>
                  <Select value={angle} onValueChange={(v) => setAngle(v as Angle)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANGLES.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t('settings.level')}</Label>
                  <Select value={englishLevel} onValueChange={(v) => setEnglishLevel(v as EnglishLevel)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((lv) => (
                        <SelectItem key={lv.value} value={lv.value}>
                          <span className="font-medium">{lv.label}</span>
                          <span className="text-muted-foreground"> — {lv.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">{t('settings.count')}</Label>
                    <Badge variant="secondary" className="tabular-nums">{count}</Badge>
                  </div>
                  <Slider
                    value={[count]}
                    onValueChange={(v) => setCount(v[0])}
                    min={3}
                    max={8}
                    step={1}
                  />
                </div>

                <Separator />

                {/* Emoji count slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">{t('settings.emojiCount')}</Label>
                    <Badge variant="secondary" className="tabular-nums">{emojiCount}</Badge>
                  </div>
                  <Slider
                    value={[emojiCount]}
                    onValueChange={(v) => setEmojiCount(v[0])}
                    min={0}
                    max={3}
                    step={1}
                  />
                </div>

                {/* Emoji style (only relevant if count > 0) */}
                {emojiCount > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{t('settings.emojiStyle')}</Label>
                    <Select value={emojiStyle} onValueChange={(v) => setEmojiStyle(v as 'variety' | 'consistent')}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="variety">
                          <span className="font-medium">{t('settings.emojiStyle.variety')}</span>
                          <span className="text-muted-foreground"> — {t('settings.emojiStyle.varietyHint')}</span>
                        </SelectItem>
                        <SelectItem value="consistent">
                          <span className="font-medium">{t('settings.emojiStyle.consistent')}</span>
                          <span className="text-muted-foreground"> — {t('settings.emojiStyle.consistentHint')}</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="question-switch" className="text-xs font-semibold">{t('settings.question')}</Label>
                      <p className="text-[11px] text-muted-foreground">{t('settings.questionHint')}</p>
                    </div>
                    <Switch id="question-switch" checked={includeQuestion} onCheckedChange={setIncludeQuestion} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="image-switch" className="text-xs font-semibold">{t('settings.image')}</Label>
                      <p className="text-[11px] text-muted-foreground">{t('settings.imageHint')}</p>
                    </div>
                    <Switch id="image-switch" checked={generateImageEnabled} onCheckedChange={setGenerateImageEnabled} />
                  </div>
                </div>

                <Separator />

                {/* API key settings */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{t('settings.apiSource')}</Label>
                    <Select value={apiSource} onValueChange={(v) => setApiSource(v as 'site' | 'personal')}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site">
                          <span className="font-medium">{t('settings.apiSource.site')}</span>
                          <span className="text-muted-foreground"> — {t('settings.apiSource.siteHint')}</span>
                        </SelectItem>
                        <SelectItem value="personal">
                          <span className="font-medium">{t('settings.apiSource.personal')}</span>
                          <span className="text-muted-foreground"> — {t('settings.apiSource.personalHint')}</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {apiSource === 'personal' && (
                    <div className="space-y-2">
                      <Label htmlFor="api-key-input" className="text-xs font-semibold">{t('settings.apiKeyLabel')}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="api-key-input"
                          type="password"
                          dir="ltr"
                          placeholder={t('settings.apiKeyPlaceholder')}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          className="ltr text-left font-mono text-xs"
                        />
                        <Button size="sm" variant="default" className="shrink-0" onClick={handleSaveApiKey}>
                          {t('settings.apiKeySave')}
                        </Button>
                        {savedApiKey && (
                          <Button size="sm" variant="outline" className="shrink-0" onClick={handleClearApiKey}>
                            {t('settings.apiKeyClear')}
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">{t('settings.apiKeyDesc')}</p>
                      {savedApiKey && (
                        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          ✓ {t('settings.apiKeySaved')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generate button */}
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="h-12 gap-2 px-8 text-base shadow-md"
          >
            {fetching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('generate.fetching')}
              </>
            ) : generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('generate.generating')}
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                {t('generate.button')}
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        <section id="results-section" className="mt-10 scroll-mt-20">
          {generating && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('results.analyzing')}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: count }).map((_, i) => (
                  <Skeleton key={i} className="h-52 w-full rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {!generating && genError && (
            <Card className="border-destructive/30">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">{t('toast.genErrorTitle')}</p>
                  <p className="text-sm text-muted-foreground">{genError}</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={handleGenerate}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t('toast.retry')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!generating && !genError && result && (
            <div className="space-y-5">
              {result.tweetSummary && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{t('results.summary')}</p>
                      <p className="mt-1 text-sm leading-relaxed">{result.tweetSummary}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated image */}
              {generateImageEnabled && (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t('results.image')}
                      {imageLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">{t('results.imageHint')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.imageDataUrl ? (
                      <div className="space-y-3">
                        <div className="overflow-hidden rounded-lg border">
                          <img
                            src={result.imageDataUrl}
                            alt={t('results.image')}
                            className="mx-auto max-h-80 w-auto object-contain"
                          />
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={result.imageDataUrl}
                            download={`comment-image-${Date.now()}.png`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-muted"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {t('comment.copy')}
                          </a>
                        </div>
                      </div>
                    ) : imageLoading ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{t('results.imageGenerating')}</p>
                        <Skeleton className="h-64 w-64 rounded-lg" />
                      </div>
                    ) : result.imageError ? (
                      <p className="text-sm text-destructive">{t('results.imageError')}: {result.imageError}</p>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  {result.comments.length} {t('results.count')}
                </h3>
                <span className="text-xs text-muted-foreground">{t('results.copyHint')}</span>
              </div>

              {result.comments.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    {t('results.empty')}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {result.comments.map((c, i) => (
                    <CommentCard key={i} comment={c} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* History */}
        {history.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <History className="h-5 w-5 text-primary" />
                {t('history.title')} ({history.length})
              </h3>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleClearHistory}>
                <Trash2 className="h-3.5 w-3.5" />
                {t('history.clear')}
              </Button>
            </div>
            <ScrollArea className="max-h-96 scrollbar-thin rounded-xl border">
              <div className="divide-y">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleRestoreFromHistory(entry)}
                    className="flex w-full items-start gap-3 p-3 text-right transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="ltr truncate text-left text-xs text-muted-foreground" dir="ltr">
                        {entry.tweetText}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {entry.tweetSummary && (
                          <span className="truncate text-xs font-medium">
                            {entry.tweetSummary}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {entry.comments.length} {t('comment.words').replace('کلمه', '').trim() || '✓'}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </section>
        )}

        {/* Rules section */}
        <section id="rules-section" className="mt-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t('rules.title')}
              </CardTitle>
              <CardDescription>{t('rules.desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : rules && rules.xRules ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="x-rules">
                    <AccordionTrigger className="text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {t('rules.fullTitle')}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="max-h-96 scrollbar-thin rounded-md border bg-muted/30 p-4">
                        <pre className="ltr whitespace-pre-wrap text-left text-xs leading-relaxed">
                          {rules.xRules}
                        </pre>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="user-prefs">
                    <AccordionTrigger className="text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        {t('rules.userPrefs')}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="max-h-80 scrollbar-thin rounded-md border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                          {rules.userPreferences || t('rules.noPrefs')}
                        </pre>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  {t('rules.loadFailed')}
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{t('rules.cachedNote')}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Sticky Footer */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <span>{t('footer.tagline')}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t('footer.note')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
