export const SEVERITY_TYPES = {
  CRITICAL: "critical",
  SERIOUS: "serious",
  MODERATE: "moderate",
  MINOR: "minor",
};

export const SEVERITY_LABELS = {
  [SEVERITY_TYPES.CRITICAL]: "Critical",
  [SEVERITY_TYPES.SERIOUS]: "Serious",
  [SEVERITY_TYPES.MODERATE]: "Moderate",
  [SEVERITY_TYPES.MINOR]: "Minor",
};

export const WCAG_LEVELS = {
  A: "A",
  AA: "AA",
  AAA: "AAA",
};

export const ISSUE_CATEGORIES = {
  IMAGES: "Images",
  COLOR_CONTRAST: "Color Contrast",
  FORMS: "Forms",
  ARIA: "ARIA",
  KEYBOARD: "Keyboard Navigation",
  STRUCTURE: "Document Structure",
  LANGUAGE: "Language",
  NAVIGATION: "Navigation",
};

export const TAB_NAMES = {
  NEW_SCAN: "New Scan",
  RESULTS: "Results",
  VISUAL_MAP: "Visual Map",
  FIX_GUIDANCE: "Fix Guidance",
  HISTORY: "History",
};

export const EXPORT_FORMATS = {
  PDF: "pdf",
  CSV: "csv",
};

export const API_TIMEOUTS = {
  DEFAULT: 30000,
  SCAN: 60000,
  EXPORT: 45000,
};

export const LOCAL_STORAGE_KEYS = {
  SCAN_HISTORY: "accessibility_scan_history",
  USER_PREFERENCES: "accessibility_user_preferences",
};
