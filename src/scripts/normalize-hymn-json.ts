import fs from 'node:fs';
import path from 'node:path';

interface Verse {
  number: number;
  lines: string[];
}

interface HymnRecord {
  number: number;
  title: string;
  language: string;
  other_versions: string;
  bible_verse: string;
  status: 'draft';
  author: string;
  sourceText: string;
  verses: Verse[];
  needsReview: boolean;
}

const filePath = path.resolve('data/hymns.json');
const hymns = JSON.parse(fs.readFileSync(filePath, 'utf8')) as HymnRecord[];
const parseVerses = (sourceText: string): Verse[] => {
  const markers = [...sourceText.matchAll(/(?<!\w)((?:[1-9]|1[0-9]|20))\)\s+/g)];

  if (markers.length === 0) {
    return [{ number: 1, lines: [sourceText] }];
  }

  return markers.map((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end = markers[index + 1]?.index ?? sourceText.length;
    const text = sourceText.slice(start, end).trim();
    const lines = text
      .split(/\s*[,;]\s*/)
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      number: Number(marker[1]),
      lines: lines.length > 0 ? lines : [text],
    };
  });
};

const getSourceHeader = (hymn: HymnRecord): string => {
  const firstVerse = hymn.sourceText.search(/(?<!\w)(?:[1-9]|1[0-9]|20)\)\s+/);
  return firstVerse > 0 ? hymn.sourceText.slice(0, firstVerse).trim() : hymn.sourceText;
};

const getHeader = (hymn: HymnRecord): string => {
  return getSourceHeader(hymn);
};

const getAuthor = (hymn: HymnRecord): string => {
  const match = getHeader(hymn).match(new RegExp(`EHB\\s*${hymn.number}\\s+(.+?)(?=\\s+EHB\\s*${hymn.number}|\\s+RCH|\\s+MHB)`));
  return match?.[1]?.trim() ?? '';
};

const getOtherVersions = (hymn: HymnRecord): string => {
  const header = getHeader(hymn);
  const match = header.match(/(?:EHB\s*\d+[, ]*)?((?:RCH|MHB)[^.]*)/i);
  return match?.[1]?.replace(/\s+/g, ' ').replace(/,\s*$/, '').trim() ?? '';
};

const getBibleVerse = (hymn: HymnRecord): string => {
  const match = getHeader(hymn).match(/\b(?:Psalm|Isaiah|Matthew|Mark|Luke|John|Romans|Revelation)\s+[\d:.-]+/i);
  return match?.[0]?.trim() ?? '';
};

const normalized = hymns.map((hymn) => {
  if (hymn.number === 2) {
    return hymn;
  }

  return {
    number: hymn.number,
    title: hymn.title,
    language: `EHB ${hymn.number}`,
    other_versions: getOtherVersions(hymn),
    bible_verse: getBibleVerse(hymn),
    status: 'draft' as const,
    author: getAuthor(hymn),
    sourceText: hymn.sourceText,
    verses: parseVerses(hymn.sourceText),
    needsReview: true,
  };
});

fs.writeFileSync(filePath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
console.log(`Normalized ${normalized.length} hymn records in ${filePath}`);
