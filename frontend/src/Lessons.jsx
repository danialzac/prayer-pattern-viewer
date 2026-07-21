//! The Tafsir Journey section: renders lesson cards with a tap-to-reveal self-test.
//! Seksyen Perjalanan Tafsir: papar kad pelajaran dengan ujian-diri tap-untuk-dedah.
import { useState } from "react";
import { lessons } from "./lessonData";
import { IconOpenBook } from "./Ornaments";

function LessonCard({ lesson }) {
  //! Each card hides its self-test answer until the reader chooses to check themselves.
  //! Setiap kad sembunyikan jawapan ujian-diri sampai pembaca pilih untuk uji diri.
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="lesson-card">
      <div className="lesson-top">
        <span className="lesson-ref">{lesson.ayah}</span>
        <span className="lesson-number">Lesson {lesson.number}</span>
      </div>

      <h3>{lesson.title}</h3>
      <p className="lesson-surah">Surah {lesson.surah}</p>

      {lesson.arabic ? (
        <p className="lesson-arabic" lang="ar" dir="rtl">{lesson.arabic}</p>
      ) : null}
      <p className="lesson-translation">&ldquo;{lesson.translation}&rdquo;</p>

      <ul className="lesson-takeaways">
        {lesson.takeaways.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <p className="lesson-reflection">{lesson.reflection}</p>

      {/* //! The self-test is the revision engine: recall first, then reveal to check. */}
      {/* //! Ujian-diri ni enjin ulang kaji: ingat semula dulu, lepas tu dedah untuk semak. */}
      <div className="lesson-selftest">
        <p className="selftest-q">{lesson.selfTest.question}</p>
        {revealed ? (
          <p className="selftest-a">{lesson.selfTest.answer}</p>
        ) : (
          <button type="button" className="button-secondary selftest-btn"
            onClick={() => setRevealed(true)}>
            Reveal answer
          </button>
        )}
      </div>

      <p className="lesson-source">{lesson.source}</p>
    </article>
  );
}

export function LessonsSection() {
  //? If there are no real lessons yet, the section invites the first one instead of showing empty.
  //? Kalau belum ada pelajaran betul, seksyen ni jemput yang pertama dan bukan tunjuk kosong.
  return (
    <section className="panel lessons-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Tafsir Journey</p>
          <h2>Lessons I&apos;m Revising</h2>
        </div>
        <span className="planner-icon"><IconOpenBook /></span>
      </div>

      <p className="helper-text">
        Short, structured notes from tafsir lessons — distilled to a few takeaways and a
        self-test, so revisiting one takes a minute and actually sticks.
      </p>

      {lessons.length ? (
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.number} lesson={lesson} />
          ))}
        </div>
      ) : (
        <div className="special-card empty">
          <strong>No lessons yet</strong>
          <p>The first lesson will appear here once it is added.</p>
        </div>
      )}
    </section>
  );
}
