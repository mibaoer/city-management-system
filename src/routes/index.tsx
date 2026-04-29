import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VehicleTaskExecutionPage from '../pages/VehicleTaskExecutionPage';
import StatisticsPage from '../pages/StatisticsPage';
import MyTasksPage from '../pages/MyTasksPage';
import TaskDetailPage from '../pages/TaskDetailPage';
import TaskListPage from '../pages/TaskListPage';
import AIDailySummaryPage from '../pages/AIDailySummaryPage';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaskListPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/task/:taskId/execution" element={<VehicleTaskExecutionPage />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/task/:taskId" element={<TaskDetailPage />} />
        <Route path="/ai-daily-summary" element={<AIDailySummaryPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;