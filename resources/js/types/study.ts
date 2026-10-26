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
        | 'unavailable';
    body?: string;
    name?: string;
    url?: string | null;
    rows?: string[][];
    target?: StudyContent;
}
