import { auth } from "../firebase/config";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const currentUser = auth.currentUser;
  const headers = new Headers(options.headers || {});

  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return response.json() as Promise<T>;
}

export interface UserProfileResponse {
  status: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: "STUDENT" | "LAWYER" | "ADMIN";
      avatarUrl: string | null;
      createdAt: string;
      studentProfile?: {
        university: string;
        course: string;
        yearOfStudy: number;
        interests: string | null;
        bio: string | null;
      } | null;
      lawyerProfile?: {
        specialization: string;
        experienceYears: number;
        bio: string | null;
        location: string;
        professionalTitle: string;
        enrollmentNumber: string;
      } | null;
    };
  };
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  claims?: Array<{ claim: string; source_ids: string[] }>;
  sources?: Array<{
    id: string;
    title: string;
    category: string;
    snippet: string;
    score?: number;
  }>;
  timing?: {
    retrieval?: number;
    reranking?: number;
    generation?: number;
    total?: number;
  };
  createdAt: string;
}

export interface AIConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface AIChatResponse {
  status: string;
  data: {
    conversationId: string;
    userMessage: AIChatMessage;
    message: AIChatMessage;
  };
}

export interface StudentDashboardResponse {
  status: string;
  data: {
    stats: {
      casesPracticed: number;
      averageScore: number;
      practiceSessions: number;
      topicsExplored: number;
    };
    recentActivity: unknown[];
  };
}

export interface LawyerDashboardResponse {
  status: string;
  data: {
    stats: {
      activeCases: number;
      upcomingHearings: number;
      pendingTasks: number;
      highPriorityTasks: number;
    };
    upcomingHearingsList?: Array<{
      id: string;
      title: string;
      description?: string | null;
      type: string;
      startAt: string;
      endAt: string;
      location?: string | null;
      case?: { id: string; title: string; caseNumber: string; court: string } | null;
    }>;
    activeCasesList?: CaseItem[];
    recentTasks?: Array<{
      id: string;
      title: string;
      priority: string;
      status: string;
      dueAt?: string | null;
      case?: { id: string; title: string; caseNumber: string } | null;
    }>;
  };
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  description?: string | null;
  caseType: string;
  status: string;
  priority: string;
  court: string;
  clientName: string;
  opposingParty: string;
  nextHearingAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  collaborators?: Array<{
    id: string;
    role: string;
    user: { id: string; name: string; email: string; avatarUrl?: string | null };
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueAt?: string | null;
  }>;
  events?: Array<{
    id: string;
    title: string;
    type: string;
    startAt: string;
    endAt: string;
    location?: string | null;
  }>;
}

export interface CaseDocumentItem {
  id: string;
  caseId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  createdAt: string;
  uploadedBy?: { id: string; name: string; email?: string };
}

export interface CaseNoteItem {
  id: string;
  caseId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  createdById: string;
  createdAt: string;
  createdBy?: { id: string; name: string };
}

export interface CaseScenarioData {
  id: string;
  title: string;
  practiceArea: string;
  difficulty: string;
  summary: string;
  facts: string;
  parties: string;
  legalIssues: string;
  evidence: string;
  relevantLaw?: string | null;
}

export interface SimulationResponseData {
  id: string;
  sessionId: string;
  stage: string;
  prompt: string;
  studentResponse: string;
  aiFeedback?: string | null;
  createdAt: string;
}

export interface SimulationEvaluationData {
  id: string;
  sessionId: string;
  legalReasoningScore: number;
  issueIdentificationScore: number;
  evidenceHandlingScore: number;
  argumentationScore: number;
  proceduralAwarenessScore: number;
  counterargumentHandlingScore: number;
  strategyScore: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  missedIssues: string;
  recommendations: string;
  simulatedJudgment: string;
  createdAt: string;
}

export interface SimulationSessionData {
  id: string;
  userId: string;
  caseScenarioId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "PAUSED";
  currentStage: string;
  overallScore?: number | null;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  caseScenario: CaseScenarioData;
  responses?: SimulationResponseData[];
  evaluation?: SimulationEvaluationData | null;
}

