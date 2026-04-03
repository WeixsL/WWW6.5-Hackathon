import sharp from "sharp";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

// ─── Sharp SVG 勋章图片生成（用于 IPFS 封面合成）──────────────────────────────

export interface BadgeImageOptions {
  name: string;
  tokenId: string;
  description?: string;
  rarity?: string;
  illustrationBuffer?: Buffer; // DALL-E 生成的插画叠加到勋章背景
}

const RARITY_COLORS: Record<string, string> = {
  legendary: "#FFD700",
  epic: "#9B59B6",
  rare: "#3498DB",
  common: "#2ECC71",
};

/**
 * 生成 SBT 勋章图片
 * 若传入 illustrationBuffer，则将 DALL-E 插画作为背景底图合成
 */
export async function generateBadgeImage(options: BadgeImageOptions): Promise<Buffer> {
  const { name, tokenId, description = "", rarity = "common", illustrationBuffer } = options;
  const color = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

  const size = 1024;

  // 覆盖层 SVG（文字 + 边框）
  const overlaySvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- 暗色渐变蒙层 -->
      <rect width="${size}" height="${size}" fill="rgba(10,10,30,0.55)" rx="40"/>
      <!-- 发光边框 -->
      <rect x="16" y="16" width="${size - 32}" height="${size - 32}"
        fill="none" stroke="${color}" stroke-width="4" rx="32" opacity="0.85"/>
      <!-- 稀有度标签 -->
      <rect x="${size / 2 - 80}" y="${size - 180}" width="160" height="36" rx="18" fill="${color}" opacity="0.92"/>
      <text x="${size / 2}" y="${size - 156}" font-family="sans-serif" font-size="18" fill="#000"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${rarity.toUpperCase()}</text>
      <!-- 勋章名 -->
      <text x="${size / 2}" y="${size - 108}" font-family="sans-serif" font-size="32" fill="#ffffff"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeXml(name)}</text>
      <!-- 描述 -->
      <text x="${size / 2}" y="${size - 64}" font-family="sans-serif" font-size="18" fill="#cccccc"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(description.slice(0, 36))}</text>
      <!-- Token ID -->
      <text x="${size / 2}" y="${size - 28}" font-family="monospace" font-size="13" fill="#888888"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(tokenId)}</text>
    </svg>
  `;

  if (illustrationBuffer) {
    // 将 DALL-E 插画作为底图，叠加文字覆盖层
    const base = sharp(illustrationBuffer).resize(size, size);
    const overlay = Buffer.from(overlaySvg);
    return base.composite([{ input: overlay }]).png().toBuffer();
  }

  // 无插画时使用纯色背景 + 覆盖层
  const bgSvg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f0f23"/>
          <stop offset="100%" style="stop-color:#1a1a3e"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)" rx="40"/>
      <circle cx="${size / 2}" cy="${size / 2 - 80}" r="200" fill="${color}" opacity="0.08"/>
    </svg>
  `;

  return sharp(Buffer.from(bgSvg))
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png()
    .toBuffer();
}

// ─── 卡片专属 DALL-E 生图（竖版，魔法水彩美学）─────────────────────────────

export interface CardIllustrationOptions {
  /** GPT 生成的个性化插图场景描述（英文） */
  illustrationDescription: string;
}

/**
 * 卡片专属提示词
 * 风格固定（魔法水彩美学），场景由 GPT 个性化生成
 */
function buildCardIllustrationPrompt(illustrationDescription: string): string {
  return [
    `A full-bleed magical illustration with no borders, no frames, no decorative edges.`,
    `Scene: ${illustrationDescription}`,
    `Art style: soft 3D watercolor painting with luminous magical atmosphere,`,
    `dreamy pastel tones blended with gentle glowing light effects.`,
    `Color palette: lavender, rose gold, mint, and warm amber watercolor washes`,
    `flowing freely across the canvas with no border or frame of any kind.`,
    `Magical particles, soft light orbs, and watercolor ink blooms fill the scene.`,
    `If any human figure appears, it must be a young woman with elegant, graceful features.`,
    `No borders. No frames. No edges. No decorative outlines. Edge-to-edge illustration only.`,
    `No text, no letters, no numbers anywhere in the image.`,
    `Ultra high detail, painterly finish, portrait orientation.`,
  ].join(" ");
}

/**
 * 为卡片生成专属插画，使用竖版比例（1024x1536）适配手机屏幕 80% 宽
 */
export async function generateCardIllustration(
  options: CardIllustrationOptions,
): Promise<Buffer> {
  const prompt = buildCardIllustrationPrompt(options.illustrationDescription);
  const buffer = await generateImageBuffer(prompt, "1024x1536");
  return buffer;
}

// ─── 勋章专属 DALL-E 生图（竖版，进阶感，魔法水彩美学）──────────────────────

export interface BadgeIllustrationOptions {
  /** GPT 生成的进化场景描述（英文） */
  illustrationDescription: string;
}

/**
 * 勋章专属提示词：风格与卡片一致，额外强调进阶/升华感
 */
function buildBadgeIllustrationPrompt(illustrationDescription: string): string {
  return [
    `A full-bleed magical evolution illustration with no borders, no frames, no decorative edges.`,
    `Scene: ${illustrationDescription}`,
    `Art style: soft 3D watercolor painting with luminous magical atmosphere,`,
    `dreamy pastel tones blended with radiant ascension light effects.`,
    `Color palette: deep violet, gold, celestial blue and warm amber watercolor washes`,
    `flowing freely across the canvas — conveying a sense of power unlocked and new heights reached.`,
    `Dramatic upward light rays, magical particles of achievement, shimmering aura of evolution.`,
    `If any human figure appears, it must be a young woman with elegant, graceful features, glowing with power.`,
    `No borders. No frames. No edges. No decorative outlines. Edge-to-edge illustration only.`,
    `No text, no letters, no numbers anywhere in the image.`,
    `Ultra high detail, painterly finish, portrait orientation, epic sense of progression.`,
  ].join(" ");
}

