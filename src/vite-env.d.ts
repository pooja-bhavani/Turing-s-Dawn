/// <reference types="vite/client" />

// Typed access to the Gemini configuration injected at build time.
interface ImportMetaEnv {
  /** Google Gemini API key. Optional — absent → authored hints only. */
  readonly VITE_GEMINI_API_KEY?: string;
  /** Override the Gemini model (default: gemini-2.5-flash). */
  readonly VITE_GEMINI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
