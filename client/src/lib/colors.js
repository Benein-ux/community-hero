export const COLORS_DARK = {
  bgPrimary: "#11141A",
  bgSurface: "#1B2230",
  bgSurfaceRaised: "#232834",
  border: "#232834",
  accentPrimary: "#FF8A4C",
  accentSecondary: "#7DD4C0",
  textPrimary: "#F4F2EC",
  textSecondary: "#8B92A3",
  textMuted: "#5A6275",
  success: "#7DD4C0",
  warning: "#FF8A4C",
  danger: "#E2554A",
};

export const COLORS_LIGHT = {
  bgPrimary: "#F7F6F2",
  bgSurface: "#FFFFFF",
  bgSurfaceRaised: "#F0EEE8",
  border: "#E4E2DA",
  accentPrimary: "#E8703A",
  accentSecondary: "#2D9684",
  textPrimary: "#1A1D1F",
  textSecondary: "#5A6275",
  textMuted: "#9298A3",
  success: "#2D9684",
  warning: "#E8703A",
  danger: "#E2554A",
};

// Named exports for direct import (dark mode defaults)
export const ACCENT_PRIMARY = COLORS_DARK.accentPrimary;
export const ACCENT_SECONDARY = COLORS_DARK.accentSecondary;
export const SUCCESS = COLORS_DARK.success;
export const WARNING = COLORS_DARK.warning;
export const DANGER = COLORS_DARK.danger;
export const BG_PRIMARY = COLORS_DARK.bgPrimary;
export const BG_SURFACE = COLORS_DARK.bgSurface;
export const BG_SURFACE_RAISED = COLORS_DARK.bgSurfaceRaised;
export const BORDER = COLORS_DARK.border;
export const TEXT_PRIMARY = COLORS_DARK.textPrimary;
export const TEXT_SECONDARY = COLORS_DARK.textSecondary;
export const TEXT_MUTED = COLORS_DARK.textMuted;

export const CATEGORY_COLORS = {
  pothole: "#FF8A4C",
  streetlight: "#FF8A4C",
  "water-leak": "#7DD4C0",
  trash: "#E2554A",
  graffiti: "#A855F7",
  sidewalk: "#F59E0B",
  "traffic-sign": "#06B6D4",
  drainage: "#14B8A6",
  vegetation: "#84CC16",
  other: "#6B7280",
};

export const STATUS_COLORS = {
  reported: "#FF8A4C",
  in_progress: "#F59E0B",
  resolved: "#7DD4C0",
};

export const SEVERITY_COLORS = {
  low: "#7DD4C0",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#E2554A",
};

export const getStatusColor = (status) => STATUS_COLORS[status] || ACCENT_PRIMARY;
export const getSeverityColor = (severity) => SEVERITY_COLORS[severity] || TEXT_MUTED;
export const getCategoryColor = (category) => CATEGORY_COLORS[category] || TEXT_MUTED;