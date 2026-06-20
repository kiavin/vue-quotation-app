import { computed } from 'vue'
import type { BrandingSnapshot } from '@/types/organization'

// ────────────────────────────────────────────
// Color conversion utilities
// ────────────────────────────────────────────

interface HSL {
  h: number
  s: number
  l: number
}

/**
 * Parse a hex color string to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  const full = cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  }
}

/**
 * Convert RGB to HSL.
 */
function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * Convert HSL values to a hex string.
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Parse a hex color to HSL.
 */
function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsl(r, g, b)
}

// ────────────────────────────────────────────
// Contrast & luminance
// ────────────────────────────────────────────

/**
 * Calculate relative luminance of a hex color (WCAG).
 */
function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const [rr, gg, bb] = [r, g, b].map(c => {
    const srgb = c / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
}

/**
 * Returns white or dark text color based on background luminance.
 */
function getContrastColor(bgHex: string): string {
  const luminance = getRelativeLuminance(bgHex)
  return luminance > 0.4 ? '#1a1a1a' : '#ffffff'
}

/**
 * Returns a softer contrast text color for less prominent text on a background.
 */
function getSoftContrastColor(bgHex: string): string {
  const luminance = getRelativeLuminance(bgHex)
  return luminance > 0.4 ? '#4a4a4a' : '#e0e0e0'
}

// ────────────────────────────────────────────
// Palette generation
// ────────────────────────────────────────────

/**
 * Generate lightness-shifted variants of a color.
 * Returns an object of CSS var entries like: `--doc-{prefix}-5: #...`
 */
function generatePalette(hex: string, prefix: string): Record<string, string> {
  const hsl = hexToHsl(hex)
  const vars: Record<string, string> = {}

  // Base color
  vars[`--doc-${prefix}`] = hex
  vars[`--doc-${prefix}-contrast`] = getContrastColor(hex)
  vars[`--doc-${prefix}-soft-contrast`] = getSoftContrastColor(hex)

  // Lighter tints (mix toward white)
  const tintSteps = [5, 8, 10, 15, 20, 30, 50]
  for (const step of tintSteps) {
    const newL = Math.min(100, hsl.l + (100 - hsl.l) * (step / 55))
    // Desaturate slightly for very light tints to keep them elegant
    const newS = step >= 30 ? Math.max(0, hsl.s * 0.4) : Math.max(0, hsl.s * (1 - step * 0.008))
    vars[`--doc-${prefix}-${step}`] = hslToHex(hsl.h, newS, newL)
  }

  // Darker shades
  const darkSteps = [70, 80, 90]
  for (const step of darkSteps) {
    const factor = (step - 50) / 50 // 0.4, 0.6, 0.8
    const newL = Math.max(5, hsl.l * (1 - factor * 0.7))
    vars[`--doc-${prefix}-${step}`] = hslToHex(hsl.h, hsl.s, newL)
  }

  return vars
}

// ────────────────────────────────────────────
// Main composable
// ────────────────────────────────────────────

import { toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Takes branding settings and returns reactive CSS custom properties
 * for use in document templates via `:style="cssVars"`.
 */
export function useDocumentColors(brandingParam: MaybeRefOrGetter<BrandingSnapshot> | BrandingSnapshot) {
  
  const cssVars = computed(() => {
    // toValue unwraps refs and getters, or returns the object directly if it's already a reactive proxy.
    // However, if it's just a raw object passed once, it won't be reactive.
    // In our case, passing `() => props.branding` is safest.
    const branding = typeof brandingParam === 'function' ? brandingParam() : toValue(brandingParam)
    
    const primaryColor = branding.primary_color || '#0F766E'
    const secondaryColor = branding.secondary_color || '#0EA5E9'
    const accentColor = branding.accent_color || '#F59E0B'

    return {
      ...generatePalette(primaryColor, 'primary'),
      ...generatePalette(secondaryColor, 'secondary'),
      ...generatePalette(accentColor, 'accent'),

      // Semantic aliases for convenience
      '--doc-bg': '#ffffff',
      '--doc-text': '#1a1a1a',
      '--doc-text-muted': '#6b7280',
      '--doc-text-light': '#9ca3af',
      '--doc-border': '#e5e7eb',
      '--doc-border-light': '#f3f4f6',
      '--doc-surface': '#f9fafb',
    }
  })

  const contrastOnPrimary = computed(() => {
    const branding = typeof brandingParam === 'function' ? brandingParam() : toValue(brandingParam)
    return getContrastColor(branding.primary_color || '#0F766E')
  })
  
  const contrastOnSecondary = computed(() => {
    const branding = typeof brandingParam === 'function' ? brandingParam() : toValue(brandingParam)
    return getContrastColor(branding.secondary_color || '#0EA5E9')
  })
  
  const contrastOnAccent = computed(() => {
    const branding = typeof brandingParam === 'function' ? brandingParam() : toValue(brandingParam)
    return getContrastColor(branding.accent_color || '#F59E0B')
  })

  return {
    cssVars,
    contrastOnPrimary,
    contrastOnSecondary,
    contrastOnAccent,
    // Expose utilities for one-off usage
    getContrastColor,
    hexToHsl,
    hslToHex,
  }
}
