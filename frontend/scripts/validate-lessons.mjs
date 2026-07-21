//! Checks every Tafsir lesson file before the site is built.
//! Periksa setiap fail pelajaran Tafsir sebelum site dibina.
//! If any lesson is malformed, this exits with an error so CI stops BEFORE deploying.
//! Kalau ada pelajaran rosak, ni keluar dengan error supaya CI berhenti SEBELUM deploy.
//NOTE Zero dependencies on purpose: fewer moving parts, less to break.
//NOTE Sengaja tiada dependency: kurang bahagian bergerak, kurang benda boleh rosak.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const lessonsDir = join(here, "..", "src", "content", "lessons");

//? Each rule is [field, test, message]. Keeping them in one list makes the schema easy to read.
//? Setiap peraturan ialah [field, test, message]. Simpan dalam satu senarai buat schema senang dibaca.
const rules = [
  ["number", (v) => Number.isInteger(v) && v > 0, "must be a whole number above 0"],
  ["title", (v) => typeof v === "string" && v.trim().length > 0, "must be a non-empty string"],
  ["surah", (v) => typeof v === "string" && v.trim().length > 0, "must be a non-empty string"],
  ["ayah", (v) => typeof v === "string" && /^\d+:\d+/.test(v), "must look like \"2:255\""],
  ["arabic", (v) => typeof v === "string", "must be a string (empty string is allowed)"],
  ["translation", (v) => typeof v === "string" && v.trim().length > 0, "must be a non-empty string"],
  ["source", (v) => typeof v === "string" && v.trim().length > 0, "must be a non-empty string"],
  ["takeaways", (v) => Array.isArray(v) && v.length >= 1 && v.length <= 5 && v.every((t) => typeof t === "string" && t.trim()), "must be an array of 1 to 5 non-empty strings"],
  ["reflection", (v) => typeof v === "string" && v.trim().length > 0, "must be a non-empty string"],
  ["selfTest", (v) => v && typeof v === "object" && typeof v.question === "string" && v.question.trim() && typeof v.answer === "string" && v.answer.trim(), "must be an object with non-empty question and answer"],
];

const files = readdirSync(lessonsDir).filter(
  //? Files starting with "_" (like _TEMPLATE.json) are skipped — they are guides, not real lessons.
  //? Fail yang mula dengan "_" (macam _TEMPLATE.json) dilangkau — ia panduan, bukan pelajaran betul.
  (f) => f.endsWith(".json") && !f.startsWith("_"),
);

const errors = [];
const seenNumbers = new Map();

for (const file of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(lessonsDir, file), "utf8"));
  } catch (parseError) {
    errors.push(`${file}: not valid JSON — ${parseError.message}`);
    continue;
  }

  for (const [field, test, message] of rules) {
    if (!test(data[field])) {
      errors.push(`${file}: field "${field}" ${message}`);
    }
  }

  //WARN Two lessons with the same number would sort unpredictably, so we forbid it.
  //WARN Dua pelajaran dengan nombor sama akan susun tak menentu, jadi kita larang.
  if (Number.isInteger(data.number)) {
    if (seenNumbers.has(data.number)) {
      errors.push(`${file}: lesson number ${data.number} already used in ${seenNumbers.get(data.number)}`);
    } else {
      seenNumbers.set(data.number, file);
    }
  }
}

if (errors.length > 0) {
  console.error(`\n✗ Lesson validation failed (${errors.length} issue${errors.length > 1 ? "s" : ""}):\n`);
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  console.error("\nFix the file(s) above, then commit again.\n");
  process.exit(1);
}

console.log(`✓ ${files.length} lesson${files.length === 1 ? "" : "s"} valid.`);
