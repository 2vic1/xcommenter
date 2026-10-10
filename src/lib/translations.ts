/**
 * Bilingual UI translations (Persian + English).
 * All user-facing strings live here so the whole UI can switch languages.
 */

export type Language = 'fa' | 'en';

export const translations = {
  fa: {
    // App / header
    'app.title': 'کامنت‌یار ایکس',
    'app.subtitle': 'پیشنهاد کامنت انگلیسی هوشمند برای ایکس (توییتر)',
    'app.rules': 'قوانین',
    'app.theme': 'تغییر تم',
    'app.language': 'EN',

    // Hero
    'hero.badge': 'قدرت‌گرفته با هوش مصنوعی',
    'hero.title': 'کامنت انگلیسی مناسب و مرتبط برای پست‌های ایکس',
    'hero.desc': 'لینک توییت را بده یا متنش را کپی کن. هوش مصنوعی با توجه به قوانین ایکس و سلیقه شما، چند کامنت انگلیسی جذاب پیشنهاد می‌دهد که تعامل را بالا می‌برد.',

    // Input card
    'input.title': 'ورودی توییت',
    'input.desc': 'متن توییت را مستقیم وارد کن یا لینک آن را بده تا خودکار خوانده شود.',
    'input.tabText': 'متن توییت',
    'input.tabLink': 'لینک توییت',
    'input.urlLabel': 'لینک پست ایکس',
    'input.urlPlaceholder': 'https://x.com/username/status/123...',
    'input.fetch': 'دریافت متن',
    'input.fetching': 'دریافت...',
    'input.contentLabel': 'متن توییت (انگلیسی)',
    'input.chars': 'کاراکتر',
    'input.editHint': 'می‌توانید این متن را ویرایش کنید تا پیشنهادها دقیق‌تر باشند.',
    'input.urlHint': 'توجه: گاهی ایکس اجازه خواندن خودکار نمی‌دهد. اگر خطا داد، متن توییت را دستی کپی کن.',

    // Settings card
    'settings.title': 'تنظیمات کامنت',
    'settings.desc': 'سبک و لحن پیشنهادها را مشخص کن.',
    'settings.tone': 'لحن',
    'settings.length': 'طول کامنت',
    'settings.angle': 'سبک کامنت',
    'settings.level': 'سطح زبان انگلیسی',
    'settings.count': 'تعداد پیشنهاد',
    'settings.emojis': 'استفاده از ایموجی',
    'settings.emojisHint': '۱-۲ ایموجی مرتبط اضافه شود',
    'settings.question': 'اولویت به سوال',
    'settings.questionHint': 'کامنت‌هایی که سوال می‌پرسند ترجیح داده شوند',
    'settings.emojiCount': 'تعداد ایموجی',
    'settings.emojiStyle': 'سبک ایموجی',
    'settings.emojiStyle.variety': 'تنوع (متفاوت)',
    'settings.emojiStyle.varietyHint': 'هر کامنت ایموجی متفاوت',
    'settings.emojiStyle.consistent': 'یکپارچه',
    'settings.emojiStyle.consistentHint': 'یک خانواده ایموجی ثابت',
    'settings.image': 'تولید تصویر مرتبط',
    'settings.imageHint': 'یک تصویر مرتبط و مثبت برای کامنت بساز',
    'settings.apiKey': 'تنظیمات API',
    'settings.apiKeyHint': 'از API سایت یا کلید شخصی استفاده کن',
    'settings.apiSource': 'منبع هوش مصنوعی',
    'settings.apiSource.site': 'API سایت (پیش‌فرض)',
    'settings.apiSource.siteHint': 'رایگان ولی ممکنه شلوغ باشه',
    'settings.apiSource.personal': 'کلید شخصی',
    'settings.apiSource.personalHint': 'سریع‌تر و بدون محدودیت',
    'settings.apiKeyLabel': 'کلید API شخصی (z-ai)',
    'settings.apiKeyPlaceholder': 'کلید خودت رو اینجا بچسبون',
    'settings.apiKeySave': 'ذخیره',
    'settings.apiKeyClear': 'پاک کردن',
    'settings.apiKeySaved': 'کلید ذخیره شد',
    'settings.apiKeyCleared': 'کلید پاک شد',
    'settings.apiKeyDesc': 'کلید فقط تو مرورگر خودت ذخیره میشه و به هیچ سرور خارجی فرستاده نمیشه (فقط به API هوش مصنوعی).',

    // Tone options
    'tone.friendly': 'صمیمی',
    'tone.friendly.hint': 'دوستانه و گرم',
    'tone.professional': 'حرفه‌ای',
    'tone.professional.hint': 'رسمی و جدی',
    'tone.casual': 'عادی',
    'tone.casual.hint': 'روزمره و ساده',
    'tone.witty': 'باهوش',
    'tone.witty.hint': 'شوخ‌طبع و هوشمندانه',
    'tone.expert': 'متخصص',
    'tone.expert.hint': 'دانش‌محور و دقیق',

    // Length options
    'length.short': 'کوتاه',
    'length.short.hint': '۱ تا ۱۵ کلمه',
    'length.medium': 'متوسط',
    'length.medium.hint': '۱۵ تا ۴۰ کلمه',
    'length.long': 'بلند',
    'length.long.hint': '۴۰ تا ۸۰ کلمه',

    // Angle options
    'angle.mixed': 'متنوع (پیشنهاد می‌شود)',
    'angle.question': 'سوال کنجکاو',
    'angle.agreement': 'موافقت + بینش',
    'angle.insight': 'نکته ارزشمند',
    'angle.experience': 'تجربه شخصی',
    'angle.praise': 'تعریف خاص',
    'angle.humor': 'طنز ملایم',
    'angle.counterpoint': 'دیدگاه متفاوت',

    // English level options
    'level.simple': 'ساده',
    'level.simple.hint': 'B1 - کلمات رایج',
    'level.intermediate': 'متوسط',
    'level.intermediate.hint': 'B2 - محاوره‌ای',
    'level.advanced': 'پیشرفته',
    'level.advanced.hint': 'C1 - واژگان غنی',

    // Generate button
    'generate.button': 'تولید کامنت پیشنهادی',
    'generate.generating': 'در حال تولید کامنت...',
    'generate.fetching': 'در حال دریافت توییت...',

    // Results
    'results.summary': 'خلاصه توییت',
    'results.count': 'کامنت پیشنهادی',
    'results.copyHint': 'برای کپی، دکمه «کپی» هر کارت را بزن',
    'results.image': 'تصویر پیشنهادی',
    'results.imageHint': 'می‌تونی این تصویر رو هم به کامنتت اضافه کنی',
    'results.imageGenerating': 'در حال ساخت تصویر...',
    'results.imageError': 'ساخت تصویر ناموفق بود',
    'results.empty': 'پیشنهادی دریافت نشد. لطفاً دوباره تلاش کن یا متن توییت را کامل‌تر کن.',
    'results.analyzing': 'هوش مصنوعی در حال تحلیل توییت و تولید پیشنهادهاست...',

    // Comment card
    'comment.words': 'کلمه',
    'comment.copy': 'کپی',
    'comment.copied': 'کپی شد',
    'comment.why': 'چرا کار می‌کند:',
    'comment.translation': 'ترجمه فارسی',

    // History
    'history.title': 'تاریخچه',
    'history.clear': 'پاک کردن',

    // Rules
    'rules.title': 'قوانین ایکس و شیوه‌های تعامل',
    'rules.desc': 'این قوانین یک بار از فایل خوانده شده و در حافظه نگه داشته می‌شوند. هوش مصنوعی همه پیشنهادها را مطابق این قوانین تولید می‌کند.',
    'rules.fullTitle': 'قوانین پلتفرم ایکس و شیوه‌های تعامل (فایل کامل)',
    'rules.userPrefs': 'تنظیمات شخصی کاربر',
    'rules.noPrefs': 'بدون تنظیمات شخصی.',
    'rules.loadFailed': 'قوانین بارگذاری نشدند.',
    'rules.cachedNote': 'قوانین در اولین بارگذاری از فایل خوانده و در حافظه سرور کش می‌شوند. دسترسی همیشه سریع و بدون تأخیر است.',

    // Footer
    'footer.tagline': 'کامنت‌یار ایکس — ساخته‌شده برای افزایش تعامل واقعی',
    'footer.note': 'قوانین ایکس رعایت می‌شود · هوش مصنوعی · همیشه در دسترس',

    // Toasts
    'toast.urlRequired': 'لینک را وارد کنید',
    'toast.fetchFailed': 'دریافت توییت ناموفق',
    'toast.fetchFailedDesc': 'می‌توانید متن توییت را مستقیماً وارد کنید.',
    'toast.fetched': 'متن توییت دریافت شد',
    'toast.fetchedFromLink': 'متن توییت از لینک دریافت شد',
    'toast.fetchEmpty': 'متن استخراج نشد',
    'toast.fetchEmptyDesc': 'لطفاً متن توییت را مستقیماً کپی و وارد کنید.',
    'toast.fetchBlocked': 'دریافت توییت ناموفق',
    'toast.fetchBlockedDesc': 'ایکس اجازه خواندن خودکار نداد. لطفاً متن توییت را مستقیم کپی کنید.',
    'toast.contentRequired': 'متن یا لینک توییت خالی است',
    'toast.contentRequiredDesc': 'یک لینک توییت وارد کنید یا متنش را مستقیم بنویسید.',
    'toast.genError': 'خطا در تولید',
    'toast.networkError': 'خطای شبکه',
    'toast.generated': 'کامنت پیشنهاد شد',
    'toast.generatedDesc': 'هر کدام را که می‌پسندید کپی کنید.',
    'toast.copied': 'کامنت کپی شد!',
    'toast.copiedDesc': 'حالا در توییت پیست (Paste) کنید.',
    'toast.copyFailed': 'کپی ناموفق بود',
    'toast.copyFailedDesc': 'لطفاً متن را دستی انتخاب و کپی کنید.',
    'toast.historyCleared': 'تاریخچه پاک شد',
    'toast.restored': 'از تاریخچه بازیابی شد',
    'toast.retry': 'تلاش دوباره',
    'toast.genErrorTitle': 'خطا در تولید کامنت',
  },

  en: {
    // App / header
    'app.title': 'X Comment Companion',
    'app.subtitle': 'Smart English comment suggestions for X (Twitter)',
    'app.rules': 'Rules',
    'app.theme': 'Toggle theme',
    'app.language': 'فا',

    // Hero
    'hero.badge': 'Powered by AI',
    'hero.title': 'Relevant English comments for your X posts',
    'hero.desc': 'Paste a tweet link or its text. The AI suggests engaging English replies that follow X rules and match your style.',

    // Input card
    'input.title': 'Tweet Input',
    'input.desc': 'Paste the tweet text directly, or give its link to auto-fetch.',
    'input.tabText': 'Tweet Text',
    'input.tabLink': 'Tweet Link',
    'input.urlLabel': 'X post URL',
    'input.urlPlaceholder': 'https://x.com/username/status/123...',
    'input.fetch': 'Fetch Text',
    'input.fetching': 'Fetching...',
    'input.contentLabel': 'Tweet content (English)',
    'input.chars': 'chars',
    'input.editHint': 'You can edit this text for more accurate suggestions.',
    'input.urlHint': 'Note: X sometimes blocks auto-reading. If it errors, copy the tweet text manually.',

    // Settings card
    'settings.title': 'Comment Settings',
    'settings.desc': 'Set the style and tone of suggestions.',
    'settings.tone': 'Tone',
    'settings.length': 'Comment Length',
    'settings.angle': 'Comment Angle',
    'settings.level': 'English Level',
    'settings.count': 'Number of suggestions',
    'settings.emojis': 'Use emojis',
    'settings.emojisHint': 'Add 1-2 relevant emojis',
    'settings.question': 'Prioritize questions',
    'settings.questionHint': 'Prefer comments that ask a question',
    'settings.emojiCount': 'Emoji count',
    'settings.emojiStyle': 'Emoji style',
    'settings.emojiStyle.variety': 'Variety (different)',
    'settings.emojiStyle.varietyHint': 'each comment has a different emoji',
    'settings.emojiStyle.consistent': 'Consistent',
    'settings.emojiStyle.consistentHint': 'one emoji family throughout',
    'settings.image': 'Generate relevant image',
    'settings.imageHint': 'Create a relevant positive image for the reply',
    'settings.apiKey': 'API Settings',
    'settings.apiKeyHint': 'Use site API or your personal key',
    'settings.apiSource': 'AI source',
    'settings.apiSource.site': 'Site API (default)',
    'settings.apiSource.siteHint': 'free but may be busy',
    'settings.apiSource.personal': 'Personal key',
    'settings.apiSource.personalHint': 'faster, no limits',
    'settings.apiKeyLabel': 'Personal API key (z-ai)',
    'settings.apiKeyPlaceholder': 'Paste your key here',
    'settings.apiKeySave': 'Save',
    'settings.apiKeyClear': 'Clear',
    'settings.apiKeySaved': 'Key saved',
    'settings.apiKeyCleared': 'Key cleared',
    'settings.apiKeyDesc': 'The key is stored only in your browser and is never sent to any external server (only to the AI API).',

    // Tone options
    'tone.friendly': 'Friendly',
    'tone.friendly.hint': 'warm and welcoming',
    'tone.professional': 'Professional',
    'tone.professional.hint': 'formal and serious',
    'tone.casual': 'Casual',
    'tone.casual.hint': 'everyday and simple',
    'tone.witty': 'Witty',
    'tone.witty.hint': 'clever and humorous',
    'tone.expert': 'Expert',
    'tone.expert.hint': 'knowledge-focused and precise',

    // Length options
    'length.short': 'Short',
    'length.short.hint': '1 to 15 words',
    'length.medium': 'Medium',
    'length.medium.hint': '15 to 40 words',
    'length.long': 'Long',
    'length.long.hint': '40 to 80 words',

    // Angle options
    'angle.mixed': 'Mixed (recommended)',
    'angle.question': 'Curious question',
    'angle.agreement': 'Agreement + insight',
    'angle.insight': 'Valuable insight',
    'angle.experience': 'Personal experience',
    'angle.praise': 'Specific praise',
    'angle.humor': 'Light humor',
    'angle.counterpoint': 'Different view',

    // English level options
    'level.simple': 'Simple',
    'level.simple.hint': 'B1 - common words',
    'level.intermediate': 'Intermediate',
    'level.intermediate.hint': 'B2 - conversational',
    'level.advanced': 'Advanced',
    'level.advanced.hint': 'C1 - rich vocabulary',

    // Generate button
    'generate.button': 'Generate Comment Suggestions',
    'generate.generating': 'Generating comments...',
    'generate.fetching': 'Fetching tweet...',

    // Results
    'results.summary': 'Tweet summary',
    'results.count': 'comment suggestions',
    'results.copyHint': 'Click "Copy" on each card to copy it',
    'results.image': 'Suggested image',
    'results.imageHint': 'You can attach this image to your comment',
    'results.imageGenerating': 'Generating image...',
    'results.imageError': 'Image generation failed',
    'results.empty': 'No suggestions received. Please try again or provide more tweet text.',
    'results.analyzing': 'AI is analyzing the tweet and generating suggestions...',

    // Comment card
    'comment.words': 'words',
    'comment.copy': 'Copy',
    'comment.copied': 'Copied',
    'comment.why': 'Why it works:',
    'comment.translation': 'Persian translation',

    // History
    'history.title': 'History',
    'history.clear': 'Clear',

    // Rules
    'rules.title': 'X Rules & Engagement Practices',
    'rules.desc': 'These rules are loaded once from a file and kept in memory. The AI generates all suggestions according to them.',
    'rules.fullTitle': 'X Platform Rules & Engagement Practices (full file)',
    'rules.userPrefs': 'User Preferences',
    'rules.noPrefs': 'No personal preferences.',
    'rules.loadFailed': 'Rules failed to load.',
    'rules.cachedNote': 'Rules are read from file on first load and cached in server memory. Access is always fast and lag-free.',

    // Footer
    'footer.tagline': 'X Comment Companion — built for genuine engagement',
    'footer.note': 'X rules respected · AI-powered · Always available',

    // Toasts
    'toast.urlRequired': 'Please enter a link',
    'toast.fetchFailed': 'Tweet fetch failed',
    'toast.fetchFailedDesc': 'You can paste the tweet text directly.',
    'toast.fetched': 'Tweet text fetched',
    'toast.fetchedFromLink': 'Tweet fetched from link',
    'toast.fetchEmpty': 'Text not extracted',
    'toast.fetchEmptyDesc': 'Please copy and paste the tweet text directly.',
    'toast.fetchBlocked': 'Tweet fetch failed',
    'toast.fetchBlockedDesc': 'X blocked auto-reading. Please copy the tweet text directly.',
    'toast.contentRequired': 'Tweet text or link is empty',
    'toast.contentRequiredDesc': 'Enter a tweet link or paste its text directly.',
    'toast.genError': 'Generation error',
    'toast.networkError': 'Network error',
    'toast.generated': 'suggestions generated',
    'toast.generatedDesc': 'Copy the ones you like.',
    'toast.copied': 'Comment copied!',
    'toast.copiedDesc': 'Now paste it into the tweet.',
    'toast.copyFailed': 'Copy failed',
    'toast.copyFailedDesc': 'Please select and copy the text manually.',
    'toast.historyCleared': 'History cleared',
    'toast.restored': 'Restored from history',
    'toast.retry': 'Retry',
    'toast.genErrorTitle': 'Failed to generate comments',
  },
} as const;

export type TranslationKey = keyof typeof translations.fa;

/**
 * Get a translation function for a given language.
 */
export function getTranslator(lang: Language) {
  return (key: TranslationKey): string => {
    return translations[lang][key] ?? translations.fa[key] ?? key;
  };
}
