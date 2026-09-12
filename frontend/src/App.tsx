import { Navigate, Route, Routes } from "react-router-dom";
import QuantbitsShell from "./components/QuantbitsShell";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import DocsPage from "./pages/DocsPage";
import MyLearningPage from "./pages/MyLearningPage";

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route element={<QuantbitsShell />}>
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/courses/:courseId/learn" element={<CoursePlayerPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/:slug" element={<DocsPage />} />
      <Route path="/my-learning" element={<MyLearningPage />} />
      <Route path="/dashboard" element={<Navigate replace to="/my-learning" />} />
      <Route path="/progress" element={<Navigate replace to="/my-learning" />} />
      <Route path="/quantum-lab" element={<Navigate replace to="/my-learning" />} />
      <Route path="/experiments" element={<Navigate replace to="/courses/fundamentals/learn?tab=lab" />} />
      <Route path="/ai-tutor" element={<Navigate replace to="/" />} />
    </Route>
    <Route path="*" element={<Navigate replace to="/" />} />
  </Routes>;
}
