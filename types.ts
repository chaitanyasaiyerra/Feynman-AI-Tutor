export enum AppState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING', // Generating checkpoints
  LEARNING = 'LEARNING', // Reading content
  QUIZ_GENERATION = 'QUIZ_GENERATION', // Creating questions
  QUIZ = 'QUIZ', // Taking the quiz
  EVALUATING = 'EVALUATING', // Checking answers
  FEYNMAN = 'FEYNMAN', // Simplification mode
  COMPLETE = 'COMPLETE' // All checkpoints done
}

export interface Checkpoint {
  id: number;
  title: string;
  objective: string;
  status: 'pending' | 'current' | 'completed' | 'locked';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number; // Hidden from user during quiz
}

export interface QuizResult {
  score: number; // 0-100
  passed: boolean;
  feedback: string;
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface LearningContext {
  topic: string;
  userNotes: string;
  checkpoints: Checkpoint[];
  currentCheckpointIndex: number;
  currentContent: string;
  currentSources: WebSource[];
  currentQuiz: QuizQuestion[];
  history: string[]; // Track what has been learned
}