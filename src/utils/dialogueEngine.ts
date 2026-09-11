import { SubtitleCue } from './subtitleParser';
import { DialogueItem } from '../types/cineplayer';

// Sample translation dictionary for common anime phrases & words
const TRANSLATION_MAP: Record<string, Record<string, string>> = {
  hi: {
    'I will become the Pirate King!': 'मैं समुद्री डाकू राजा बनूँगा!',
    "Let's go to the Grand Line!": 'चलो ग्रैंड लाइन की ओर चलें!',
    'Hello': 'नमस्ते',
    'Thank you': 'धन्यवाद',
    'Attack': 'आक्रमण',
    'Protect': 'रक्षा करो',
  },
  es: {
    'I will become the Pirate King!': '¡Me convertiré en el Rey de los Piratas!',
    "Let's go to the Grand Line!": '¡Vamos al Grand Line!',
    'Hello': 'Hola',
    'Thank you': 'Gracias',
  },
  fr: {
    'I will become the Pirate King!': 'Je deviendrai le Roi des Pirates !',
    "Let's go to the Grand Line!": 'Allons sur Grand Line !',
  },
  de: {
    'I will become the Pirate King!': 'Ich werde der König der Piraten!',
    "Let's go to the Grand Line!": 'Auf zur Grand Line!',
  },
};

export function cuesToDialogueItems(cues: SubtitleCue[]): DialogueItem[] {
  return cues.map((cue, index) => ({
    id: index + 1,
    start: cue.start,
    end: cue.end,
    text: cue.text,
  }));
}

export function searchDialogue(items: DialogueItem[], query: string): DialogueItem[] {
  if (!query.trim()) return items;
  const clean = query.toLowerCase().trim();
  return items.filter((item) => item.text.toLowerCase().includes(clean));
}

export function findCurrentDialogueCue(cues: SubtitleCue[], currentTime: number): SubtitleCue | null {
  return cues.find((c) => currentTime >= c.start && currentTime <= c.end) || null;
}

export function findPreviousDialogueCue(cues: SubtitleCue[], currentTime: number): SubtitleCue | null {
  const current = findCurrentDialogueCue(cues, currentTime);
  if (current) {
    const idx = cues.indexOf(current);
    if (idx > 0) return cues[idx - 1];
    return current;
  }

  // If not currently in cue, find closest previous cue
  const prevCues = cues.filter((c) => c.end <= currentTime);
  return prevCues.length > 0 ? prevCues[prevCues.length - 1] : null;
}

export function translateSubtitleText(text: string, targetLanguage: string): string {
  if (targetLanguage === 'en' || !targetLanguage) return text;

  const langMap = TRANSLATION_MAP[targetLanguage];
  if (langMap && langMap[text]) {
    return langMap[text];
  }

  // Simulated instant smart translation label
  const langNames: Record<string, string> = {
    hi: '[हिन्दी] ',
    es: '[ES] ',
    fr: '[FR] ',
    de: '[DE] ',
    ja: '[JA] ',
    ar: '[AR] ',
  };
  const prefix = langNames[targetLanguage] || `[${targetLanguage.toUpperCase()}] `;
  return `${prefix}${text}`;
}
