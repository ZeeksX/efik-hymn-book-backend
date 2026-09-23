import fs from 'node:fs';
import path from 'node:path';

interface ImportedHymn {
  number: number;
  title: string;
  language: 'efik';
  status: 'draft';
  sourceText: string;
  verses: Array<{ number: number; lines: string[] }>;
  needsReview: true;
}

const parseVerses = (sourceText: string): Array<{ number: number; lines: string[] }> => {
  const verseMarkers = [...sourceText.matchAll(/(?<!\w)(\d+)\)\s+/g)];

  if (verseMarkers.length === 0) {
    return [{ number: 1, lines: [sourceText] }];
  }

  return verseMarkers.map((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end = verseMarkers[index + 1]?.index ?? sourceText.length;
    const text = sourceText.slice(start, end).trim();
    const lines = text
      .split(/\s*;\s*/)
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      number: Number(marker[1]),
      lines: lines.length > 0 ? lines : [text],
    };
  });
};

const inputPath = path.resolve('docs/efik-hymn-book.txt');
const outputPath = path.resolve('data/hymns.json');
const source = fs.readFileSync(inputPath, 'utf8').replace(/\s+/g, ' ').trim();
const markers = [...source.matchAll(/(?<!\w)EHB\s*(\d+)/g)];
const hymns: ImportedHymn[] = [];
const uniqueMarkers: Array<{ number: number; index: number }> = [];

for (const marker of markers) {
  const number = Number(marker[1]);
  const previous = uniqueMarkers[uniqueMarkers.length - 1];

  if (previous?.number === number || (previous && number < previous.number)) {
    continue;
  }

  uniqueMarkers.push({ number, index: marker.index ?? 0 });
}

for (let index = 0; index < uniqueMarkers.length; index += 1) {
  const marker = uniqueMarkers[index];
  const start = marker.index;
  const end = uniqueMarkers[index + 1]?.index ?? source.length;

  const sourceText = source.slice(start, end).trim();

  hymns.push({
    number: marker.number,
    title: `Imported hymn ${marker.number}`,
    language: 'efik',
    status: 'draft',
    sourceText,
    verses: parseVerses(sourceText),
    needsReview: true,
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(hymns, null, 2)}\n`, 'utf8');
console.log(`Wrote ${hymns.length} hymn records to ${outputPath}`);
