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

export async function analyzeArabicSpeech(
  audioBlob: Blob,
  targetText: string
): Promise<SpeechResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("targetText", targetText);

  const response = await fetch("/api/speech-review", {
    method: "POST",
    body: formData,
  });

  // Even 200 responses can carry "please configure API key" feedback.
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Speech analysis failed");
  }

  return data as SpeechResult;
}
