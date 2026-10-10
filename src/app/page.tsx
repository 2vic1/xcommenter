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
import { CommentCard } from '@/components/comment-card';
import { toast } from '@/hooks/use-toast';
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
  angleLabel: string;
  angleKey: string;
  reasoning: string;
  wordCount: number;
}

interface GenerateResult {
  comments: CommentSuggestion[];
  tweetSummary: string;
}

interface HistoryEntry {
  id: string;
  tweetText: string;
  tweetSummary: string;
  comments: CommentSuggestion[];
  createdAt: number;
  settings: { tone: Tone; length: CommentLength; angle: Angle };
}

interface RulesResponse {
  success: boolean;
  xRules?: string;
  userPreferences?: string;
  loadedAt?: number;
  cached?: boolean;
  error?: string;
}

const TONES: { value: Tone; label: string; hint: string }[] = [
  { value: 'friendly', label: 'صمیمی', hint: 'دوستانه و گرم' },
  { value: 'professional', label: 'حرفه‌ای', hint: 'رسمی و جدی' },
  { value: 'casual', label: 'عادی', hint: 'روزمره و ساده' },
  { value: 'witty', label: 'باهوش', hint: 'شوخ‌طبع و هوشمندانه' },
  { value: 'expert', label: 'متخصص', hint: 'دانش‌محور و دقیق' },
];

const LENGTHS: { value: CommentLength; label: string; hint: string }[] = [
  { value: 'short', label: 'کوتاه', hint: '۱ تا ۱۵ کلمه' },
  { value: 'medium', label: 'متوسط', hint: '۱۵ تا ۴۰ کلمه' },
  { value: 'long', label: 'بلند', hint: '۴۰ تا ۸۰ کلمه' },
];

const ANGLES: { value: Angle; label: string }[] = [
  { value: 'mixed', label: 'متنوع (پیشنهاد می‌شود)' },
  { value: 'question', label: 'سوال کنجکاو' },
  { value: 'agreement', label: 'موافقت + بینش' },
  { value: 'insight', label: 'نکته ارزشمند' },
  { value: 'experience', label: 'تجربه شخصی' },
  { value: 'praise', label: 'تعریف خاص' },
  { value: 'humor', label: 'طنز ملایم' },
  { value: 'counterpoint', label: 'دیدگاه متفاوت' },
];

const LEVELS: { value: EnglishLevel; label: string; hint: string }[] = [
  { value: 'simple', label: 'ساده', hint: 'B1 - کلمات رایج' },
  { value: 'intermediate', label: 'متوسط', hint: 'B2 - محاوره‌ای' },
  { value: 'advanced', label: 'پیشرفته', hint: 'C1 - واژگان غنی' },
];

const HISTORY_KEY = 'commentyar-history';
const MAX_HISTORY = 20;

