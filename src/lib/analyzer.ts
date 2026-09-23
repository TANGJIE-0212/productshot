import type {
  WebsiteAnalysis,
  ScreenshotInfo,
  ColorPalette,
  FeatureInfo,
} from "./types";

/**
 * Analyze a website by capturing screenshots, extracting metadata,
 * colors, and identifying features.
 *
 * Uses Puppeteer server-side for full rendering.
 */
export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Extract metadata
    const metadata = await page.evaluate(() => {
      const getMeta = (name: string) => {
        const el =
          document.querySelector(`meta[name="${name}"]`) ||
          document.querySelector(`meta[property="${name}"]`);
        return el?.getAttribute("content") || "";
      };

      return {
        title: document.title || "",
        description:
          getMeta("description") || getMeta("og:description") || "",
        ogImage: getMeta("og:image") || "",
        favicon:
          (
            document.querySelector('link[rel="icon"]') ||
            document.querySelector('link[rel="shortcut icon"]')
          )?.getAttribute("href") || "/favicon.ico",
        ogTitle: getMeta("og:title") || "",
        ogSiteName: getMeta("og:site_name") || "",
        themeColor: getMeta("theme-color") || "",
      };
    });

    // Take full page screenshot
    const fullPageScreenshot = await page.screenshot({
      encoding: "base64",
      fullPage: true,
      type: "png",
    });

    // Take viewport screenshot (above the fold)
    const viewportScreenshot = await page.screenshot({
      encoding: "base64",
      fullPage: false,
      type: "png",
    });

    // Extract dominant colors from the page
    const extractedColors = await page.evaluate(() => {
      const getComputedColor = (selector: string, prop: string) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        return window.getComputedStyle(el).getPropertyValue(prop);
      };

      const bodyBg = getComputedColor("body", "background-color") || "#ffffff";
      const bodyColor = getComputedColor("body", "color") || "#000000";

      // Try to find primary brand color from buttons, links, headers
      const primaryCandidates: string[] = [];
      document
        .querySelectorAll("a, button, [class*='primary'], [class*='brand']")
        .forEach((el) => {
          const bg = window.getComputedStyle(el).backgroundColor;
          const color = window.getComputedStyle(el).color;
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            primaryCandidates.push(bg);
          }
          if (color) primaryCandidates.push(color);
        });

      return {
        background: bodyBg,
        text: bodyColor,
        candidates: primaryCandidates.slice(0, 10),
      };
    });

    // Extract features from the page content
    const features = await page.evaluate(() => {
      const featureList: Array<{ title: string; description: string }> = [];

      // Look for common feature section patterns
      const headings = document.querySelectorAll("h2, h3");
      headings.forEach((heading) => {
        const title = heading.textContent?.trim() || "";
        if (title.length < 3 || title.length > 100) return;

        // Get the next paragraph or description
        let description = "";
        const next = heading.nextElementSibling;
        if (next && (next.tagName === "P" || next.tagName === "DIV")) {
          description = next.textContent?.trim().slice(0, 200) || "";
        }

        if (title) {
          featureList.push({ title, description });
        }
      });

      return featureList.slice(0, 8); // Max 8 features
    });

    // Build color palette
    const colors = buildColorPalette(extractedColors, metadata.themeColor);

    // Build screenshots array
    const screenshots: ScreenshotInfo[] = [
      {
        id: "viewport",
        url: `data:image/png;base64,${viewportScreenshot}`,
        label: "首屏截图",
        width: 1920,
        height: 1080,
      },
      {
        id: "fullpage",
        url: `data:image/png;base64,${fullPageScreenshot}`,
        label: "完整页面",
        width: 1920,
        height: 0, // variable
      },
    ];

    // Scroll down and take additional screenshots of key sections
    const scrollPositions = [0.25, 0.5, 0.75];
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);

    for (let i = 0; i < scrollPositions.length; i++) {
      const scrollY = Math.floor(pageHeight * scrollPositions[i]);
      await page.evaluate((y: number) => window.scrollTo(0, y), scrollY);
      await new Promise((r) => setTimeout(r, 500)); // Wait for animations

      const sectionScreenshot = await page.screenshot({
        encoding: "base64",
        fullPage: false,
        type: "png",
      });

      screenshots.push({
        id: `section-${i}`,
        url: `data:image/png;base64,${sectionScreenshot}`,
        label: `页面 ${Math.round(scrollPositions[i] * 100)}% 处`,
        width: 1920,
        height: 1080,
      });
    }

    // Map features with icons
    const featureInfos: FeatureInfo[] = features.map((f, i) => ({
      title: f.title,
      description: f.description,
      screenshotId: i < 3 ? `section-${i}` : undefined,
      icon: getFeatureIcon(f.title, i),
    }));

    // Resolve favicon URL
    let faviconUrl = metadata.favicon;
    if (faviconUrl && !faviconUrl.startsWith("http")) {
      const base = new URL(url);
      faviconUrl = new URL(faviconUrl, base.origin).href;
    }

    // Resolve og image URL
    let ogImageUrl = metadata.ogImage;
    if (ogImageUrl && !ogImageUrl.startsWith("http")) {
      const base = new URL(url);
      ogImageUrl = new URL(ogImageUrl, base.origin).href;
    }

    return {
      url,
      title: metadata.ogTitle || metadata.title,
      description: metadata.description,
      favicon: faviconUrl,
      ogImage: ogImageUrl || undefined,
      screenshots,
      colors,
      features: featureInfos,
      metadata: {
        siteName: metadata.ogSiteName,
        themeColor: metadata.themeColor,
      },
    };
  } finally {
    await browser.close();
  }
}

function buildColorPalette(
  extracted: { background: string; text: string; candidates: string[] },
  themeColor: string
): ColorPalette {
  // Try to pick a primary color from candidates
  const primary = themeColor || extracted.candidates[0] || "#4c6ef5";
  const secondary = extracted.candidates[1] || "#748ffc";

  return {
    primary: normalizeColor(primary),
    secondary: normalizeColor(secondary),
    accent: normalizeColor(extracted.candidates[2] || "#ff6b6b"),
    background: normalizeColor(extracted.background),
    text: normalizeColor(extracted.text),
    gradientColors: [normalizeColor(primary), normalizeColor(secondary)],
  };
}

function normalizeColor(color: string): string {
  // Simple normalization - in production, use a proper color library
  if (color.startsWith("#")) return color;
  if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      const [r, g, b] = match.map(Number);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  }
  return color;
}

function getFeatureIcon(title: string, index: number): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("fast") || lowerTitle.includes("speed") || lowerTitle.includes("快"))
    return "⚡";
  if (lowerTitle.includes("secur") || lowerTitle.includes("安全")) return "🔒";
  if (lowerTitle.includes("easy") || lowerTitle.includes("simple") || lowerTitle.includes("简"))
    return "✨";
  if (lowerTitle.includes("team") || lowerTitle.includes("collab") || lowerTitle.includes("协"))
    return "👥";
  if (lowerTitle.includes("ai") || lowerTitle.includes("智能")) return "🤖";
  if (lowerTitle.includes("free") || lowerTitle.includes("免费")) return "🎁";
  if (lowerTitle.includes("data") || lowerTitle.includes("数据")) return "📊";
  if (lowerTitle.includes("design") || lowerTitle.includes("设计")) return "🎨";

  const defaultIcons = ["🚀", "💡", "🎯", "⭐", "🔥", "💪", "🌟", "📱"];
  return defaultIcons[index % defaultIcons.length];
}
