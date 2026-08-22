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
  };
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
  getCases: () => apiFetch<{ status: string; data: { cases: unknown[] } }>("/cases"),
  getTasks: () => apiFetch<{ status: string; data: { tasks: unknown[] } }>("/tasks"),
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
};
