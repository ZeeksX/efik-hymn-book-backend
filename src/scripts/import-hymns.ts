import fs from 'node:fs';

const importHymns = async (): Promise<void> => {
  const inputPath = process.argv[2] ?? './data/hymns.json';

  if (!fs.existsSync(inputPath)) {
    console.error(`Import file not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    console.error('The import file must contain a JSON array of hymns.');
    process.exit(1);
  }

  console.log(`Prepared ${parsed.length} hymns for validation and import.`);
  console.log('This placeholder importer is ready to be extended with validation and dry-run checks.');
};

importHymns().catch((error) => {
  console.error(error);
  process.exit(1);
});
