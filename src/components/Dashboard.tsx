import { useState, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  BookOpen,
  Microscope,
  ShieldAlert,
  BookmarkCheck,
  CheckCircle2,
  Compass,
  Sliders,
  Trash2,
} from 'lucide-react';
import { Course, UserProgress } from '../types/course';
import {
  computeGlobalStats,
  calculatePlantarBiomechanics,
  evaluateEehvClinicalProtocol,
} from '../utils/courseUtils';
import { DashboardSection } from './Header';

interface DashboardProps {
  courses: Course[];
  progressStore: Record<string, UserProgress>;
  activeSection: DashboardSection;
  onChangeSection: (section: DashboardSection) => void;
  onSelectCourse: (courseId: string, stepId?: string) => void;
  onToggleBookmark: (courseId: string, stepId: string) => void;
}

type DisciplineCluster = 'all' | 'anatomy_vet' | 'ethology_cog' | 'ecology_gen' | 'paleo_evo';

const TRACK_CLUSTER_MAP: Record<string, DisciplineCluster> = {
  'track-1-anatomy': 'anatomy_vet',
  'track-3-veterinary': 'anatomy_vet',
  'track-2-ethology': 'ethology_cog',
  'track-5-cognition': 'ethology_cog',
  'track-6-ecology': 'ecology_gen',
  'track-7-genomics': 'ecology_gen',
  'track-4-evolution': 'paleo_evo',
  'track-8-paleontology': 'paleo_evo',
};

const TRACK_ROMAN_NUMERAL: Record<string, string> = {
  'track-1-anatomy': 'ТОМ I · АНАТОМИЯ И БИОМЕХАНИКА',
  'track-2-ethology': 'ТОМ II · СОЦИАЛЬНАЯ ЭТОЛОГИЯ',
  'track-3-veterinary': 'ТОМ III · КЛИНИЧЕСКАЯ ВЕТЕРИНАРИЯ',
  'track-4-evolution': 'ТОМ IV · ПРИРОДООХРАННАЯ БИОЛОГИЯ',
  'track-5-cognition': 'ТОМ V · КОГНИТИВНАЯ НЕЙРОБИОЛОГИЯ',
  'track-6-ecology': 'ТОМ VI · ЭКОСИСТЕМНАЯ ИНЖЕНЕРИЯ',
  'track-7-genomics': 'ТОМ VII · ПОПУЛЯЦИОННАЯ ГЕНОМИКА',
  'track-8-paleontology': 'ТОМ VIII · ПАЛЕОНТОЛОГИЯ PROBOSCIDEA',
};

const PALEO_STAGES = [
  {
    id: 'eritherium',
    epoch: 'Ранний палеоцен (~60 млн лет назад)',
    taxon: 'Eritherium azouzorum',
    mass: '4–5 кг',
    dentition: 'Бунолофодонтная (первичные бугорки)',
    tusks: 'Отсутствуют (умеренное увеличение резца I₂)',
    habitat: 'Прибрежные фосфатные бассейны Улед-Абдун (Марокко)',
    notes:
      'Древнейший базальный представитель отряда Proboscidea без развитого хобота, близкий к общему предку Paenungulata.',
  },
  {
    id: 'moeritherium',
    epoch: 'Средний и поздний эоцен (~37–35 млн лет назад)',
    taxon: 'Moeritherium trigodon',
    mass: '200–300 кг',
    dentition: 'Билофодонтная (два поперечных эмалевых гребня)',
    tusks: 'Короткие наклонные бивнеподобные резцы I₂',
    habitat: 'Пресноводные эстуарии и болота формации Файюм (Египет)',
    notes:
      'Полуводная экологическая форма с удлиненным туловищем и изотопным профилем δ¹⁸O, подтверждающим питание водной макрофитной флорой.',
  },
  {
    id: 'gomphotherium',
    epoch: 'Ранний и средний миоцен (~18–10 млн лет назад)',
    taxon: 'Gomphotherium / Platybelodon',
    mass: '2 500–4 000 кг',
    dentition: 'Бугорчато-гребенчатая (бунолофодонтная)',
    tusks: 'Четыре бивня (верхние и лопатообразные нижние резцы)',
    habitat: 'Лесостепи и речные долины Афро-Евразии и Северной Америки',
    notes:
      'Выход из Африки по сухопутному мосту Gomphothere Land Bridge после закрытия океана Тетис.',
  },
  {
    id: 'loxodonta',
    epoch: 'Плиоцен – Современность (5 млн лет – н.в.)',
    taxon: 'Loxodonta africana / Elephas maximus',
    mass: '3 000–6 500 кг',
    dentition: 'Гипсодонтная ламеллярная (горизонтальная смена M₁–M₆)',
    tusks: 'Гипертрофированные верхние резцы I₂ с ромбовидной сеткой Шрегера',
    habitat: 'Саванны Субсахарской Африки и тропические леса Азии',
    notes:
      'Сверхразвитый мышечный гидростат хобота (140 000 пучков), 20 копий гена TP53 и сложная матриархальная организация.',
  },
];

