export interface WordResult {
  word: string;
  match: boolean;
  similarity?: number;
  /** Diacritics (tashkeel) accuracy for this word, 0–100. */
  tashkeelAccuracy?: number;
}

export interface SpeechResult {
  accuracy: number;
  wordAccuracy: number;
  /** Pronunciation score based on tashkeel (diacritics) accuracy. */
  pronunciationScore: number;
  wordResults: WordResult[];
  feedback: string[];
  recognizedText?: string;
}

/**
 * Analyze spoken text against target hadith text.
 * Sends the transcribed text to the server for comparison.
 * No audio needed — works with Web Speech API (free, client-side).
 */
export async function analyzeArabicSpeech(
  spokenText: string,
  targetText: string,
): Promise<SpeechResult> {
  const response = await fetch("/api/speech-review", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      spokenText,
      targetText,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Speech analysis failed");
  }

  return data as SpeechResult;
}

/**
 * Legacy: analyze audio blob via server-side API.
 * Only works if NVIDIA_API_KEY or OPENAI_API_KEY is configured.
 */
export async function analyzeArabicSpeechAudio(
  audioBlob: Blob,
  targetText: string,
): Promise<SpeechResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("targetText", targetText);

  const response = await fetch("/api/speech-review", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Speech analysis failed");
  }

  return data as SpeechResult;
}

/**
 * Check if the browser supports the Web Speech API for Arabic.
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    (typeof window !== "undefined") &&
    (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window))
  );
}

/** Local interface for the Web Speech API recognizer to avoid depending on browser type declarations */
export interface SpeechRecognizer {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognizerEvent) => void) | null;
  onerror: ((event: SpeechRecognizerErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export interface SpeechRecognizerEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognizerResultList;
}

export interface SpeechRecognizerResultList {
  readonly length: number;
  [index: number]: SpeechRecognizerResult;
}

export interface SpeechRecognizerResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognizerAlternative;
}

export interface SpeechRecognizerAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognizerErrorEvent {
  readonly error: string;
  readonly message?: string;
}

/**
 * Create a Web Speech recognition instance configured for Arabic.
 */
export function createArabicSpeechRecognizer(): SpeechRecognizer | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) return null;

  const recognizer = new SpeechRecognitionAPI();
  recognizer.lang = "ar";
  recognizer.continuous = true;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  return recognizer;
}