/**
 * 为勋章生成进化插画，竖版 1024×1536 适配手机屏幕 80% 宽
 */
export async function generateBadgeIllustration(
  options: BadgeIllustrationOptions,
): Promise<Buffer> {
  const prompt = buildBadgeIllustrationPrompt(options.illustrationDescription);
  const buffer = await generateImageBuffer(prompt, "1024x1536");
  return buffer;
}

// ─── Sharp SVG 卡片合成（竖版，金色边框 + 黑曜石底色）────────────────────────

export interface CardImageOptions {
  name: string;
  cardId: number;
  rarity?: string;
  oreCount?: number;
  illustrationBuffer?: Buffer;
}

/**
 * 合成卡片最终图（竖版 1024×1792，适配手机屏幕 80% 宽）
 * 黑曜石底色 + 金色金属浮雕边框 + 卡片信息覆盖层
 */
export async function generateCardImage(options: CardImageOptions): Promise<Buffer> {
  const { name, cardId, rarity = "common", oreCount = 1, illustrationBuffer } = options;

  // 卡片统一使用金色边框（与黑曜石底色搭配）
  const gold = "#C9A84C";
  const goldLight = "#F0D080";

  const w = 1024;
  const h = 1536;
  const br = 56; // border radius

  const overlaySvg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 黑曜石蒙层渐变 -->
        <linearGradient id="obsidian" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(8,6,14,0.30)"/>
          <stop offset="60%" style="stop-color:rgba(8,6,14,0.05)"/>
          <stop offset="100%" style="stop-color:rgba(8,6,14,0.75)"/>
        </linearGradient>
        <!-- 金色边框渐变（模拟浮雕高光） -->
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${goldLight}"/>
          <stop offset="40%" style="stop-color:${gold}"/>
          <stop offset="100%" style="stop-color:#8B6914"/>
        </linearGradient>
      </defs>

      <!-- 全图蒙层 -->
      <rect width="${w}" height="${h}" fill="url(#obsidian)" rx="${br}"/>

      <!-- 外层金色浮雕主边框 -->
      <rect x="12" y="12" width="${w - 24}" height="${h - 24}"
        fill="none" stroke="url(#goldBorder)" stroke-width="6" rx="${br - 4}" opacity="0.95"/>
      <!-- 内层细边框（双线浮雕感） -->
      <rect x="22" y="22" width="${w - 44}" height="${h - 44}"
        fill="none" stroke="${gold}" stroke-width="1.5" rx="${br - 12}" opacity="0.55"/>

      <!-- 顶部装饰线 -->
      <line x1="80" y1="90" x2="${w - 80}" y2="90" stroke="${gold}" stroke-width="1" opacity="0.4"/>

      <!-- 左上：稀有度胶囊 -->
      <rect x="40" y="48" width="140" height="34" rx="17" fill="${gold}" opacity="0.88"/>
      <text x="110" y="65" font-family="serif" font-size="15" fill="#1a0e00"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold" letter-spacing="2">${rarity.toUpperCase()}</text>

      <!-- 右上：矿石数量 -->
      <text x="${w - 44}" y="65" font-family="monospace" font-size="15" fill="${goldLight}"
        text-anchor="end" dominant-baseline="middle" opacity="0.85">⬡ ${oreCount}</text>

      <!-- 底部信息区背景 -->
      <rect x="0" y="${h - 220}" width="${w}" height="220" fill="rgba(8,6,14,0.78)" rx="${br}"/>
      <line x1="60" y1="${h - 218}" x2="${w - 60}" y2="${h - 218}" stroke="${gold}" stroke-width="1" opacity="0.35"/>

      <!-- 卡片名 -->
      <text x="${w / 2}" y="${h - 148}" font-family="serif" font-size="42" fill="#ffffff"
        text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeXml(name)}</text>

      <!-- 分割线 -->
      <line x1="${w / 2 - 120}" y1="${h - 108}" x2="${w / 2 + 120}" y2="${h - 108}"
        stroke="${gold}" stroke-width="1" opacity="0.4"/>

      <!-- Card ID -->
      <text x="${w / 2}" y="${h - 68}" font-family="monospace" font-size="18" fill="${gold}"
        text-anchor="middle" dominant-baseline="middle" opacity="0.75">CARD  #${String(cardId).padStart(4, "0")}</text>

      <!-- 底部装饰点 -->
      <circle cx="${w / 2}" cy="${h - 36}" r="4" fill="${gold}" opacity="0.5"/>
      <circle cx="${w / 2 - 20}" cy="${h - 36}" r="2.5" fill="${gold}" opacity="0.3"/>
      <circle cx="${w / 2 + 20}" cy="${h - 36}" r="2.5" fill="${gold}" opacity="0.3"/>
    </svg>
  `;

  if (illustrationBuffer) {
    const base = sharp(illustrationBuffer).resize(w, h, { fit: "cover", position: "centre" });
    return base.composite([{ input: Buffer.from(overlaySvg) }]).png().toBuffer();
  }

  // 无插画时：纯黑曜石底色
  const bgSvg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="obsi" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#1a1228"/>
          <stop offset="100%" style="stop-color:#06040d"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#obsi)" rx="${br}"/>
    </svg>
  `;

  return sharp(Buffer.from(bgSvg))
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png()
    .toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
