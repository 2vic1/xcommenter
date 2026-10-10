# کامنت‌یار ایکس | X Comment Companion

> **نسخه ۱.۰.۰** — ابزار هوشمند برای پیشنهاد کامنت انگلیسی و تولید پست وایرال برای ایکس (توییتر) با هوش مصنوعی
>
> **Version 1.0.0** — AI-powered tool for suggesting English comments and generating viral posts for X (Twitter)

---

## 📖 فهرست مطالب | Table of Contents

- [فارسی](#فارسی)
- [English](#english)

---

## فارسی

### 🎯 این پروژه چیست؟

«کامنت‌یار ایکس» یک وب‌اپلیکیشن است که با هوش مصنوعی، **کامنت‌های انگلیسی مناسب و مرتبط** برای پست‌های ایکس (توییتر) به شما پیشنهاد می‌دهد. همچنین می‌توانید **پست‌های وایرال** برای اکانت خودتان بسازید.

### ✨ امکانات

- 🔍 **کامنت‌یاب**: لینک یا متن توییت را بدهید، ۵ کامنت انگلیسی مرتبط دریافت کنید
- 🔥 **تولید پست وایرال**: موضوع بدهید، پست‌های وایرال برای اکانت خودتان بسازید
- 🌐 **تحقیق هوشمند**: قبل از کامنت، درباره موضوع (مثلاً پروژه کریپتویی) در اینترنت تحقیق کند
- 🖼️ **تولید تصویر**: تصویر مرتبط و مثبت برای کامنت/پست بسازید
- 🌍 **دوزبانه**: رابط کاربری فارسی و انگلیسی با تغییر جهت RTL/LTR
- 📝 **ترجمه فارسی**: هر کامنت انگلیسی، ترجمه فارسی هم دارد
- 😊 **ایموجی هوشمند**: تعداد (۰-۳) و سبک (تنوع/یکپارچه) قابل تنظیم
- 🤖 **ضد تشخیص هوش مصنوعی**: کامنت‌ها شبیه انسان واقعی نوشته می‌شوند
- 🔑 **API شخصی**: کلید شخصی z-ai خودتان را وارد کنید
- 📱 **PWA**: روی اندروید نصب می‌شود
- 📜 **قوانین ایکس ۲۰۲۴-۲۰۲۵**: تمام قوانین و الگوریتم به‌روز رعایت می‌شود
- 🌗 **حالت تاریک/روشن**: پشتیبانی از تم دارک و لایت

### 🛠️ تکنولوژی‌ها

- **Next.js 16** با App Router
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **z-ai-web-dev-sdk** (هوش مصنوعی، جستجوی وب، تولید تصویر)
- **Prisma ORM** + SQLite
- **next-themes** برای دارک مود
- **Vazirmatn** فونت فارسی

### 📋 پیش‌نیازها

- **Node.js 18+** یا **Bun** (پیشنهادی)
- یک کلید **z-ai** (یا از API سایت استفاده کنید — پیش‌فرض)

### 🚀 نصب و اجرا

#### مرحله ۱: کلون کردن پروژه
```bash
git clone https://github.com/2vic1/commentyar.git
cd commentyar
```

#### مرحله ۲: نصب پکیج‌ها
```bash
# با Bun (پیشنهادی)
bun install

# یا با npm
npm install
```

#### مرحله ۳: تنظیم متغیرهای محیطی
فایل `.env` در ریشه پروژه بسازید:
```env
DATABASE_URL="file:./db/custom.db"
```

#### مرحله ۴: راه‌اندازی دیتابیس
```bash
bun run db:push
# یا
npm run db:push
```

#### مرحله ۵: اجرای پروژه
```bash
bun run dev
# یا
npm run dev
```

سایت روی `http://localhost:3000` در دسترس است.

### 📦 انتشار (Deploy)

#### روش ۱: Vercel (پیشنهادی — رایگان)

۱. کد را به GitHub پوش کنید:
```bash
git add .
git commit -m "v1.0.0 - initial release"
git push origin main
```

۲. به [vercel.com](https://vercel.com) بروید، با گیت‌هاب لاگین کنید

۳. **New Project** → ریپو را انتخاب کنید → **Deploy**

۴. دامنه شخصی: **Settings → Domains → Add** و رکوردهای DNS را تنظیم کنید

#### روش ۲: سرور شخصی (VPS)

```bash
# نصب
git clone https://github.com/2vic1/commentyar.git
cd commentyar
bun install
bun run build

# اجرا با PM2
npm install -g pm2
pm2 start "bun .next/standalone/server.js" --name commentyar
pm2 startup
pm2 save
```

### 📱 نصب روی اندروید (PWA)

۱. سایت را در **Chrome اندروید** باز کنید
۲. منو (⋮) → **Add to Home screen** یا **Install app**
۳. اپ با آیکون اختصاصی نصب می‌شود

### 🎮 راهنمای استفاده

#### حالت کامنت‌یاب
۱. لینک توییت یا متن آن را وارد کنید
۲. تنظیمات (لحن، طول، سبک، ایموجی) را انتخاب کنید
۳. (اختیاری) تیک «تحقیق» را روشن کنید
۴. (اختیاری) تیک «تولید تصویر» را روشن کنید
۵. دکمه **تولید کامنت پیشنهادی** را بزنید
۶. کامنت مورد نظر را کپی کنید

#### حالت تولید پست وایرال
۱. از بالا، حالت **تولید پست وایرال** را انتخاب کنید
۲. موضوع/ایده پست را وارد کنید
۳. تنظیمات را انتخاب کنید
۴. دکمه **تولید پست وایرال** را بزنید

### 🐛 باگ‌های شناخته‌شده (نسخه ۱.۰.۰)

| # | مشکل | وضعیت | راه‌حل موقت |
|---|------|-------|--------------|
| ۱ | **تولید تصویر گاهی طول می‌کشد** (۶۰-۹۰ ثانیه) | 🟡 شناخته‌شده | صبر کنید — تصویر در پس‌زمینه ساخته می‌شود |
| ۲ | **تولید تصویر ممکن است fail شود** اگر gateway timeout بخورد | 🟡 شناخته‌شده | دوباره تلاش کنید یا تیک تصویر را خاموش کنید |
| ۳ | **خواندن خودکار لینک توییت** برای توییت‌های خصوصی/حذف‌شده کار نمی‌کند | 🟡 محدودیت ایکس | متن توییت را دستی کپی کنید |
| ۴ | **API سایت** ممکن است با کاربر زیاد محدود شود | 🟡 شناخته‌شده | کلید شخصی z-ai استفاده کنید |
| ۵ | **کش قوانین** فقط در حافظه سرور است (در serverless کار نمی‌کند) | 🟡 شناخته‌شده | از VPS استفاده کنید یا Redis اضافه کنید |
| ۶ | **تاریخچه** فقط در مرورگر همان دستگاه است | 🟡 طراحی | در نسخه‌های بعدی سینک اکانت اضافه می‌شود |

### 🔒 امنیت

- کلید API شخصی فقط در **localStorage مرورگر شما** ذخیره می‌شود
- هیچ کلیدی به سرور خارجی فرستاده نمی‌شود (فقط به API هوش مصنوعی)
- اطلاعات تاریخچه فقط در مرورگر شماست

### 🗺️ نقشه راه (Roadmap)

- [ ] **v1.1**: بهبود پایداری تولید تصویر
- [ ] **v1.2**: اکانت کاربری و سینک تاریخچه
- [ ] **v1.3**: برنامه زمانی پست‌ها
- [ ] **v1.4**: تحلیل عملکرد کامنت‌ها
- [ ] **v2.0**: پشتیبانی از چند پلتفرم (LinkedIn, Threads)

### 📜 لایسنس

MIT License — آزاد برای استفاده شخصی و تجاری

### 🤝 مشارکت

Pull Request و Issue welcome!

### 💛 حمایت مالی | Support

اگه این پروژه برات مفید بود، می‌تونی ازم حمایت کنی:

#### 🪙 کریپتو (Crypto)

| شبکه | آدرس |
|------|------|
| **Bitcoin (BTC)** | `bc1pj3dmcgpzf9d6vdm36tk2acx2xw9n5zgjljf9knaddpcmpvqsnw6sk3rfjh` |
| **Ethereum (ETH) / USDT (ERC20)** | `0xe5f078820f26eaf15f7c763c40fc5044270050ec` |
| **Tron (TRX) / USDT (TRC20)** | `TEaaV5RhYSWZs841dUxxYg5cVrUHteG3Rr` |

> 💡 برای انتقال USDT با کمترین کارمزد، از شبکه **Tron (TRC20)** استفاده کنید.

#### 💳 روش‌های دیگر

- **GitHub Sponsors**: [github.com/sponsors/2vic1](https://github.com/sponsors/2vic1)

متشکرم از حمایتت! 🙏

---

## English

### 🎯 What is this project?

**X Comment Companion** is a web app that uses AI to suggest **relevant English comments** for X (Twitter) posts. You can also generate **viral posts** for your own account.

### ✨ Features

- 🔍 **Comment Finder**: Give a tweet link or text, get 5 relevant English comments
- 🔥 **Viral Post Generator**: Give a topic, get viral posts for your own account
- 🌐 **Smart Research**: Before commenting, research the topic on the web (e.g. crypto projects)
- 🖼️ **Image Generation**: Generate a relevant positive image for your comment/post
- 🌍 **Bilingual**: Persian and English UI with automatic RTL/LTR switching
- 📝 **Persian Translation**: Every English comment includes a Persian translation
- 😊 **Smart Emojis**: Configurable count (0-3) and style (variety/consistent)
- 🤖 **Anti-AI-Detection**: Comments are written to look like real humans
- 🔑 **Personal API**: Use your own z-ai API key
- 📱 **PWA**: Installable on Android
- 📜 **X Rules 2024-2025**: All current rules and algorithm insights are followed
- 🌗 **Dark/Light Mode**: Theme support

### 🛠️ Tech Stack

- **Next.js 16** with App Router
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **z-ai-web-dev-sdk** (AI, web search, image generation)
- **Prisma ORM** + SQLite
- **next-themes** for dark mode
- **Vazirmatn** Persian font

### 📋 Prerequisites

- **Node.js 18+** or **Bun** (recommended)
- A **z-ai** API key (or use the site API — default)

### 🚀 Installation

#### Step 1: Clone the project
```bash
git clone https://github.com/2vic1/commentyar.git
cd commentyar
```

#### Step 2: Install dependencies
```bash
# With Bun (recommended)
bun install

# Or with npm
npm install
```

#### Step 3: Set up environment variables
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./db/custom.db"
```

#### Step 4: Set up the database
```bash
bun run db:push
# or
npm run db:push
```

#### Step 5: Run the project
```bash
bun run dev
# or
npm run dev
```

The site is available at `http://localhost:3000`.

### 📦 Deployment

#### Option 1: Vercel (Recommended — Free)

1. Push the code to GitHub:
```bash
git add .
git commit -m "v1.0.0 - initial release"
git push origin main
```

2. Go to [vercel.com](https://vercel.com), log in with GitHub

3. **New Project** → Select the repo → **Deploy**

4. Custom domain: **Settings → Domains → Add** and configure DNS records

#### Option 2: Personal Server (VPS)

```bash
# Install
git clone https://github.com/2vic1/commentyar.git
cd commentyar
bun install
bun run build

# Run with PM2
npm install -g pm2
pm2 start "bun .next/standalone/server.js" --name commentyar
pm2 startup
pm2 save
```

### 📱 Install on Android (PWA)

1. Open the site in **Chrome on Android**
2. Menu (⋮) → **Add to Home screen** or **Install app**
3. The app installs with its own icon

### 🎮 Usage Guide

#### Comment Finder Mode
1. Enter a tweet link or text
2. Choose settings (tone, length, style, emojis)
3. (Optional) Enable "Research" toggle
4. (Optional) Enable "Generate image" toggle
5. Click **Generate Comment Suggestions**
6. Copy the comment you like

#### Viral Post Generator Mode
1. Switch to **Viral Post Generator** mode at the top
2. Enter your post topic/idea
3. Choose settings
4. Click **Generate viral posts**

### 🐛 Known Bugs (Version 1.0.0)

| # | Issue | Status | Workaround |
|---|-------|--------|------------|
| 1 | **Image generation is slow** (60-90 seconds) | 🟡 Known | Wait — the image is built in the background |
| 2 | **Image generation may fail** if gateway times out | 🟡 Known | Retry, or disable the image toggle |
| 3 | **Auto-fetching tweet links** fails for private/deleted tweets | 🟡 X limitation | Paste the tweet text manually |
| 4 | **Site API** may rate-limit with many users | 🟡 Known | Use a personal z-ai API key |
| 5 | **Rules cache** is in-memory only (doesn't work on serverless) | 🟡 Known | Use a VPS, or add Redis |
| 6 | **History** is browser-only (same device) | 🟡 By design | Account sync will come in later versions |

### 🔒 Security

- Personal API key is stored only in your browser's **localStorage**
- No key is sent to any external server (only to the AI API)
- History data stays in your browser only

### 🗺️ Roadmap

- [ ] **v1.1**: Improve image generation stability
- [ ] **v1.2**: User accounts and history sync
- [ ] **v1.3**: Post scheduling
- [ ] **v1.4**: Comment performance analytics
- [ ] **v2.0**: Multi-platform support (LinkedIn, Threads)

### 📜 License

MIT License — Free for personal and commercial use

### 🤝 Contributing

Pull Requests and Issues are welcome!

### 💛 Support

If you find this project useful, please consider supporting me:

#### 🪙 Crypto

| Network | Address |
|---------|---------|
| **Bitcoin (BTC)** | `bc1pj3dmcgpzf9d6vdm36tk2acx2xw9n5zgjljf9knaddpcmpvqsnw6sk3rfjh` |
| **Ethereum (ETH) / USDT (ERC20)** | `0xe5f078820f26eaf15f7c763c40fc5044270050ec` |
| **Tron (TRX) / USDT (TRC20)** | `TEaaV5RhYSWZs841dUxxYg5cVrUHteG3Rr` |

> 💡 For the lowest USDT transfer fees, use the **Tron (TRC20)** network.

#### 💳 Other Methods

- **GitHub Sponsors**: [github.com/sponsors/2vic1](https://github.com/sponsors/2vic1)

Thank you for your support! 🙏

---

<div align="center">

**نسخه ۱.۰.۰ | Version 1.0.0**

ساخته‌شده با ❤️ برای افزایش تعامل واقعی در ایکس

Built with ❤️ for genuine engagement on X

</div>
