import { BrowserRouter, Routes, Route } from "react-router-dom";
import EntryPage from "@/pages/EntryPage";
import AdminHomePage from "@/pages/AdminHomePage";
import TaskExecutionHomePage from "@/pages/TaskExecutionHomePage";
import GarbageClassificationInspectionPage from "@/pages/GarbageClassificationInspectionPage";
import EventReportingPage from "@/pages/HazardReportingPage";
import GarbageInspectionListPage from "@/pages/GarbageInspectionListPage";
import StatisticsPage from "@/pages/StatisticsPage";
import ReportManagementPage from "@/pages/ReportManagementPage";
import UserReportPage from "@/pages/UserReportPage";
import PeopleManagementPage from "@/pages/PeopleManagementPage";
import ConstructionWasteManagementPage from "@/pages/ConstructionWasteManagementPage";
import ConstructionWasteApplicationPage from "@/pages/ConstructionWasteApplicationPage";
import ConstructionWasteVerifyPage from "@/pages/ConstructionWasteVerifyPage";
import PhotoReportListPage from "@/pages/PhotoReportListPage";
import DashboardPage from "@/pages/DashboardPage";
import TaskCreatePage from "@/pages/TaskCreatePage";
import TaskListPage from "@/pages/TaskListPage";
import VehicleTaskExecutionPage from "@/pages/VehicleTaskExecutionPage";
import WasteTransportTaskListPage from "@/pages/WasteTransportTaskListPage";
import VehicleManagementPage from "@/pages/VehicleManagementPage";
import MyTasksPage from "@/pages/MyTasksPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import UrbanManagementPage from "@/pages/UrbanManagementPage";
import AIDailySummaryPage from "@/pages/AIDailySummaryPage";
import BasicDataMaintenancePage from "@/pages/BasicDataMaintenancePage";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
      {/* 入口选择页面 */}
      <Route path="/" element={<EntryPage />} />
      
      {/* 后台管理端 */}
      <Route path="/admin" element={<DashboardPage />} />
      
      {/* 任务执行端 */}
      <Route path="/task-execution" element={<TaskExecutionHomePage />} />
      
      {/* 共用页面 */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/task-list" element={<TaskListPage />} />
      <Route path="/task-create" element={<TaskCreatePage />} />
      <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      <Route path="/garbage-inspection-list" element={<GarbageInspectionListPage />} />
      <Route path="/garbage-inspection" element={<GarbageClassificationInspectionPage />} />
      <Route path="/event-reporting" element={<EventReportingPage />} />
      <Route path="/hazard-reporting" element={<EventReportingPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/report-management" element={<ReportManagementPage />} />
      <Route path="/user-report" element={<UserReportPage />} />
      <Route path="/people-management" element={<PeopleManagementPage />} />
      <Route path="/photo-report-list" element={<PhotoReportListPage />} />
      <Route path="/task/:taskId/execution" element={<VehicleTaskExecutionPage />} />
      <Route path="/my-tasks" element={<MyTasksPage />} />
      <Route path="/task/:taskId" element={<TaskDetailPage />} />

      <Route path="/construction-waste" element={<ConstructionWasteManagementPage />} />
      <Route path="/construction-waste-application" element={<ConstructionWasteApplicationPage />} />
      <Route path="/construction-waste-verify" element={<ConstructionWasteVerifyPage />} />
      <Route path="/vehicle-management" element={<VehicleManagementPage />} />
      <Route path="/urban-management" element={<UrbanManagementPage />} />
      <Route path="/ai-daily-summary" element={<AIDailySummaryPage />} />
      <Route path="/basic-data-maintenance" element={<BasicDataMaintenancePage />} />
      </Routes>
    </AuthContext.Provider>
  );
}
