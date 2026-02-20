
export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
}

export interface ReadingProgress {
  [bookId: string]: number[]; // Array of chapter numbers read
}

export interface UserProgress {
  id: string;
  name: string;
  avatar: string;
  progress: ReadingProgress;
}

export interface DailyEncouragement {
  verse: string;
  reference: string;
  message: string;
}

export interface PlanDay {
  day: number;
  title: string;
  videoUrl?: string;
  readings: {
    bookId: string;
    bookName: string;
    chapters: number[];
  }[];
}
