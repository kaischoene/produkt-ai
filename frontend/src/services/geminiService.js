import { GoogleGenAI } from '@google/genai';

const API_KEY_STORAGE = 'gemini_api_key';
const CREDITS_STORAGE = 'produktai_credits';
const INITIAL_CREDITS = 100;

// ─── API Key Management ───────────────────────
export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE) || '';
export const setApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key);
export const hasApiKey = () => !!localStorage.getItem(API_KEY_STORAGE);

// ─── Credit Management ───────────────────────
export const getCredits = () => {
  const stored = localStorage.getItem(CREDITS_STORAGE);
  if (stored === null) {
    localStorage.setItem(CREDITS_STORAGE, INITIAL_CREDITS.toString());
    return INITIAL_CREDITS;
  }
  return parseInt(stored, 10);
};

export const deductCredits = (amount) => {
  const current = getCredits();
  const newAmount = Math.max(0, current - amount);
  localStorage.setItem(CREDITS_STORAGE, newAmount.toString());
  return newAmount;
};

export const setCredits = (amount) => {
  localStorage.setItem(CREDITS_STORAGE, amount.toString());
};

// ─── Gemini Client ────────────────────────────
const getClient = () => {
  const key = getApiKey();
  if (!key) throw new Error('Kein API-Key gesetzt. Bitte gib deinen Google AI API-Key ein.');
  return new GoogleGenAI({ apiKey: key });
};

// ─── Image Generation (Text to Image) ─────────
export const generateImage = async (prompt, options = {}) => {
  const ai = getClient();

  const config = {
    responseModalities: ['TEXT', 'IMAGE'],
  };

  if (options.aspectRatio) {
    config.imageConfig = { aspectRatio: options.aspectRatio };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config,
  });

  return extractImagesFromResponse(response);
};

// ─── Image Generation with Reference Images ───
export const generateWithReferences = async (prompt, referenceImages, options = {}) => {
  const ai = getClient();

  const contents = [{ text: prompt }];

  for (const img of referenceImages) {
    contents.push({
      inlineData: {
        mimeType: img.mimeType || 'image/png',
        data: img.base64,
      },
    });
  }

  const config = {
    responseModalities: ['TEXT', 'IMAGE'],
  };

  if (options.aspectRatio) {
    config.imageConfig = { aspectRatio: options.aspectRatio };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
    config,
  });

  return extractImagesFromResponse(response);
};

// ─── Image Analysis (Image to Prompt) ──────────
export const analyzeImage = async (base64Data, mimeType = 'image/png') => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        text: `Analysiere dieses Bild und erstelle einen ultra-detaillierten Prompt auf Englisch, der das Bild exakt nachbilden koennte.
Beschreibe:
- Hauptmotiv und Komposition
- Beleuchtung und Schatten
- Farbpalette und Stimmung
- Materialien und Texturen
- Kamerawinkel und Perspektive
- Hintergrund und Umgebung
- Stil (fotorealistisch, illustriert, etc.)

Gib NUR den Prompt zurueck, ohne Erklaerungen oder Einleitungen.`,
      },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts
    ?.filter((p) => p.text)
    ?.map((p) => p.text)
    ?.join('\n');

  return text || 'Analyse konnte keinen Prompt generieren.';
};

// ─── Combine / Create Images ───────────────────
export const combineImages = async (images, prompt, options = {}) => {
  // If no images provided, fall back to text-to-image
  if (!images || images.length === 0) {
    return generateImage(prompt, options);
  }

  const ai = getClient();

  const contents = [{ text: prompt }];

  for (const img of images) {
    contents.push({
      inlineData: {
        mimeType: img.mimeType || 'image/png',
        data: img.base64,
      },
    });
  }

  const config = {
    responseModalities: ['TEXT', 'IMAGE'],
  };

  if (options.aspectRatio) {
    config.imageConfig = { aspectRatio: options.aspectRatio };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
    config,
  });

  return extractImagesFromResponse(response);
};

// ─── Helper: Extract images from response ──────
const extractImagesFromResponse = (response) => {
  const results = { images: [], text: '' };

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error('Keine Antwort vom Modell erhalten.');
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      results.text += part.text;
    } else if (part.inlineData) {
      const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      results.images.push({
        dataUrl,
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      });
    }
  }

  if (results.images.length === 0) {
    throw new Error('Das Modell hat kein Bild generiert. Versuche einen anderen Prompt.');
  }

  return results;
};
