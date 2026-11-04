# Elephantology.EDU: Tactile Bio-Minimalism Redesign & Architecture Upgrade

An advanced educational PWA platform redesign featuring Stepik-style lesson navigation, collapsible sidebar module manager, Tactile Bio-Minimalism aesthetic (warm stone background, deep sage and terracotta accents), and rich interactive step types (`TheoryStep` with semantic callouts, `ScenarioStep` with behavioral cues, 3D flip `FlashcardStep`, and `QuizStep` with confetti celebrations).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your preferences, the following design and architectural choices have been confirmed and incorporated into this plan:
> - **Visual Palette**: Tactile Bio-Minimalism with warm stone background (`#F8F7F4`), deep sage accents (`#2E5A44`), terracotta cues (`#C86D51`), and crisp white structural surfaces (`#FFFFFF`) with hairline borders (`#E6E4DD`).
> - **Navigation Layout**: Collapsible sidebar for modules and lessons alongside a Stepik-style horizontal step indicator bar (`LessonHeader`).
> - **Interactive Feedback**: 3D flip card animations for flashcards, interactive scenario branching with immediate bio-feedback, and celebratory confetti upon completing quizzes and lessons.

- **Confirmed Decision 1**: Persistent client state via `localStorage` for all progress, quiz answers, scenario choices, and bookmarks.
- **Open Question / Choice 2**: None remaining; ready for execution upon approval.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the elephant biology educational platform into an editorial-grade, tactile learning experience inspired by Stepik and Notion.
- **Target Audience / Persona**: Students, researchers, and animal care professionals studying elephant anatomy, physiology, cognitive behavior, and environmental enrichment.
- **Key Value**: Clean, distraction-free typography, intuitive Stepik-style lesson progression, structured biological callout blocks (`bio-note`, `behavior-cue`, `enrichment-idea`), and tactile interactive components.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Dashboard*: Overview of courses, modules, progress bars, bookmarks, and quick resume.
  2. *Lesson & Module Sidebar*: Collapsible tree view showing modules, lessons, and completion states.
  3. *StepViewer*: Focused container (`max-w-3xl mx-auto`) with horizontal step pins (`LessonHeader`), step switcher, and previous/next navigation with keyboard shortcuts.
  4. *Step Components*:
     - `TheoryStep`: Structured typography with semantic callout boxes (`bio-note`, `behavior-cue`, `enrichment-idea`).
     - `ScenarioStep`: Observation context card followed by decision options with instant pedagogical feedback.
     - `FlashcardStep`: 3D card flip interaction with tactile hover states.
     - `QuizStep`: Multiple choice questions with instant validation and confetti on correct answers.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Tactile Bio-Minimalism (editorial, calm, organic, high-contrast legibility).
  - *Color Palette*: Dominant background `#F8F7F4`, cards `#FFFFFF`, border `#E6E4DD`, primary text `#1C1E1F`, secondary text `#606462`, sage accent `#2E5A44`, terracotta accent `#C86D51`.
  - *Typography*: Inter font family with strict tabular numerals and clean hierarchy.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Client-Side Persistence via `localStorage`.
  - *Chosen Approach*: Save course progress, completed steps, quiz answers, and bookmarks directly in `localStorage`.
  - *Why*: Ensures seamless offline capability and instant persistence without requiring an external backend database for single-user exploration.
- **Decision 2**: Stepik-Style Horizontal Step Pins (`LessonHeader`) + Collapsible Sidebar.
  - *Chosen Approach*: Combine a collapsible module/lesson tree drawer with a persistent step-pin progress ribbon at the top of the lesson view.
  - *Why*: Provides both macro navigation (which lesson am I in?) and micro navigation (which step of the lesson am I on?).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  (State Store, Course Management, LocalStorage Sync)   │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
        ┌───────▼───────┐        ┌───────▼────────┐
        │ Dashboard.tsx │        │  Sidebar.tsx   │
        └───────────────┘        └───────┬────────┘
                                         │
                                 ┌───────▼────────┐
                                 │LessonHeader.tsx│
                                 └───────┬────────┘
                                         │
                                 ┌───────▼────────┐
                                 │StepViewer.tsx  │
                                 └───────┬────────┘
                                         │
         ┌───────────────┬───────────────┼───────────────┐
         │               │               │               │
┌────────▼────────┐ ┌────▼──────────┐ ┌──▼──────────┐ ┌──▼──────────┐
│  TheoryStep.tsx │ │ScenarioStep.tsx│ │FlashcardStep│ │ QuizStep.tsx│
└─────────────────┘ └───────────────┘ └─────────────┘ └─────────────┘
```

- **Data Models**:
  - `Course` -> `Module` -> `Lesson` -> `Step` (Theory, Quiz, Scenario, Flashcard).
  - `UserProgress`: `completedSteps`, `currentStepId`, `score`, `bookmarks`, `quizAnswers`, `scenarioAnswers`.
- **Interactive State Mapping**:
  - Step selection updates `currentStepId` in `localStorage`.
  - Completing a step increments score (+10) and adds step ID to `completedSteps`, triggering progress recalculation.
  - Flashcard flip toggles local card `isFlipped` state with CSS 3D transform (`perspective-1000` + `rotate-y-180`).
  - Quizzes and lesson completion trigger `canvas-confetti` animations.