export default function Dashboard({
  courses,
  progressStore,
  activeSection,
  onChangeSection,
  onSelectCourse,
  onToggleBookmark,
}: DashboardProps) {
  const [clusterFilter, setClusterFilter] = useState<DisciplineCluster>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [atlasTab, setAtlasTab] = useState<'biomechanics' | 'eehv' | 'paleo'>('biomechanics');

  // Simulator 1 state: Plantar Biomechanics
  const [bodyMassKg, setBodyMassKg] = useState<number>(4800);
  const [strideFactor, setStrideFactor] = useState<number>(1.3);

  // Simulator 2 state: EEHV Viremia & Platelets
  const [viralLoadExp, setViralLoadExp] = useState<number>(3.2);
  const [plateletsCount, setPlateletsCount] = useState<number>(85);

  // Simulator 3 state: Paleontology stage
  const [paleoStageId, setPaleoStageId] = useState<string>('eritherium');

  const stats = useMemo(
    () => computeGlobalStats(courses, progressStore),
    [courses, progressStore]
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCluster =
        clusterFilter === 'all' || TRACK_CLUSTER_MAP[course.id] === clusterFilter;
      if (!matchesCluster) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inCourse =
        course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q);
      const inModules = course.modules.some(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.lessons.some((l) => l.title.toLowerCase().includes(q))
      );
      return inCourse || inModules;
    });
  }, [courses, clusterFilter, searchQuery]);

  const plantarResult = useMemo(
    () => calculatePlantarBiomechanics(bodyMassKg, strideFactor),
    [bodyMassKg, strideFactor]
  );

  const eehvResult = useMemo(
    () => evaluateEehvClinicalProtocol(viralLoadExp, plateletsCount),
    [viralLoadExp, plateletsCount]
  );

  const activePaleoStage =
    PALEO_STAGES.find((s) => s.id === paleoStageId) || PALEO_STAGES[0];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#181A18]">
      {/* Mobile Section Switcher */}
      <div className="md:hidden border-b border-[#E4DFD3] bg-white px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {(
            [
              { id: 'catalog', label: 'Каталог треков' },
              { id: 'atlas', label: 'Интерактивный атлас' },
              { id: 'syllabus', label: 'Учебный план' },
              {
                id: 'bookmarks',
                label:
                  stats.bookmarksCount > 0
                    ? `Закладки (${stats.bookmarksCount})`
                    : 'Закладки',
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#1E4631] text-white'
                  : 'bg-[#F3EFE6] text-[#5C615D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* =====================================================================
            VIEW 1: CATALOG & MONOGRAPH DASHBOARD
        ===================================================================== */}
        {activeSection === 'catalog' && (
          <>
            {/* Hero Section: 2-Column Editorial Split */}
            <section className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-10">
                {/* Left Column: Editorial Typography */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-wider uppercase text-[#1E4631]">
                      <span>Академический корпус элефантологии</span>
                      <span aria-hidden="true">·</span>
                      <span>Тома I–VIII</span>
                    </div>

                    <h1
                      className="font-display text-3xl sm:text-5xl font-bold text-[#181A18] leading-[1.12] tracking-tight"
                      style={{ textWrap: 'balance' }}
                    >
                      Фундаментальная биология, клиника и эволюция хоботных
                    </h1>

                    <p className="text-base sm:text-lg text-[#5C615D] leading-relaxed max-w-2xl">
                      Систематизированное руководство для ветеринарных специалистов, биологов и
                      исследователей: от биомеханики мышечного гидростата, сейсмической триангуляции и
                      протоколов терапии EEHV до онкогеномики TP53/LIF6 и палеонтологии Proboscidea.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onSelectCourse(courses[0].id)}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1E4631] hover:bg-[#153423] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>
                        {stats.completedStepsCount > 0
                          ? 'Продолжить обучение'
                          : 'Начать с Тома I: Анатомия'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeSection('atlas')}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#F3EFE6] hover:bg-[#E4DFD3] border border-[#D8D2C2] text-[#181A18] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-[#1E4631]" />
                      <span>Открыть био-симулятор и атлас</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Archival Monograph Plate */}
                <figure className="lg:col-span-5 flex flex-col justify-between bg-[#F3EFE6] border border-[#D8D2C2] rounded-xl overflow-hidden">
                  <div className="relative flex-1 min-h-[240px] bg-[#EAE4D6] overflow-hidden">
                    <img
                      src="/src/assets/images/hero_elephant_monograph_1793911937295.jpg"
                      alt="Loxodonta africana — матриарх в саванне Амбосели, архивная фотография монографии"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center scale-[1.18]"
                    />
                  </div>
                  <figcaption className="px-4 py-3 bg-[#F3EFE6] border-t border-[#D8D2C2] text-xs text-[#5C615D] flex items-center justify-between gap-2">
                    <span className="font-display italic text-sm text-[#181A18]">
                      Табл. I — Loxodonta africana (Амбосели, Кения)
                    </span>
                    <span className="font-mono-code text-[11px] shrink-0">ARCHIVE PLATE 01</span>
                  </figcaption>
                </figure>
              </div>

              {/* Full-Width 4-Column Academic Telemetry Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-[#E4DFD3] rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-[#E4DFD3]">
                <div className="p-5">
                  <p className="text-xs font-medium text-[#5C615D]">Учебные тома (Треки)</p>
                  <p className="font-display text-3xl font-bold text-[#181A18] mt-1 tabular-nums">
                    0{stats.totalTracks}
                  </p>
                  <p className="text-xs text-[#5C615D] mt-1">
                    От анатомии до палеогеномики
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-[#5C615D]">Профильные модули</p>
                  <p className="font-display text-3xl font-bold text-[#181A18] mt-1 tabular-nums">
                    {stats.totalModules}
                  </p>
                  <p className="text-xs text-[#5C615D] mt-1">
                    Теория, глоссарии и клинические кейсы
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-[#5C615D]">Освоение корпуса</p>
                  <p className="font-display text-3xl font-bold text-[#1E4631] mt-1 tabular-nums">
                    {stats.completedStepsCount} / {stats.totalSteps}
                  </p>
                  <p className="text-xs text-[#5C615D] mt-1 tabular-nums">
                    Пройдено {stats.overallPercent}% учебных шагов
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-[#5C615D]">Академический рейтинг</p>
                  <p className="font-display text-3xl font-bold text-[#9A4B26] mt-1 tabular-nums">
                    {stats.totalScore}
                  </p>
                  <p className="text-xs text-[#5C615D] mt-1 tabular-nums">
                    Сохранено закладок: {stats.bookmarksCount}
                  </p>
                </div>
              </div>
            </section>

            {/* Catalog Section with Filter Controls & Search */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4DFD3] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1E4631]">
                    Систематический каталог
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181A18] mt-1">
                    Учебные треки и исследовательские модули
                  </h2>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#5C615D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по модулям (EEHV, TP53, хобот)..."
                    aria-label="Поиск по трекам и модулям"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#D8D2C2] rounded-lg text-xs sm:text-sm text-[#181A18] placeholder:text-[#7A7F7A]"
                  />
                </div>
              </div>

              {/* Interactive Discipline Filter Tabs */}
              <div
                role="tablist"
                aria-label="Фильтр по научным дисциплинам"
                className="flex items-center gap-1.5 p-1 bg-[#F3EFE6] border border-[#E4DFD3] rounded-xl overflow-x-auto no-scrollbar w-fit max-w-full"
              >
                {(
                  [
                    { id: 'all', label: 'Все дисциплины (8)' },
                    { id: 'anatomy_vet', label: 'Анатомия и медицина (2)' },
                    { id: 'ethology_cog', label: 'Этология и когнитивистика (2)' },
                    { id: 'ecology_gen', label: 'Экология и геномика (2)' },
                    { id: 'paleo_evo', label: 'Эволюция и палеонтология (2)' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={clusterFilter === tab.id}
                    onClick={() => setClusterFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      clusterFilter === tab.id
                        ? 'bg-white text-[#181A18] shadow-2xs border border-[#D8D2C2]'
                        : 'text-[#5C615D] hover:text-[#181A18]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Track Cards Grid */}
              {filteredCourses.length === 0 ? (
                <div className="bg-white border border-[#E4DFD3] rounded-2xl p-10 text-center space-y-3">
                  <p className="font-display text-xl font-bold text-[#181A18]">
                    По запросу «{searchQuery}» модулей не найдено
                  </p>
                  <p className="text-sm text-[#5C615D]">
                    Попробуйте изменить поисковый запрос или сбросить фильтр дисциплин.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setClusterFilter('all');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#1E4631] text-white text-xs font-semibold cursor-pointer"
                  >
                    Показать все 8 треков
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => {
                    const progress = progressStore[course.id];
                    const allSteps = course.modules.flatMap((m) =>
                      m.lessons.flatMap((l) => l.steps)
                    );
                    const completedCount = allSteps.filter((s) =>
                      progress?.completedSteps.includes(s.id)
                    ).length;
                    const totalSteps = allSteps.length;
                    const progressPercent =
                      totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
                    const previewModules = course.modules.slice(0, 3);
                    const remainingModulesCount = Math.max(
                      0,
                      course.modules.length - previewModules.length
                    );

                    return (
                      <article
                        key={course.id}
                        className="bg-white rounded-2xl border border-[#E4DFD3] hover:border-[#1E4631]/60 p-6 sm:p-7 flex flex-col justify-between transition-colors"
                      >
                        <div className="space-y-4">
                          {/* Unboxed Editorial Metadata Header (Zero-Pill Discipline) */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C615D] border-b border-[#E4DFD3] pb-3">
                            <span className="font-semibold text-[#1E4631] tracking-wider uppercase">
                              {TRACK_ROMAN_NUMERAL[course.id] || 'АКАДЕМИЧЕСКИЙ ТРЕК'}
                            </span>
                            <div className="flex items-center gap-1.5 tabular-nums">
                              <span>{course.modules.length} мод.</span>
                              <span aria-hidden="true">·</span>
                              <span>{totalSteps} шагов</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-[#181A18]">
                                {progressPercent}%
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-display text-2xl font-bold text-[#181A18] leading-snug">
                              {course.title}
                            </h3>
                            <p className="text-sm text-[#5C615D] mt-2 leading-relaxed">
                              {course.description}
                            </p>
                          </div>

                          {/* Direct Module Jump List */}
                          <div className="pt-2 space-y-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F7A]">
                              Ключевые разделы тома:
                            </p>
                            <div className="divide-y divide-[#E4DFD3]/70 border-t border-b border-[#E4DFD3]">
                              {previewModules.map((mod, mIdx) => {
                                const firstStepId = mod.lessons[0]?.steps[0]?.id;
                                const modSteps = mod.lessons.flatMap((l) => l.steps);
                                const isModDone =
                                  modSteps.length > 0 &&
                                  modSteps.every((s) =>
                                    progress?.completedSteps.includes(s.id)
                                  );

                                return (
                                  <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => onSelectCourse(course.id, firstStepId)}
                                    className="w-full py-2 flex items-center justify-between gap-3 text-left text-xs hover:text-[#1E4631] transition-colors group cursor-pointer"
                                  >
                                    <span className="truncate text-[#2C302D] group-hover:text-[#1E4631] font-medium">
                                      <span className="font-mono-code text-[11px] text-[#7A7F7A] mr-2">
                                        {String(mIdx + 1).padStart(2, '0')}.
                                      </span>
                                      {mod.title}
                                    </span>
                                    <span className="text-[11px] font-mono-code text-[#5C615D] shrink-0">
                                      {isModDone ? '✓ Изучено' : 'Открыть →'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            {remainingModulesCount > 0 && (
                              <p className="text-xs text-[#5C615D] pt-1">
                                + ещё {remainingModulesCount} профильных модулей в составе трека
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 space-y-4">
                          {/* Hairline Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-[#5C615D]">Статус прохождения</span>
                              <span className="font-mono-code font-semibold text-[#1E4631] tabular-nums">
                                {completedCount} из {totalSteps} шагов ({progressPercent}%)
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#F3EFE6] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1E4631] transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectCourse(course.id)}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E4631] hover:bg-[#153423] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                          >
                            <span>
                              {completedCount > 0
                                ? 'Продолжить изучение трека'
                                : 'Перейти к изучению трека'}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* =====================================================================
            VIEW 2: INTERACTIVE ANATOMICAL & PHYSIOLOGICAL ATLAS / SIMULATOR
        ===================================================================== */}
        {activeSection === 'atlas' && (
          <section className="space-y-8 animate-in">
            <div className="border-b border-[#E4DFD3] pb-6 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wider text-[#1E4631]">
                  <span>Интерактивная лаборатория и атлас</span>
                  <span aria-hidden="true">·</span>
                  <span>Биомеханика · Клиника EEHV · Палеонтология</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#181A18] mt-1">
                  Анатомо-физиологический атлас и симулятор
                </h1>
              </div>

              {/* Lab Mode Switcher */}
              <div className="inline-flex flex-wrap items-center gap-1.5 p-1 bg-[#F3EFE6] border border-[#E4DFD3] rounded-xl">
                <button
                  type="button"
                  onClick={() => setAtlasTab('biomechanics')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    atlasTab === 'biomechanics'
                      ? 'bg-white text-[#181A18] border border-[#D8D2C2]'
                      : 'text-[#5C615D] hover:text-[#181A18]'
                  }`}
                >
                  01. Подиатрия и гидростат
                </button>
                <button
                  type="button"
                  onClick={() => setAtlasTab('eehv')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    atlasTab === 'eehv'
                      ? 'bg-white text-[#181A18] border border-[#D8D2C2]'
                      : 'text-[#5C615D] hover:text-[#181A18]'
                  }`}
                >
                  02. Калькулятор виремии EEHV
                </button>
                <button
                  type="button"
                  onClick={() => setAtlasTab('paleo')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    atlasTab === 'paleo'
                      ? 'bg-white text-[#181A18] border border-[#D8D2C2]'
                      : 'text-[#5C615D] hover:text-[#181A18]'
                  }`}
                >
                  03. Эволюция Proboscidea
                </button>
              </div>
            </div>

            {/* TAB 1: BIOMECHANICS & DIGITAL CUSHION SIMULATOR */}
            {atlasTab === 'biomechanics' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Stage (7 cols): Archival Anatomical Plate + Live Pressure Graph */}
                <div className="lg:col-span-7 space-y-6">
                  <figure className="bg-white border border-[#E4DFD3] rounded-2xl overflow-hidden">
                    <div className="bg-[#F3EFE6] aspect-video relative">
                      <img
                        src="/src/assets/images/anatomy_hydrostat_atlas_1793911939471.jpg"
                        alt="Анатомический разрез мышечного гидростата хобота и жировой дигитальной подушки стопы слона"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="p-4 bg-[#FBF9F5] border-t border-[#E4DFD3] text-xs text-[#5C615D] flex items-center justify-between">
                      <span>
                        Табл. II — Поперечный срез хобота (140 000 фасцикул) и сагиттальный срез стопы (Digital Cushion)
                      </span>
                      <span className="font-mono-code">PLATE II</span>
                    </figcaption>
                  </figure>

                  {/* Live SVG Plantar Pressure Distribution Curve */}
                  <div className="bg-white border border-[#E4DFD3] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#181A18]">
                          Профиль гашения ударной нагрузки дигитальной подушкой
                        </h3>
                        <p className="text-xs text-[#5C615D]">
                          Зависимость пикового давления (кПа) от массы особи и фазы опоры
                        </p>
                      </div>
                      <span
                        className={`font-mono-code text-xs font-bold px-2.5 py-1 rounded border whitespace-nowrap shrink-0 ${
                          plantarResult.status === 'NOMINAL'
                            ? 'bg-[#F4F8F5] border-[#B8D1C1] text-[#1E4631]'
                            : plantarResult.status === 'ELEVATED'
                              ? 'bg-[#F9F4EE] border-[#E0C8B0] text-[#9A4B26]'
                              : 'bg-[#FDF4F3] border-[#E4BDBC] text-[#9E2A2B]'
                        }`}
                      >
                        {plantarResult.status === 'NOMINAL'
                          ? '● НОРМАЛЬНАЯ НАГРУЗКА'
                          : plantarResult.status === 'ELEVATED'
                            ? '▲ ПОВЫШЕННАЯ НАГРУЗКА'
                            : '■ РИСК БАРОТРАВМЫ ПОДОШВЫ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E4DFD3]">
                        <p className="text-xs text-[#5C615D]">Пиковое давление</p>
                        <p className="font-mono-code text-xl font-bold text-[#181A18] mt-1 tabular-nums">
                          {plantarResult.peakPressureKpa} кПа
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E4DFD3]">
                        <p className="text-xs text-[#5C615D]">Расширение подушки</p>
                        <p className="font-mono-code text-xl font-bold text-[#1E4631] mt-1 tabular-nums">
                          +{plantarResult.cushionExpansionPercent}%
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E4DFD3]">
                        <p className="text-xs text-[#5C615D]">Венозная помпа / шаг</p>
                        <p className="font-mono-code text-xl font-bold text-[#9A4B26] mt-1 tabular-nums">
                          {plantarResult.venousReturnMl} мл
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Control Deck (5 cols) */}
                <div className="lg:col-span-5 bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-8 space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1E4631]">
                      Параметры биомеханической модели
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#181A18] mt-1">
                      Гидравлика стопы и венозный возврат
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <label htmlFor="slider-mass" className="text-[#181A18]">
                          Масса тела особи (кг):
                        </label>
                        <span className="font-mono-code text-[#1E4631] tabular-nums">
                          {bodyMassKg} кг
                        </span>
                      </div>
                      <input
                        id="slider-mass"
                        type="range"
                        min={1500}
                        max={6500}
                        step={100}
                        value={bodyMassKg}
                        onChange={(e) => setBodyMassKg(Number(e.target.value))}
                        className="w-full accent-[#1E4631] cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-[#7A7F7A] font-mono-code mt-1">
                        <span>1 500 кг (Подросток)</span>
                        <span>4 000 кг (Самка)</span>
                        <span>6 500 кг (Самец)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <label htmlFor="slider-stride" className="text-[#181A18]">
                          Коэффициент динамической опоры (аллюр):
                        </label>
                        <span className="font-mono-code text-[#9A4B26] tabular-nums">
                          {strideFactor.toFixed(1)}×
                        </span>
                      </div>
                      <input
                        id="slider-stride"
                        type="range"
                        min={1.0}
                        max={2.0}
                        step={0.1}
                        value={strideFactor}
                        onChange={(e) => setStrideFactor(Number(e.target.value))}
                        className="w-full accent-[#1E4631] cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-[#7A7F7A] font-mono-code mt-1">
                        <span>1.0× Статика</span>
                        <span>1.4× Обычный шаг</span>
                        <span>2.0× Быстрый марш</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DFD3] space-y-2 text-xs text-[#2C302D] leading-relaxed">
                    <p className="font-bold text-[#181A18]">
                      Клиническое значение (Правило 15–22 мм):
                    </p>
                    <p>
                      Вены конечностей слона лишены клапанов: возврат венозной крови ({plantarResult.venousReturnMl} мл за шаг) обеспечивается компрессией жировой подушки. При ортопедической расчистке запрещено истончать роговую подошву тоньше 15–22 мм.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCourse('track-1-anatomy', 'step-2-1-1')}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E4631] hover:bg-[#153423] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <span>Перейти к уроку: Подиатрия и биомеханика стопы</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EEHV CLINICAL CALCULATOR */}
            {atlasTab === 'eehv' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-8 space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9A4B26]">
                      Гематологический и ПЦР-скрининг
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#181A18] mt-1">
                      Калькулятор терапевтического окна EEHV-HD
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C615D] mt-1">
                      Смоделируйте показатели крови слоненка (1–8 лет) для определения ургентного протокола.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <label htmlFor="slider-qpcr" className="text-[#181A18]">
                          Вирусная нагрузка qPCR (log₁₀ копий/мкл):
                        </label>
                        <span className="font-mono-code text-[#1E4631] tabular-nums">
                          10^{viralLoadExp.toFixed(1)} копий/мкл
                        </span>
                      </div>
                      <input
                        id="slider-qpcr"
                        type="range"
                        min={1.0}
                        max={6.0}
                        step={0.2}
                        value={viralLoadExp}
                        onChange={(e) => setViralLoadExp(Number(e.target.value))}
                        className="w-full accent-[#1E4631] cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-[#7A7F7A] font-mono-code mt-1">
                        <span>10¹ (Латентно)</span>
                        <span>10³ (Порог старта)</span>
                        <span>10⁶ (Острый лизис)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <label htmlFor="slider-platelets" className="text-[#181A18]">
                          Уровень тромбоцитов (× 10⁹/л):
                        </label>
                        <span className="font-mono-code text-[#9A4B26] tabular-nums">
                          {plateletsCount} × 10⁹/л
                        </span>
                      </div>
                      <input
                        id="slider-platelets"
                        type="range"
                        min={10}
                        max={300}
                        step={5}
                        value={plateletsCount}
                        onChange={(e) => setPlateletsCount(Number(e.target.value))}
                        className="w-full accent-[#1E4631] cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-[#7A7F7A] font-mono-code mt-1">
                        <span>10 (Терминальный ДВС)</span>
                        <span>100 (Продром)</span>
                        <span>300 (Норма)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E4DFD3] pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C615D]">
                      Заключение клинического алгоритма
                    </span>
                    <span
                      className={`font-mono-code text-xs font-bold px-2.5 py-1 rounded border whitespace-nowrap shrink-0 ${
                        eehvResult.severity === 'NOMINAL'
                          ? 'bg-[#F4F8F5] border-[#B8D1C1] text-[#1E4631]'
                          : eehvResult.severity === 'URGENT'
                            ? 'bg-[#F9F4EE] border-[#E0C8B0] text-[#9A4B26]'
                            : 'bg-[#FDF4F3] border-[#E4BDBC] text-[#9E2A2B]'
                      }`}
                    >
                      {eehvResult.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#5C615D]">
                      Рекомендованный ветеринарный протокол:
                    </p>
                    <p className="text-sm sm:text-base font-medium text-[#181A18] leading-relaxed">
                      {eehvResult.protocol}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DFD3] flex items-center justify-between">
                    <span className="text-xs text-[#5C615D]">Оценка выживаемости:</span>
                    <span className="font-mono-code text-xs font-bold text-[#1E4631]">
                      {eehvResult.survivalEstimate}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCourse('track-3-veterinary', 'step-3-3-1-1')}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E4631] hover:bg-[#153423] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <span>Открыть Трек III: Диагностика и терапия EEHV</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PALEONTOLOGY EVOLUTIONARY RADIATION */}
            {atlasTab === 'paleo' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <figure className="lg:col-span-7 bg-white border border-[#E4DFD3] rounded-2xl overflow-hidden">
                  <div className="bg-[#F3EFE6] aspect-4/3 relative">
                    <img
                      src="/src/assets/images/paleo_proboscidea_evolution_1793911939605.jpg"
                      alt="Эволюционная радиация Proboscidea: морфология черепа и моляров от Moeritherium до Loxodonta"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="p-4 bg-[#FBF9F5] border-t border-[#E4DFD3] text-xs text-[#5C615D] flex items-center justify-between">
                    <span>
                      Табл. XV — Эволюционная серия черепов и коронок моляров (От эоцена до голоцена)
                    </span>
                    <span className="font-mono-code">PLATE XV</span>
                  </figcaption>
                </figure>

                <div className="lg:col-span-5 bg-white border border-[#E4DFD3] rounded-2xl p-6 sm:p-8 space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1E4631]">
                      Хронологическая шкала (60 млн лет)
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#181A18] mt-1">
                      Этапы эволюции Proboscidea
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {PALEO_STAGES.map((stage, idx) => (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setPaleoStageId(stage.id)}
                        className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          paleoStageId === stage.id
                            ? 'bg-[#1E4631] text-white border-[#1E4631]'
                            : 'bg-[#FBF9F5] text-[#181A18] border-[#E4DFD3] hover:bg-[#F3EFE6]'
                        }`}
                      >
                        <span className="block font-mono-code text-[11px] opacity-75">
                          ЭТАП 0{idx + 1}
                        </span>
                        <span className="block font-display text-base font-bold italic truncate mt-0.5">
                          {stage.taxon.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-5 rounded-xl bg-[#FBF9F5] border border-[#E4DFD3] space-y-3 text-sm">
                    <div className="border-b border-[#E4DFD3] pb-2">
                      <p className="text-xs text-[#5C615D]">{activePaleoStage.epoch}</p>
                      <p className="font-display text-2xl font-bold italic text-[#1E4631]">
                        {activePaleoStage.taxon}
                      </p>
                    </div>
                    <dl className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#5C615D]">Масса тела:</dt>
                        <dd className="font-mono-code font-semibold text-[#181A18]">
                          {activePaleoStage.mass}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#5C615D]">Морфология моляров:</dt>
                        <dd className="font-medium text-[#181A18] mt-0.5">
                          {activePaleoStage.dentition}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#5C615D]">Развитие резцов (I₂):</dt>
                        <dd className="font-medium text-[#181A18] mt-0.5">
                          {activePaleoStage.tusks}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-xs text-[#5C615D] pt-2 border-t border-[#E4DFD3] leading-relaxed">
                      {activePaleoStage.notes}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectCourse('track-8-paleontology', 'step-8-37-1-1')
                    }
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E4631] hover:bg-[#153423] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <span>Изучить Трек VIII: Палеонтология Proboscidea</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            VIEW 3: FULL ACADEMIC SYLLABUS INDEX
        ===================================================================== */}
        {activeSection === 'syllabus' && (
          <section className="space-y-8 animate-in">
            <div className="border-b border-[#E4DFD3] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1E4631]">
                  Полный реестр образовательной программы
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#181A18] mt-1">
                  Академический учебный план ({stats.totalModules} модулей · {stats.totalSteps} шагов)
                </h1>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#5C615D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Быстрый фильтр по учебному плану..."
                  aria-label="Фильтр по учебному плану"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#D8D2C2] rounded-lg text-xs sm:text-sm text-[#181A18]"
                />
              </div>
            </div>

            <div className="space-y-6">
              {courses.map((course) => {
                const prog = progressStore[course.id];
                const matchingModules = course.modules.filter((m) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    course.title.toLowerCase().includes(q) ||
                    m.title.toLowerCase().includes(q) ||
                    m.lessons.some((l) => l.title.toLowerCase().includes(q))
                  );
                });

                if (matchingModules.length === 0) return null;

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-[#E4DFD3] rounded-2xl overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 bg-[#F3EFE6]/70 border-b border-[#E4DFD3] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1E4631]">
                          {TRACK_ROMAN_NUMERAL[course.id]}
                        </span>
                        <h2 className="font-display text-2xl font-bold text-[#181A18] mt-0.5">
                          {course.title}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectCourse(course.id)}
                        className="px-4 py-2 rounded-lg bg-[#1E4631] hover:bg-[#153423] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Открыть трек →
                      </button>
                    </div>

                    <div className="divide-y divide-[#E4DFD3]">
                      {matchingModules.map((mod, mIdx) => {
                        const modSteps = mod.lessons.flatMap((l) => l.steps);
                        const completedInMod = modSteps.filter((s) =>
                          prog?.completedSteps.includes(s.id)
                        ).length;
                        const firstStepId = mod.lessons[0]?.steps[0]?.id;

                        return (
                          <div
                            key={mod.id}
                            className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FBF9F5] transition-colors"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-[#181A18]">
                                <span className="font-mono-code text-xs text-[#1E4631] mr-2">
                                  Модуль {String(mIdx + 1).padStart(2, '0')}
                                </span>
                                {mod.title}
                              </p>
                              <p className="text-xs text-[#5C615D]">
                                {mod.lessons.map((l) => l.title).join(' · ')}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <span className="font-mono-code text-xs text-[#5C615D] tabular-nums">
                                {completedInMod}/{modSteps.length} шагов
                              </span>
                              <button
                                type="button"
                                onClick={() => onSelectCourse(course.id, firstStepId)}
                                className="px-3.5 py-1.5 rounded-lg border border-[#D8D2C2] bg-white hover:bg-[#F3EFE6] text-xs font-semibold text-[#181A18] transition-colors cursor-pointer"
                              >
                                Перейти к модулю
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =====================================================================
            VIEW 4: SAVED BOOKMARKS & RESEARCH NOTES
        ===================================================================== */}
        {activeSection === 'bookmarks' && (
          <section className="space-y-8 animate-in">
            <div className="border-b border-[#E4DFD3] pb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9A4B26]">
                Персональная исследовательская картотека
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#181A18] mt-1">
                Сохраненные закладки ({stats.bookmarksCount})
              </h1>
            </div>

            {stats.bookmarkedEntries.length === 0 ? (
              <div className="bg-white border border-[#E4DFD3] rounded-2xl p-10 text-center max-w-2xl mx-auto space-y-4">
                <BookmarkCheck className="w-8 h-8 text-[#9A4B26] mx-auto" />
                <h2 className="font-display text-2xl font-bold text-[#181A18]">
                  В вашей картотеке пока нет сохраненных шагов
                </h2>
                <p className="text-sm text-[#5C615D] leading-relaxed">
                  Во время чтения теоретических монографий, клинических протоколов или прохождения
                  симуляторов нажмите кнопку «Сохранить в закладки», чтобы зафиксировать материал
                  здесь для быстрого доступа.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onChangeSection('catalog')}
                    className="px-5 py-2.5 rounded-xl bg-[#1E4631] text-white text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    Перейти к каталогу треков
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stats.bookmarkedEntries.map((item) => (
                  <article
                    key={`${item.courseId}-${item.step.id}`}
                    className="bg-white border border-[#E4DFD3] rounded-2xl p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#5C615D]">
                        <span className="font-semibold text-[#1E4631] truncate">
                          {item.courseTitle}
                        </span>
                        <span className="font-mono-code text-[11px] shrink-0">
                          {item.step.type}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#181A18]">
                        {item.step.title}
                      </h3>
                      <p className="text-xs text-[#5C615D]">{item.moduleTitle}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E4DFD3] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(item.courseId, item.step.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9E2A2B] hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить из закладок</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectCourse(item.courseId, item.step.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E4631] hover:bg-[#153423] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Открыть материал</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="border-t border-[#E4DFD3] bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C615D]">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-bold text-[#181A18]">
              Слонология.EDU
            </span>
            <span aria-hidden="true">·</span>
            <span>Академическая образовательная платформа по биологии и медицине хоботных</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onChangeSection('catalog')}
              className="hover:text-[#181A18] cursor-pointer"
            >
              Каталог
            </button>
            <button
              type="button"
              onClick={() => onChangeSection('atlas')}
              className="hover:text-[#181A18] cursor-pointer"
            >
              Атлас
            </button>
            <button
              type="button"
              onClick={() => onChangeSection('syllabus')}
              className="hover:text-[#181A18] cursor-pointer"
            >
              Учебный план
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
