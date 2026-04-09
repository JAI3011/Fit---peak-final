import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Auth + Landing are kept eager for fast first interaction.
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AdminSetup from "./pages/AdminSetup";
import ForgotPassword from "./pages/Forgot";
import ResetPassword from "./pages/Reset";

// Route-level lazy pages.
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Workouts = lazy(() => import("./pages/Workouts"));
const DietPlan = lazy(() => import("./pages/DietPlan"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport"));
const Library = lazy(() => import("./pages/Library"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));

const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard"));
const ManageClients = lazy(() => import("./pages/ManageClients"));
const ClientDetails = lazy(() => import("./pages/ClientDetails"));
const CreateWorkout = lazy(() => import("./pages/CreateWorkout"));
const CreateDietPlan = lazy(() => import("./pages/CreateDietPlan"));
const TrainerProfile = lazy(() => import("./pages/TrainerProfile"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const TrainerManagement = lazy(() => import("./pages/admin/TrainerManagement"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const HighlightsManagement = lazy(() => import("./pages/admin/HighlightsManagement"));

// ✅ REMOVED: AdminProvider and FeedbackProvider imports — they live in main.jsx only

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      {/* ✅ NO AdminProvider or FeedbackProvider here — already in main.jsx */}
      <Suspense fallback={<div className="p-6 text-center text-sm text-gray-500">Loading page...</div>}>
        <Routes>

        {/* Public home / landing */}
            <Route path="/" element={<Landing />} />

            {/* AUTH ROUTES */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin-setup" element={<AdminSetup />} />  {/* ✅ NEW: Admin setup */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* PUBLIC KNOWLEDGE ROUTES */}
            <Route path="/library" element={<Library />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />

            {/* USER ROUTES */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/workouts"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Workouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/diet"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <DietPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/report"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <WeeklyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/library"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/article/:slug"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <ArticleDetail />
                </ProtectedRoute>
              }
            />

            {/* TRAINER ROUTES */}
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/clients"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <ManageClients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/client/:clientId"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <ClientDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/workout/create"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <CreateWorkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/diet/create"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <CreateDietPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer/profile"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerProfile />
                </ProtectedRoute>
              }
            />

            {/* ✅ FIXED ADMIN ROUTES — flat structure, no self-nesting */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TrainerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/highlights"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <HighlightsManagement />
                </ProtectedRoute>
              }
            />

            {/* Redirect /admin → /admin/dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* 404 / fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
      </Suspense>
    </Router>
  );
}

export default App;