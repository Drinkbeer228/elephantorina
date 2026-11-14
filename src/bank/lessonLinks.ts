/**
 * Какой урок старого курса (`src/data/coursesData.ts`) к какой книге библиотеки относится.
 * Из уроков берутся только вопросы, случаи и карточки; теория осталась в книгах.
 *
 * `checked: true` — пара из спецификации живой библиотеки (Research Station, приложение A),
 * она уже стоит в ссылках библиотеки. `checked: false` — сопоставлено по названию модуля,
 * перед тем как на неё полагаться, сверить урок со статьёй.
 *
 * Урок без строки здесь попадает в «Вопросы без книги» на странице «Список».
 * Чтобы привязать — добавьте строку.
 */
export interface LessonLink {
  lesson: string;
  book: string;
  checked: boolean;
}

export const LESSON_LINKS: LessonLink[] = [
  // ── из спецификации библиотеки (приложение A) ──
  { lesson: 'lesson-3-18-1', book: 'anatomy/muscular-hydrostat-and-trunk-biomechanics', checked: true },
  { lesson: 'lesson-3-17-1', book: 'anatomy/sensory-umwelt-and-multimodal-perception', checked: true },
  { lesson: 'lesson-3-19-1', book: 'anatomy/skeletal-system-cranial-and-dentition', checked: true },
  { lesson: 'lesson-3-5-1', book: 'anatomy/skeletal-system-appendicular-and-biomechanics', checked: true },
  { lesson: 'lesson-3-9-1', book: 'anatomy/digestive-system-macroanatomy-and-vascularization', checked: true },
  { lesson: 'lesson-3-13-1', book: 'anatomy/urogenital-system-and-reproductive-anatomy', checked: true },
  { lesson: 'lesson-3-6-1', book: 'veterinary/clinical-podiatry-and-foot-care', checked: true },
  { lesson: 'lesson-3-21-1', book: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols', checked: true },
  { lesson: 'lesson-3-7-1', book: 'veterinary/chemical-immobilization-and-anesthesia', checked: true },
  { lesson: 'lesson-3-10-1', book: 'veterinary/gastrointestinal-physiology-and-colic', checked: true },
  { lesson: 'lesson-3-12-1', book: 'veterinary/clinical-welfare-and-protected-contact', checked: true },
  { lesson: 'lesson-3-15-1', book: 'veterinary/elephant-neonatology-and-calves', checked: true },
  { lesson: 'lesson-3-11-1', book: 'ethogram/musth-ethology-and-endocrinology', checked: true },
  { lesson: 'lesson-2-1-1', book: 'ethogram/seismic-and-infrasonic-communication', checked: true },
  { lesson: 'lesson-7-34-1', book: 'ethogram/inbreeding-avoidance-and-mate-choice', checked: true },
  { lesson: 'lesson-5-25-1', book: 'cognition/cognitive-architecture-and-self-awareness', checked: true },
  { lesson: 'lesson-5-26-1', book: 'cognition/cooperation-and-problem-solving', checked: true },
  { lesson: 'lesson-5-27-1', book: 'cognition/empathy-and-mourning-rituals', checked: true },
  { lesson: 'lesson-5-28-1', book: 'cognition/spatial-cognition-mental-maps-and-navigation', checked: true },
  { lesson: 'lesson-6-29-1', book: 'ecology/feeding-ecology-nutrition-and-geophagy', checked: true },
  { lesson: 'lesson-6-30-1', book: 'ecology/climate-change-and-range-dynamics', checked: true },
  { lesson: 'lesson-6-31-1', book: 'ecology/ecosystem-engineers-and-keystone-ecology', checked: true },
  { lesson: 'lesson-6-32-1', book: 'ecology/ecosystem-breakdown-syndrome', checked: true },
  { lesson: 'lesson-7-33-1', book: 'ecology/comparative-genomics-and-cancer-resistance', checked: true },
  { lesson: 'lesson-7-36-1', book: 'conservation/ivory-trade-and-forensic-genetics', checked: true },
  { lesson: 'lesson-4-6-1', book: 'conservation/spatial-ecology-and-connectivity-corridors', checked: true },
  { lesson: 'lesson-4-7-1', book: 'conservation/human-elephant-conflict-mitigation', checked: true },
  { lesson: 'lesson-4-8-1', book: 'conservation/translocation-reintroduction-and-metapopulations', checked: true },
  { lesson: 'lesson-4-3-1', book: 'conservation/cites-mike-and-anti-poaching-monitoring', checked: true },
  { lesson: 'lesson-3-20-1', book: 'taxonomy/proboscidea-evolution-and-phylogeny', checked: true },
  { lesson: 'lesson-4-2-1', book: 'taxonomy/mammuthus-evolution-and-island-dwarfism', checked: true },
  { lesson: 'lesson-8-37-1', book: 'taxonomy/proboscidea-early-evolution-and-stem-groups', checked: true },
  { lesson: 'lesson-4-4-1', book: 'paleontology/skeletal-paleopathology-and-biomechanics', checked: true },

  // ── по названию модуля, сверить ──
  { lesson: 'lesson-1-1', book: 'anatomy/muscular-hydrostat-and-trunk-biomechanics', checked: false },
  { lesson: 'lesson-2-1', book: 'anatomy/skeletal-system-appendicular-and-biomechanics', checked: false },
  { lesson: 'lesson-3-1', book: 'veterinary/gastrointestinal-physiology-and-colic', checked: false },
  { lesson: 'lesson-3-1-1', book: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols', checked: false },
  { lesson: 'lesson-3-2-1', book: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols', checked: false },
  { lesson: 'lesson-3-3-1', book: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols', checked: false },
  { lesson: 'lesson-3-4-1', book: 'veterinary/eehv-endotheliotropic-herpesvirus-protocols', checked: false },
  { lesson: 'lesson-3-8-1', book: 'veterinary/chemical-immobilization-and-anesthesia', checked: false },
  { lesson: 'lesson-3-16-1', book: 'ecology/comparative-genomics-and-cancer-resistance', checked: false },
  { lesson: 'lesson-4-1-1', book: 'taxonomy/proboscidea-evolution-and-phylogeny', checked: false },
  { lesson: 'lesson-4-5-1', book: 'conservation/ivory-trade-and-forensic-genetics', checked: false },
  { lesson: 'lesson-8-38-1', book: 'taxonomy/gomphotheriidae-and-amebelodontidae-evolution', checked: false },
  { lesson: 'lesson-8-40-1', book: 'taxonomy/deinotheriidae-evolution-and-functional-morphology', checked: false },
  { lesson: 'lesson-8-41-1', book: 'taxonomy/palaeoloxodon-evolution-and-gigantism', checked: false },
  { lesson: 'lesson-8-42-1', book: 'taxonomy/mammuthus-evolution-and-island-dwarfism', checked: false },
  { lesson: 'lesson-8-43-1', book: 'paleontology/paleogenomics-vs-paleoproteomics-systematics', checked: false },
  { lesson: 'lesson-8-44-1', book: 'paleontology/skeletal-paleopathology-and-biomechanics', checked: false },
  { lesson: 'lesson-8-45-1', book: 'ecology/paleoecology-and-megafaunal-extinction', checked: false },
  { lesson: 'lesson-9-46-1', book: 'conservation/human-elephant-conflict-mitigation', checked: false },
  { lesson: 'lesson-9-47-1', book: 'conservation/cites-mike-and-anti-poaching-monitoring', checked: false },
  { lesson: 'lesson-9-48-1', book: 'culture/sacred-white-elephants-inbreeding-and-captive-genetics', checked: false },
  { lesson: 'lesson-9-49-1', book: 'conservation/spatial-ecology-and-connectivity-corridors', checked: false },
  { lesson: 'lesson-9-50-1', book: 'ecology/ecosystem-engineers-and-keystone-ecology', checked: false },
  { lesson: 'lesson-9-51-1', book: 'culture/china-elephant-retreat-and-environmental-history', checked: false },

  // Без книги пока: lesson-0-1 (введение), lesson-3-14-1 (роды и дистоция: урогенитальная или неонатология?),
  // lesson-7-35-1 (генетика безбивневости — отдельной статьи нет).
];
