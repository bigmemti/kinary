export type CourseEditorTab = 'information' | 'spaces' | 'content';

export type CourseTeacherRole =
    | 'owner'
    | 'instructor'
    | 'assistant'
    | 'reviewer'
    | 'editor';

export interface CourseEditorCourse {
    id: number;
    title: string;
    is_published: boolean;
}

export interface CourseEditorOverview {
    slug: string;
    description: string | null;
    thumbnail: string | null;
    intro_video_url: string | null;
    sections_count: number;
    spaces_count: number;
    permissions: {
        update_information: boolean;
        publish: boolean;
        manage_teachers: boolean;
        manage_commerce: boolean;
        update_structure: boolean;
        delete_structure: boolean;
    };
    has_owner: boolean;
    available_teachers: { id: number; name: string }[];
    teachers: {
        id: number;
        name: string;
        role: CourseTeacherRole;
        created_at: string | null;
        updated_at: string | null;
    }[];
    sections: CourseEditorSection[];
    spaces: CourseEditorSpace[];
    available_quizzes: { id: number; score: number; time: string }[];
}

export type CourseEditorSaveStatus =
    | 'idle'
    | 'dirty'
    | 'saving'
    | 'saved'
    | 'error';

export interface CourseEditorSection {
    id: number;
    name: string;
    order: number;
    lessons: CourseEditorLesson[];
}

export interface CourseEditorLesson {
    id: number;
    name: string;
    order: number;
    contents: CourseEditorContent[];
    thumbnail: string | null;
    thumbnail_url: string | null;
    images: { path: string; url: string }[];
    pricings: { plan_id: number; price: number }[];
}

export interface CourseEditorSpace {
    id: number;
    name: string;
    quiz_id: number | null;
    delete_block_reason: string | null;
    plans: CourseEditorPlan[];
}

export interface CourseEditorPlan {
    id: number;
    name: string;
    price: number;
    order: number;
    enrollments_count: number;
    orders_count: number;
    delete_block_reason: string | null;
}

export interface CourseEditorContent {
    id: number;
    description: string | null;
    order: number;
    type: 'text' | 'image' | 'video' | 'file' | 'table' | 'remind' | 'unknown';
    body: string | null;
    name: string | null;
    url: string | null;
    table: string[][] | null;
    remind_content_id: number | null;
    accesses: {
        plan_id: number;
        requirements: { space_id: number; score: number }[];
    }[];
    delete_block_reason: string | null;
}

export type CourseEditorSelection =
    | { kind: 'section'; sectionId: number }
    | { kind: 'lesson'; sectionId: number; lessonId: number }
    | {
          kind: 'content';
          sectionId: number;
          lessonId: number;
          contentId: number;
      };
