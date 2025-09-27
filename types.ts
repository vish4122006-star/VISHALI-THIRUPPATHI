
export interface Lesson {
  title: string;
  content: string;
  activity: string;
  codeExample?: string;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  title: string;
  description: string;
  modules: Module[];
}