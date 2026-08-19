import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard'));
const ChooseIssue = lazy(() => import('./pages/ChooseIssue'));
const Questions = lazy(() => import('./pages/Questions'));
const Processing = lazy(() => import('./pages/Processing'));
const Summary = lazy(() => import('./pages/Summary'));
const Checklists = lazy(() => import('./pages/Checklists'));
const Procedure = lazy(() => import('./pages/Procedure'));
const SaveConfirm = lazy(() => import('./pages/SaveConfirm'));

const AdvocateDashboard = lazy(() => import('./pages/AdvocateDashboard'));
const AdvocateCaseDetail = lazy(() => import('./pages/AdvocateCaseDetail'));
const AdvocateDocuments = lazy(() => import('./pages/AdvocateDocuments'));
const AdvocateAssistant = lazy(() => import('./pages/AdvocateAssistant'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/choose-issue" element={<ChooseIssue />} />
          <Route path="/citizen/questions/:category" element={<Questions />} />
          <Route path="/citizen/processing" element={<Processing />} />
          <Route path="/citizen/summary" element={<Summary />} />
          <Route path="/citizen/checklists" element={<Checklists />} />
          <Route path="/citizen/procedure" element={<Procedure />} />
          <Route path="/citizen/save-confirm" element={<SaveConfirm />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["advocate"]} />}>
          <Route path="/advocate/dashboard" element={<AdvocateDashboard />} />
          <Route path="/advocate/case/:caseId" element={<AdvocateCaseDetail />} />
          <Route path="/advocate/documents/:caseId" element={<AdvocateDocuments />} />
          <Route path="/advocate/assistant/:caseId" element={<AdvocateAssistant />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

function DashboardRedirect() {
  try {
    const stored = localStorage.getItem('lex_user');
    const user = stored ? JSON.parse(stored) : null;
    if (user?.role?.toLowerCase() === 'citizen') return <Navigate to="/citizen/dashboard" replace />;
    return <Navigate to="/advocate/dashboard" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}
