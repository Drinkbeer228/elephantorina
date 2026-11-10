export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  points: number;
}

export type QuizStatus = "idle" | "playing" | "finished";

export interface QuizState {
  status: QuizStatus;
  index: number;
  selected: number | null;
  answers: QuizAnswer[];
  startedAt: number | null;
  finishedAt: number | null;
}

export type QuizAction =
  | { type: "start"; now: number }
  | {
      type: "answer";
      questionId: string;
      optionIndex: number;
      correct: boolean;
      points: number;
    }
  | { type: "next"; now: number; total: number };

export const initialQuizState: QuizState = {
  status: "idle",
  index: 0,
  selected: null,
  answers: [],
  startedAt: null,
  finishedAt: null,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "start":
      return { ...initialQuizState, status: "playing", startedAt: action.now };

    case "answer": {
      if (state.status !== "playing" || state.selected !== null) return state;
      return {
        ...state,
        selected: action.optionIndex,
        answers: [
          ...state.answers,
          {
            questionId: action.questionId,
            selectedIndex: action.optionIndex,
            correct: action.correct,
            points: action.points,
          },
        ],
      };
    }

    case "next": {
      if (state.status !== "playing" || state.selected === null) return state;
      if (state.index + 1 < action.total) {
        return { ...state, index: state.index + 1, selected: null };
      }
      return { ...state, status: "finished", finishedAt: action.now };
    }
  }
}
