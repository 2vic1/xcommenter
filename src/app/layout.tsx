import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "کامنت‌یار ایکس | پیشنهاد کامنت انگلیسی هوشمند",
  description:
    "ابزار هوشمند برای پیشنهاد کامنت‌های انگلیسی مناسب و مرتبط برای پست‌های ایکس (توییتر). قوانین ایکس را می‌داند و با هوش مصنوعی کامنت پیشنهاد می‌دهد.",
  keywords: [
    "ایکس",
    "توییتر",
    "کامنت",
    "انگلیسی",
    "هوش مصنوعی",
    "تعامل",
    "X",
    "Twitter",
    "comment",
  ],
  authors: [{ name: "CommentYar" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
