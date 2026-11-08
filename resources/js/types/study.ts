export interface StudyProgress {
    readCount: number;
    totalCount: number;
    percentage: number;
}

export interface StudyLesson extends StudyProgress {
    id: number;
    name: string;
}

export interface StudySection {
    id: number;
    name: string;
    depth: number;
    lessons: StudyLesson[];
}

export interface StudySpace extends StudyProgress {
    id: number;
    name: string;
    courseTitle: string;
    plans: string[];
    lastVisitedAt: string | null;
    resumeLessonId: number | null;
    sections: StudySection[];
    quizzes: {
        id: number;
        title: string;
        contentId: number | null;
        final: boolean;
        limit: number | null;
        canStart: boolean;
        attempts: {
            id: number;
            startedAt: string | null;
            finished: boolean;
            score: string | null;
        }[];
    }[];
}

export interface StudyContent {
    id: number;
    description: string;
    type:
        | 'text'
        | 'image'
        | 'video'
        | 'file'
        | 'table'
        | 'remind'
        | 'quiz'
        | 'homework'
        | 'exercise'
        | 'deck'
        | 'locked'
        | 'unavailable';
    requirementAlternatives?: {
        spaceId: number;
        spaceName: string;
        courseTitle: string;
        score: number;
        quizId: number;
        canStart: boolean;
    }[][];
    body?: string;
    name?: string;
    cards?: { id: number; question: string; answer: string }[];
    personalDecks?: { id: number; name: string }[];
    url?: string | null;
    rows?: string[][];
    target?: StudyContent;
    sourceCourse?: string;
    sourceLesson?: string;
    sourceUrl?: string | null;
    sourceAccessible?: boolean;
    quizId?: number;
    latestScore?: string | null;
    extensions?: string[];
    submission?: {
        approved: boolean;
        score: number | null;
        note: string | null;
        files: string[];
    } | null;
    answer?: string | null;
    answerVideoUrl?: string | null;
}