export default function Home() {
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
  const [emojis, setEmojis] = React.useState(true);
  const [includeQuestion, setIncludeQuestion] = React.useState(false);
  const [count, setCount] = React.useState(5);

  // Generation state
  const [generating, setGenerating] = React.useState(false);
  const [result, setResult] = React.useState<GenerateResult | null>(null);
  const [genError, setGenError] = React.useState('');

  // History
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);

  // Rules
  const [rules, setRules] = React.useState<{ xRules: string; userPreferences: string } | null>(null);
  const [rulesLoading, setRulesLoading] = React.useState(true);

  // Load history and rules on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Load rules from API (cached on server after first load)
    fetch('/api/rules')
      .then((r) => r.json())
      .then((data: RulesResponse) => {
        if (data.success && data.xRules !== undefined) {
          setRules({ xRules: data.xRules, userPreferences: data.userPreferences || '' });
        }
      })
      .catch(() => {
        // ignore - rules are optional for display
      })
      .finally(() => setRulesLoading(false));
  }, []);

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
      toast({ title: 'لینک را وارد کنید', variant: 'destructive' });
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
        setFetchError(data.error || 'دریافت توییت ناموفق بود.');
        toast({
          title: 'دریافت توییت ناموفق',
          description: 'می‌توانید متن توییت را مستقیماً وارد کنید.',
          variant: 'destructive',
        });
        return;
      }
      if (data.text && data.text.trim().length > 0) {
        setTweetContent(data.text);
        toast({
          title: 'متن توییت دریافت شد',
          description: data.author ? `نویسنده: @${data.author}` : undefined,
        });
      } else {
        setFetchError(data.error || 'متن توییت خالی بود. لطفاً دستی وارد کنید.');
        toast({
          title: 'متن استخراج نشد',
          description: 'لطفاً متن توییت را مستقیماً کپی و وارد کنید.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطای شبکه';
      setFetchError(msg);
      toast({ title: 'خطای شبکه', description: msg, variant: 'destructive' });
    } finally {
      setFetching(false);
    }
  };

  const handleGenerate = async () => {
    if (!tweetContent.trim()) {
      toast({
        title: 'متن توییت خالی است',
        description: 'ابتدا یک لینک وارد کنید یا متن توییت را مستقیم بنویسید.',
        variant: 'destructive',
      });
      return;
    }
    setGenerating(true);
    setGenError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetContent,
          tone,
          length,
          angle,
          emojis,
          includeQuestion,
          englishLevel,
          count,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setGenError(data.error || 'تولید کامنت ناموفق بود.');
        toast({ title: 'خطا در تولید', description: data.error, variant: 'destructive' });
        return;
      }
      const generated: GenerateResult = {
        comments: data.comments || [],
        tweetSummary: data.tweetSummary || '',
      };
      setResult(generated);

      // Save to history
      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        tweetText: tweetContent.slice(0, 300),
        tweetSummary: generated.tweetSummary,
        comments: generated.comments,
        createdAt: Date.now(),
        settings: { tone, length, angle },
      };
      persistHistory([entry, ...history].slice(0, MAX_HISTORY));

      toast({
        title: `${generated.comments.length} کامنت پیشنهاد شد`,
        description: 'هر کدام را که می‌پسندید کپی کنید.',
      });

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطای شبکه';
      setGenError(msg);
      toast({ title: 'خطای شبکه', description: msg, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleClearHistory = () => {
    persistHistory([]);
    toast({ title: 'تاریخچه پاک شد' });
  };

  const handleRestoreFromHistory = (entry: HistoryEntry) => {
    setTweetContent(entry.tweetText);
    setResult({ comments: entry.comments, tweetSummary: entry.tweetSummary });
    setTone(entry.settings.tone);
    setLength(entry.settings.length);
    setAngle(entry.settings.angle);
    setInputMode('text');
    toast({ title: 'از تاریخچه بازیابی شد' });
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const canGenerate = tweetContent.trim().length > 2 && !generating;

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
              <h1 className="text-base font-bold sm:text-lg">کامنت‌یار ایکس</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                پیشنهاد کامنت انگلیسی هوشمند برای ایکس (توییتر)
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
              قوانین
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {/* Hero */}
        <section className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            قدرت‌گرفته با هوش مصنوعی
          </div>
          <h2 className="mx-auto max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">
            کامنت انگلیسی مناسب و مرتبط برای پست‌های ایکس
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            لینک توییت را بده یا متنش را کپی کن. هوش مصنوعی با توجه به قوانین ایکس و
            سلیقه شما، چند کامنت انگلیسی جذاب پیشنهاد می‌دهد که تعامل را بالا می‌برد.
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
                  ورودی توییت
                </CardTitle>
                <CardDescription>
                  متن توییت را مستقیم وارد کن یا لینک آن را بده تا خودکار خوانده شود.
                </CardDescription>
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
                    متن توییت
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
                    لینک توییت
                  </button>
                </div>

                {inputMode === 'link' ? (
                  <div className="space-y-2">
                    <Label htmlFor="tweet-url">لینک پست ایکس</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="tweet-url"
                        dir="ltr"
                        placeholder="https://x.com/username/status/123..."
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
                            دریافت...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            دریافت متن
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
                    <p className="text-xs text-muted-foreground">
                      توجه: گاهی ایکس اجازه خواندن خودکار نمی‌دهد. اگر خطا داد، متن توییت را دستی کپی کن.
                    </p>
                  </div>
                ) : null}

                {/* Tweet content textarea (always shown so user can edit) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tweet-content">متن توییت (انگلیسی)</Label>
                    {tweetContent && (
                      <span className="text-xs text-muted-foreground">
                        {tweetContent.length} کاراکتر
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="tweet-content"
                    dir="ltr"
                    placeholder="Paste the tweet text here... (متن توییت را اینجا پیست کنید)"
                    value={tweetContent}
                    onChange={(e) => setTweetContent(e.target.value)}
                    className="min-h-[140px] ltr text-left font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    می‌توانید این متن را ویرایش کنید تا پیشنهادها دقیق‌تر باشند.
                  </p>
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
                  تنظیمات کامنت
                </CardTitle>
                <CardDescription>سبک و لحن پیشنهادها را مشخص کن.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">لحن</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className="font-medium">{t.label}</span>
                          <span className="text-muted-foreground"> — {t.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Length */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">طول کامنت</Label>
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

                {/* Angle */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">سبک کامنت</Label>
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

                {/* English level */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">سطح زبان انگلیسی</Label>
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

                {/* Count */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">تعداد پیشنهاد</Label>
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

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="emojis-switch" className="text-xs font-semibold">استفاده از ایموجی</Label>
                      <p className="text-[11px] text-muted-foreground">۱-۲ ایموجی مرتبط اضافه شود</p>
                    </div>
                    <Switch id="emojis-switch" checked={emojis} onCheckedChange={setEmojis} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="question-switch" className="text-xs font-semibold">اولویت به سوال</Label>
                      <p className="text-[11px] text-muted-foreground">کامنت‌هایی که سوال می‌پرسند ترجیح داده شوند</p>
                    </div>
                    <Switch id="question-switch" checked={includeQuestion} onCheckedChange={setIncludeQuestion} />
                  </div>
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
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                در حال تولید کامنت...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                تولید کامنت پیشنهادی
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
                هوش مصنوعی در حال تحلیل توییت و تولید پیشنهادهاست...
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: count }).map((_, i) => (
                  <Skeleton key={i} className="h-44 w-full rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {!generating && genError && (
            <Card className="border-destructive/30">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">خطا در تولید کامنت</p>
                  <p className="text-sm text-muted-foreground">{genError}</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={handleGenerate}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    تلاش دوباره
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!generating && !genError && result && (
            <div className="space-y-5">
              {/* Summary */}
              {result.tweetSummary && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">خلاصه توییت</p>
                      <p className="mt-1 text-sm leading-relaxed">{result.tweetSummary}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  {result.comments.length} کامنت پیشنهادی
                </h3>
                <span className="text-xs text-muted-foreground">
                  برای کپی، دکمه «کپی» هر کارت را بزن
                </span>
              </div>

              {result.comments.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    پیشنهادی دریافت نشد. لطفاً دوباره تلاش کن یا متن توییت را کامل‌تر کن.
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
                تاریخچه ({history.length})
              </h3>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleClearHistory}>
                <Trash2 className="h-3.5 w-3.5" />
                پاک کردن
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
                          {new Date(entry.createdAt).toLocaleDateString('fa-IR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {entry.comments.length} کامنت
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
                قوانین ایکس و شیوه‌های تعامل
              </CardTitle>
              <CardDescription>
                این قوانین یک بار از فایل خوانده شده و در حافظه نگه داشته می‌شوند.
                هوش مصنوعی همه پیشنهادها را مطابق این قوانین تولید می‌کند.
              </CardDescription>
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
                        قوانین پلتفرم ایکس و شیوه‌های تعامل (فایل کامل)
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
                        تنظیمات شخصی کاربر
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="max-h-80 scrollbar-thin rounded-md border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                          {rules.userPreferences || 'بدون تنظیمات شخصی.'}
                        </pre>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  قوانین بارگذاری نشدند.
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  قوانین در اولین بارگذاری از فایل خوانده و در حافظه سرور کش می‌شوند.
                  دسترسی همیشه سریع و بدون تأخیر است.
                </span>
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
              <span>
                کامنت‌یار ایکس — ساخته‌شده برای افزایش تعامل واقعی
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              قوانین ایکس رعایت می‌شود · هوش مصنوعی · همیشه در دسترس
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
