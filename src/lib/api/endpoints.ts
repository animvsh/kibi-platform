// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  RESET_PASSWORD: "/auth/reset-password",
} as const;

// Course endpoints
export const COURSE_ENDPOINTS = {
  GENERATE: "/courses/generate",
  LIST: "/courses",
  GET: (id: string) => `/courses/${id}`,
  UPDATE: (id: string) => `/courses/${id}`,
  DELETE: (id: string) => `/courses/${id}`,
  PUBLISH: (id: string) => `/courses/${id}/publish`,
  REMIX: (id: string) => `/courses/${id}/remix`,
  SHARE: (id: string) => `/courses/${id}/share`,
} as const;

// Lesson endpoints
export const LESSON_ENDPOINTS = {
  GET: (courseId: string, lessonId: string) =>
    `/courses/${courseId}/lessons/${lessonId}`,
  UPDATE: (id: string) => `/lessons/${id}`,
  COMPLETE: (id: string) => `/lessons/${id}/complete`,
  REGENERATE: (id: string) => `/lessons/${id}/regenerate`,
} as const;

// Quiz endpoints
export const QUIZ_ENDPOINTS = {
  GET: (id: string) => `/quizzes/${id}`,
  ATTEMPT: (id: string) => `/quizzes/${id}/attempt`,
  RESULTS: (id: string) => `/quizzes/${id}/results`,
} as const;

// Mastery endpoints
export const MASTERY_ENDPOINTS = {
  GET: (courseId: string) => `/courses/${courseId}/mastery`,
  KNOWLEDGE_MAP: (courseId: string) => `/courses/${courseId}/knowledge-map`,
  RECALCULATE: (courseId: string) => `/courses/${courseId}/recalculate-mastery`,
  NEXT_BEST_ACTION: (courseId: string) => `/courses/${courseId}/next-best-action`,
} as const;

// Tutor endpoints
export const TUTOR_ENDPOINTS = {
  CHAT: (courseId: string) => `/courses/${courseId}/tutor/chat`,
  GENERATE_PRACTICE: (courseId: string) =>
    `/courses/${courseId}/tutor/generate-practice`,
  EXPLAIN: (courseId: string) => `/courses/${courseId}/tutor/explain`,
  QUIZ_ME: (courseId: string) => `/courses/${courseId}/tutor/quiz-me`,
} as const;

// Share endpoints
export const SHARE_ENDPOINTS = {
  GET: (shareToken: string) => `/share/${shareToken}`,
  INVITE: (courseId: string) => `/courses/${courseId}/invite`,
  DUPLICATE: (courseId: string) => `/courses/${courseId}/duplicate`,
} as const;
