import { Navigate, Route, Routes } from "react-router-dom";
import QuantbitsShell from "./components/QuantbitsShell";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LessonPage from "./pages/LessonPage";
import QuantumLabPage from "./pages/QuantumLabPage";
import { AiTutorPage, ExperimentsPage, ProgressPage } from "./pages/UtilityPages";

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route element={<QuantbitsShell />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/courses/:courseId/lesson/:lessonId" element={<LessonPage />} />
      <Route path="/quantum-lab" element={<QuantumLabPage />} />
      <Route path="/experiments" element={<ExperimentsPage />} />
      <Route path="/ai-tutor" element={<AiTutorPage />} />
      <Route path="/progress" element={<ProgressPage />} />
    </Route>
    <Route path="*" element={<Navigate replace to="/" />} />
  </Routes>;
}