export const api = {
  getProfile: () => apiFetch<UserProfileResponse>("/users/me"),
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch<UserProfileResponse>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getNotifications: () =>
    apiFetch<{ status: string; data: { notifications: unknown[] } }>("/notifications"),
  markNotificationRead: (id: string) =>
    apiFetch<{ status: string; data: { notification: unknown } }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
  sendChatMessage: (message: string, conversationId?: string) =>
    apiFetch<AIChatResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, conversationId }),
    }),
  getConversations: () =>
    apiFetch<{ status: string; data: { conversations: AIConversationItem[] } }>("/ai/conversations"),
  getConversation: (id: string) =>
    apiFetch<{
      status: string;
      data: {
        conversation: AIConversationItem & { messages: AIChatMessage[] };
      };
    }>(`/ai/conversations/${id}`),
  deleteConversation: (id: string) =>
    apiFetch<{ status: string; message: string }>(`/ai/conversations/${id}`, {
      method: "DELETE",
    }),
  getStudentDashboardStats: () => apiFetch<StudentDashboardResponse>("/dashboard/student"),
  getLawyerDashboardStats: () => apiFetch<LawyerDashboardResponse>("/dashboard/lawyer"),
  createSimulatorSession: (practiceArea: string, difficulty: string) =>
    apiFetch<{ status: string; data: { session: SimulationSessionData } }>("/simulator/sessions", {
      method: "POST",
      body: JSON.stringify({ practiceArea, difficulty }),
    }),
  getSimulatorSession: (sessionId: string) =>
    apiFetch<{ status: string; data: { session: SimulationSessionData } }>(`/simulator/sessions/${sessionId}`),
  saveSimulatorProgress: (
    sessionId: string,
    stage: string,
    promptText?: string,
    studentResponseText?: string
  ) =>
    apiFetch<{ status: string; data: { responseRecord: SimulationResponseData } }>(
      `/simulator/sessions/${sessionId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ stage, promptText, studentResponseText }),
      }
    ),
  generateProceedingsEvent: (sessionId: string, studentStrategy: string) =>
    apiFetch<{
      status: string;
      data: {
        event: {
          speaker: string;
          speakerName: string;
          statement: string;
          legalChallenge: string;
          suggestedFocus: string;
        };
      };
    }>(`/simulator/sessions/${sessionId}/proceedings-event`, {
      method: "POST",
      body: JSON.stringify({ studentStrategy }),
    }),
  evaluateSimulatorSession: (sessionId: string) =>
    apiFetch<{ status: string; data: { evaluation: SimulationEvaluationData } }>(
      `/simulator/sessions/${sessionId}/evaluate`,
      {
        method: "POST",
      }
    ),
  getPracticeHistory: () =>
    apiFetch<{ status: string; data: { history: SimulationSessionData[] } }>("/simulator/sessions"),
  getCases: () => apiFetch<{ status: string; data: { cases: CaseItem[] } }>("/cases"),
  getCase: (id: string) => apiFetch<{ status: string; data: { case: CaseItem; role: string } }>(`/cases/${id}`),
  createCase: (data: Partial<CaseItem>) =>
    apiFetch<{ status: string; data: { case: CaseItem } }>("/cases", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCase: (id: string, data: Partial<CaseItem>) =>
    apiFetch<{ status: string; data: { case: CaseItem } }>(`/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getCaseCollaborators: (caseId: string) =>
    apiFetch<{ status: string; data: { collaborators: unknown[] } }>(`/cases/${caseId}/collaborators`),
  addCaseCollaborator: (caseId: string, userEmail: string, role: string) =>
    apiFetch<{ status: string; data: { collaborator: unknown } }>(`/cases/${caseId}/collaborators`, {
      method: "POST",
      body: JSON.stringify({ userEmail, role }),
    }),
  removeCaseCollaborator: (caseId: string, userId: string) =>
    apiFetch<{ status: string; message: string }>(`/cases/${caseId}/collaborators/${userId}`, {
      method: "DELETE",
    }),
  getCaseDocuments: (caseId: string) =>
    apiFetch<{ status: string; data: { documents: CaseDocumentItem[] } }>(`/cases/${caseId}/documents`),
  addCaseDocument: (caseId: string, doc: { name: string; fileUrl: string; fileType?: string; fileSize?: number }) =>
    apiFetch<{ status: string; data: { document: CaseDocumentItem } }>(`/cases/${caseId}/documents`, {
      method: "POST",
      body: JSON.stringify(doc),
    }),
  deleteCaseDocument: (caseId: string, docId: string) =>
    apiFetch<{ status: string; message: string }>(`/cases/${caseId}/documents/${docId}`, {
      method: "DELETE",
    }),
  getCaseNotes: (caseId: string) =>
    apiFetch<{ status: string; data: { notes: CaseNoteItem[] } }>(`/cases/${caseId}/notes`),
  addCaseNote: (caseId: string, note: { title: string; content: string; isPrivate?: boolean }) =>
    apiFetch<{ status: string; data: { note: CaseNoteItem } }>(`/cases/${caseId}/notes`, {
      method: "POST",
      body: JSON.stringify(note),
    }),
  deleteCaseNote: (caseId: string, noteId: string) =>
    apiFetch<{ status: string; message: string }>(`/cases/${caseId}/notes/${noteId}`, {
      method: "DELETE",
    }),
  getTasks: (caseId?: string) =>
    apiFetch<{ status: string; data: { tasks: unknown[] } }>(caseId ? `/tasks?caseId=${caseId}` : "/tasks"),
  createTask: (taskData: { title: string; description?: string; priority?: string; dueAt?: string; assignedToId?: string; caseId?: string }) =>
    apiFetch<{ status: string; data: { task: unknown } }>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),
  updateTask: (taskId: string, updateData: { status?: string; priority?: string; dueAt?: string }) =>
    apiFetch<{ status: string; data: { task: unknown } }>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }),
  getCalendarEvents: (caseId?: string) =>
    apiFetch<{ status: string; data: { events: unknown[] } }>(caseId ? `/calendar?caseId=${caseId}` : "/calendar"),
  createCalendarEvent: (eventData: { title: string; description?: string; type: string; startAt: string; endAt: string; location?: string; caseId?: string }) =>
    apiFetch<{ status: string; data: { event: unknown } }>("/calendar", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),
};
