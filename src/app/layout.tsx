import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProductShot - AI产品介绍视频生成器",
  description: "输入产品网址，自动生成专业产品介绍视频",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {/* Top navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--bg-primary)]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold">
                P
              </div>
              <span className="text-lg font-semibold">ProductShot</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span>AI产品视频生成器</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
