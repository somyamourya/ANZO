export interface SubtitleCue {
  start: number; // in seconds
  end: number; // in seconds
  text: string;
}

export function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

export function parseVTTorSRT(content: string): SubtitleCue[] {
  const cleanContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = cleanContent.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('-->')) {
        const [startStr, endStr] = line.split('-->');
        const start = parseTimeToSeconds(startStr);
        const end = parseTimeToSeconds(endStr.trim().split(' ')[0]);

        const textLines = lines.slice(i + 1)
          .map((l) => l.replace(/<[^>]*>/g, '').trim())
          .filter((l) => l.length > 0);

        if (textLines.length > 0 && end > start) {
          cues.push({
            start,
            end,
            text: textLines.join('\n'),
          });
        }
        break;
      }
    }
  }

  return cues;
}

export function getActiveCueText(cues: SubtitleCue[], currentTime: number): string | null {
  const active = cues.find((c) => currentTime >= c.start && currentTime <= c.end);
  return active ? active.text : null;
}
