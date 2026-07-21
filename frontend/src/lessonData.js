//! Loads every Tafsir lesson JSON file at build time and sorts them by lesson number.
//! Muat setiap fail JSON pelajaran Tafsir masa build dan susun ikut nombor pelajaran.
//* HOW: import.meta.glob is a Vite feature that bundles a folder of files automatically —
//* add a new .json lesson and it appears here with no code change. That is the low-error part.
//* HOW: import.meta.glob ciri Vite yang bundle satu folder fail secara auto —
//* tambah pelajaran .json baru dan ia muncul di sini tanpa ubah kod. Itu bahagian rendah-ralat.
const modules = import.meta.glob("./content/lessons/*.json", { eager: true });

export const lessons = Object.entries(modules)
  //? Skip helper files like _TEMPLATE.json (their path contains "/_").
  //? Langkau fail pembantu macam _TEMPLATE.json (path ada "/_").
  .filter(([path]) => !path.includes("/_"))
  .map(([, module]) => module.default ?? module)
  //? Newest lesson first, matching how a study series counts upward.
  //? Pelajaran terbaru dulu, ikut cara siri pembelajaran mengira menaik.
  .sort((a, b) => b.number - a.number);
