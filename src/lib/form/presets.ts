import type { ColorPalettePreset, InspirationExample } from "./types";

export const DEFAULT_PALETTES: ColorPalettePreset[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    colors: ["#111111", "#FFFFFF", "#E8E8E8", "#6B7280"],
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    colors: ["#0F2744", "#2563EB", "#FFFFFF", "#94A3B8"],
  },
  {
    id: "natural-organic",
    name: "Natural & Organic",
    colors: ["#6B8F71", "#F5F0E6", "#4A5D3F", "#C4A882"],
  },
  {
    id: "warm-elegant",
    name: "Warm & Elegant",
    colors: ["#D4C4A8", "#F7F3ED", "#3D3D3D", "#8B7355"],
  },
  {
    id: "premium-luxury",
    name: "Premium Luxury",
    colors: ["#1A1F3A", "#C9A962", "#FAF8F5", "#2D3250"],
  },
  {
    id: "modern-tech",
    name: "Modern Technology",
    colors: ["#4F46E5", "#7C3AED", "#1E293B", "#F1F5F9"],
  },
  {
    id: "fresh-friendly",
    name: "Fresh & Friendly",
    colors: ["#0D9488", "#99F6E4", "#FFFFFF", "#134E4A"],
  },
  {
    id: "bold-energetic",
    name: "Bold & Energetic",
    colors: ["#F97316", "#FB7185", "#1C1917", "#FFF7ED"],
  },
  {
    id: "soft-creative",
    name: "Soft & Creative",
    colors: ["#C4B5FD", "#FBCFE8", "#FFFBEB", "#6B21A8"],
  },
  {
    id: "dark-modern",
    name: "Dark Modern",
    colors: ["#18181B", "#22D3EE", "#FAFAFA", "#3F3F46"],
  },
];

export const DEFAULT_INSPIRATION: InspirationExample[] = [
  {
    id: "stripe",
    name: "Stripe",
    url: "https://stripe.com",
    description: "Modern, polished business design with clear hierarchy and confident typography.",
    tags: ["Corporate", "Clean", "Product-led"],
  },
  {
    id: "linear",
    name: "Linear",
    url: "https://linear.app",
    description: "Refined minimalist technology aesthetic with subtle depth and precision.",
    tags: ["Minimal", "SaaS", "Dark accents"],
  },
  {
    id: "apple",
    name: "Apple",
    url: "https://www.apple.com",
    description: "Product-focused storytelling with large imagery and restrained copy.",
    tags: ["Premium", "Visual", "Simple"],
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://www.notion.so",
    description: "Approachable, content-focused layout that feels friendly and organized.",
    tags: ["Friendly", "Content", "Light"],
  },
  {
    id: "framer",
    name: "Framer",
    url: "https://www.framer.com",
    description: "Creative modern web design with bold type and expressive motion.",
    tags: ["Creative", "Bold", "Modern"],
  },
  {
    id: "awwwards",
    name: "Awwwards",
    url: "https://www.awwwards.com",
    description: "Broad gallery of cutting-edge web design for inspiration browsing.",
    tags: ["Gallery", "Experimental", "Trends"],
  },
];

export const WEBSITE_STYLE_OPTIONS = [
  { id: "minimalist", label: "Minimalist", description: "Lots of space, few elements, calm and focused." },
  { id: "modern-corporate", label: "Modern Corporate", description: "Professional, structured, trustworthy." },
  { id: "elegant-luxury", label: "Elegant / Luxury", description: "Refined typography, premium feel." },
  { id: "friendly", label: "Friendly / Approachable", description: "Warm colors, conversational tone." },
  { id: "bold-creative", label: "Bold / Creative", description: "Strong visuals, distinctive personality." },
  { id: "editorial", label: "Editorial / Magazine", description: "Rich layouts, storytelling, strong headings." },
  { id: "tech-saas", label: "Technology / SaaS", description: "Product screenshots, feature grids, crisp UI." },
  { id: "natural", label: "Natural / Organic", description: "Earth tones, soft shapes, human touch." },
  { id: "traditional", label: "Professional / Traditional", description: "Classic business website conventions." },
  { id: "playful", label: "Playful", description: "Expressive color, rounded shapes, energetic." },
  { id: "recommend", label: "Not sure — recommend a style", description: "We will suggest options based on your answers." },
];

export const BRAND_TONE_OPTIONS = [
  { id: "professional", label: "Professional and trustworthy", example: "Clear, confident language that builds credibility." },
  { id: "friendly", label: "Friendly and conversational", example: "Warm, approachable copy — like talking to a helpful expert." },
  { id: "welcoming", label: "Warm and welcoming", example: "Inviting tone that puts visitors at ease." },
  { id: "innovative", label: "Modern and innovative", example: "Forward-looking language that highlights fresh ideas." },
  { id: "elegant", label: "Elegant and sophisticated", example: "Polished, refined wording with attention to detail." },
  { id: "bold", label: "Bold and confident", example: "Direct statements that stand out from competitors." },
  { id: "calm", label: "Calm and reassuring", example: "Steady, supportive tone — especially for sensitive services." },
  { id: "playful", label: "Playful and energetic", example: "Lively voice with personality and momentum." },
  { id: "technical", label: "Technical and precise", example: "Exact terminology for expert or B2B audiences." },
  { id: "simple", label: "Simple and direct", example: "Short sentences, plain words, no fluff." },
];
