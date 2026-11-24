// Seventeen Syllables of Debugging — entry program.
//
// Writes one original haiku about debugging to /output/entry.txt.
// The grader reads that file; the gate requires UTF-8 text of 1-200
// characters, so this program validates the haiku before writing it.
//
// The haiku (three lines, 5-7-5 syllables, 73 characters total):
//   the cursor blinks, waits          (5)
//   the stack trace points at nothing (7)
//   it was a comma                    (5)
//
// Why this one: the picture is concrete — a blinking cursor, a stack
// trace that points at nothing — and the last line turns it: after all
// that staring, the bug was a single comma.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Each line carries its words with hand-verified syllable counts.
// (Counted by hand, word by word; no heuristic syllable estimator.)
const LINES: Array<{ text: string; words: Array<[string, number]> }> = [
  {
    text: "the cursor blinks, waits",
    words: [["the", 1], ["cursor", 2], ["blinks", 1], ["waits", 1]],
  },
  {
    text: "the stack trace points at nothing",
    words: [
      ["the", 1],
      ["stack", 1],
      ["trace", 1],
      ["points", 1],
      ["at", 1],
      ["nothing", 2],
    ],
  },
  {
    text: "it was a comma",
    words: [["it", 1], ["was", 1], ["a", 1], ["comma", 2]],
  },
];

const EXPECTED_SYLLABLES = [5, 7, 5];
const MAX_CHARS = 200;

function syllablesOf(line: { words: Array<[string, number]> }): number {
  return line.words.reduce((total, [, count]) => total + count, 0);
}

function buildHaiku(): string {
  if (LINES.length !== 3) {
    throw new Error(`expected exactly 3 lines, got ${LINES.length}`);
  }
  LINES.forEach((line, i) => {
    const got = syllablesOf(line);
    if (got !== EXPECTED_SYLLABLES[i]) {
      throw new Error(
        `line ${i + 1} has ${got} syllables, expected ${EXPECTED_SYLLABLES[i]}: ${line.text}`,
      );
    }
    const spoken = line.text.replace(/[^a-z ]/gi, "").split(/\s+/).filter(Boolean);
    const listed = line.words.map(([w]) => w);
    if (spoken.join(" ") !== listed.join(" ")) {
      throw new Error(`line ${i + 1} word list does not match its text: ${line.text}`);
    }
  });
  const haiku = LINES.map((line) => line.text).join("\n");
  if (haiku.length < 1 || haiku.length > MAX_CHARS) {
    throw new Error(`haiku is ${haiku.length} characters, must be 1-${MAX_CHARS}`);
  }
  if (haiku.trim() !== haiku || /\n$/.test(haiku)) {
    throw new Error("haiku must not start/end with whitespace or a trailing newline");
  }
  return haiku;
}

function main(): void {
  const haiku = buildHaiku();
  // The kit contract is a fixed path: /output/entry.txt.
  // OUTPUT_DIR is honoured only when explicitly set (local runs).
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, haiku, "utf8");
  console.log(
    `Wrote ${haiku.length} characters (${EXPECTED_SYLLABLES.join("-")} syllables) to ${outPath}`,
  );
}

main();
