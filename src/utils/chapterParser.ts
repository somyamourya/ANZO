import { MangaChapter, MangaVolume } from '../types/manga';

export interface ParsedChapterInfo {
  number: number;
  decimalPart: number;
  rawString: string;
  volume?: number;
  title: string;
  isExtra: boolean;
  scanlationGroup?: string;
}

/**
 * Universal chapter parser supporting integers, decimals (e.g. 12.5),
 * prologues (0), specials/extras, and volume headers.
 */
export function parseChapterNumber(chapterInput: string | number): ParsedChapterInfo {
  const str = String(chapterInput).trim();

  // Check for prologue
  if (/prologue|intro/i.test(str)) {
    return {
      number: 0,
      decimalPart: 0,
      rawString: str,
      title: 'Prologue',
      isExtra: false,
    };
  }

  // Check for extra / side story / omake
  const isExtra = /extra|special|omake|side\s*story/i.test(str);

  // Extract chapter decimal e.g. "Chapter 12.5" -> 12.5
  const match = str.match(/(?:ch(?:apter)?\.?\s*)?(\d+)(?:\.(\d+))?/i);
  if (match) {
    const mainNum = parseInt(match[1], 10);
    const decimalNum = match[2] ? parseInt(match[2], 10) : 0;
    const fullNum = decimalNum > 0 ? parseFloat(`${mainNum}.${decimalNum}`) : mainNum;

    return {
      number: fullNum,
      decimalPart: decimalNum,
      rawString: str,
      title: isExtra ? `Special Chapter ${fullNum}` : `Chapter ${fullNum}`,
      isExtra,
    };
  }

  return {
    number: 1,
    decimalPart: 0,
    rawString: str,
    title: str,
    isExtra: false,
  };
}

/**
 * Extract volume number from a volume/chapter string e.g. "Vol. 3 Chapter 22" -> 3
 */
export function parseVolumeNumber(volumeInput: string | number): number | null {
  const str = String(volumeInput).trim();
  const match = str.match(/vol(?:ume)?\.?\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function groupChaptersByVolume(chapters: any[]): { volume: number | string; chapters: any[] }[] {
  const map: Record<string, any[]> = {};
  for (const ch of chapters) {
    const vol = ch.volumeNumber || ch.volume || 'Unassigned';
    const key = String(vol);
    if (!map[key]) map[key] = [];
    map[key].push(ch);
  }

  return Object.entries(map).map(([volKey, chs]) => ({
    volume: isNaN(Number(volKey)) ? volKey : Number(volKey),
    chapters: chs,
  }));
}

/**
 * Auto-collates a flat chapter list into structured synthetic or official
 * volumes (e.g., 10-15 chapters per volume) if source lacks volume grouping.
 */
export function collateChaptersIntoVolumes(
  chapters: MangaChapter[],
  chaptersPerVol = 12
): MangaVolume[] {
  // If chapters already have explicit volume tags
  const hasExplicitVolumes = chapters.some((c) => !!c.volume);

  if (hasExplicitVolumes) {
    const volumeMap: Record<string, MangaChapter[]> = {};

    for (const ch of chapters) {
      const volKey = ch.volume ? `Volume ${ch.volume}` : 'Standalone Chapters';
      if (!volumeMap[volKey]) volumeMap[volKey] = [];
      volumeMap[volKey].push(ch);
    }

    return Object.entries(volumeMap).map(([volName, chList]) => ({
      volume: volName,
      chapters: chList,
    }));
  }

  // Otherwise, group by numeric blocks
  const sorted = [...chapters].sort((a, b) => {
    const numA = parseChapterNumber(a.chapter).number;
    const numB = parseChapterNumber(b.chapter).number;
    return numA - numB; // Ascending order
  });

  const volumeList: MangaVolume[] = [];
  const total = sorted.length;

  for (let i = 0; i < total; i += chaptersPerVol) {
    const chunk = sorted.slice(i, i + chaptersPerVol);
    const volNum = Math.floor(i / chaptersPerVol) + 1;
    const startCh = chunk[0]?.chapter || '1';
    const endCh = chunk[chunk.length - 1]?.chapter || startCh;

    volumeList.push({
      volume: `Volume ${volNum} (Ch. ${startCh} - ${endCh})`,
      chapters: chunk.reverse(), // Most recent on top inside volume
    });
  }

  return volumeList.reverse(); // Newest volumes first
}
