import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import AdminLayout from "./layout/AdminLayout";
import SuperAdminLayout from "./layout/SuperAdminLayout";
import FocalPersonLayout from "./layout/FocalPersonLayout";
import StaffLayout from "./layout/StaffLayout";
import RequireAuth from "./pages/RequireAuth";
import PublicDocumentLink from "./pages/PuplicDocumentLink";

//For Super Adminstrator
import SuperAdministratorDashboard from "./pages/superadministrator/SuperAdministratorDashboard";
import SuperAdminAuditTrail from "./pages/superadministrator/AuditTrait";
import SuperAdminChangePassword from "./pages/superadministrator/ChangePassword";
import SuperAdminLineManager from "./pages/superadministrator/LineManager";
import SuperAdminProfile from "./pages/superadministrator/Profile";
import StaffDirectorySuperAdmin from "./pages/superadministrator/StaffDirectory";
import AdminManagement from "./pages/superadministrator/Admin";
import FocalPersonManagement from "./pages/superadministrator/FocalPerson";
import StaffManagement from "./pages/superadministrator/staff";
import PartnerManagement from "./pages/superadministrator/Partners";
import DepartmentManagement from "./pages/superadministrator/Department";
import TicketManagement from "./pages/superadministrator/Tickets";
import ManageSupportContacts from "./pages/superadministrator/SupportContact";
import StorageDashboard from "./pages/superadministrator/StorageDashboard";

//For Adminstrator (DPRS)
import AdministratorDashboard from "./pages/administrator/AdministratorDashboard";
import AdminProfile from "./pages/administrator/Profile";
import AdminChangePassword from "./pages/administrator/ChangePassword";
import AdminLineManager from "./pages/administrator/LineManager";
import AdminSupportTickets from "./pages/administrator/MySupportTickets";
import StaffDirectoryAdmin from "./pages/administrator/StaffDirectory";
import PartnerPage from "./pages/administrator/PartnersPage";
import DocumentAdmin from "./pages/administrator/Documents";
import DocumentDetailAdmin from "./pages/administrator/DocumentDetail";
import ShareDocumentPage from "./pages/administrator/DocumentSharePage";
import ArchiveDeletePageAdmin from "./pages/administrator/ArchiveDeletedDocument";
import DocumentSharedList from "./pages/administrator/SharedDocumentsPage";
import AdminReviewDepartmentDocRequests from "./pages/administrator/ReviewDepartmentDocumentRequests";
import DeleteDocumentRequests from "./pages/administrator/DeletionRequests";
import AdminRestoreRequests from "./pages/administrator/RestoreRequest";
import AdminAuditTrail from "./pages/administrator/AuditTrait";
import PartnerDashboardAdmin from "./pages/administrator/PartnerDashboard";
import TeamLeadAdmin from "./pages/administrator/TeamLead";
import TeamLeadDetailsAdmin from "./pages/administrator/TeamLeadDetail";
import AdminDocumentTracker from "./pages/administrator/AdminDocumentTracker";
import StorageDashboardAdmin from "./pages/administrator/StorageDashboard";

//for DFP
import DfpDashboard from "./pages/departmentfocalperson/Dashboard";
import DfpProfile from "./pages/departmentfocalperson/Profile";
import Upload from "./pages/departmentfocalperson/UploadDocument";
import ChangePasswordDFP from "./pages/departmentfocalperson/ChangePassword";
import ManageDocumentDFP from "./pages/departmentfocalperson/ManageDocument";
import DocumentDetail from "./pages/departmentfocalperson/documentDetail";
import RetentionNotifications from "./pages/departmentfocalperson/RetentionNotifications";
import ExpiredDocumentDetail from "./pages/departmentfocalperson/ExpiredDocumentDetail";
import SectionDocumentDFP from "./pages/departmentfocalperson/SectionDocuments";
import SectionDocumentDetail from "./pages/departmentfocalperson/SectionDocumentDetail";
import MyDocumentRequests from "./pages/departmentfocalperson/MyDocumentRequests";
import DepartmentStaff from "./pages/departmentfocalperson/DepartmentStaff";
import StaffDashboard from "./pages/departmentfocalperson/StaffDashboard";
import LineManager from "./pages/departmentfocalperson/LineManager";
import MySupportTickets from "./pages/departmentfocalperson/MySupportTickets";
import ArchiveDeletePage from "./pages/departmentfocalperson/ManageArchiveDeletedDocument";
import InternalAccessRequests from "./pages/departmentfocalperson/InternalAccessRequests";
import ReviewDepartmentDocRequests from "./pages/departmentfocalperson/ReviewDepartmentDocumentRequests";
import StaffDirectory from "./pages/departmentfocalperson/StaffDirectory";
import ProgramsPage from "./pages/departmentfocalperson/ProgramsPage";
import ProgramDetails from "./pages/departmentfocalperson/ProgramDetails";
import TeamLeadDashboard from "./pages/departmentfocalperson/ProgramAssigned";
import TeamLeadProgramDetails from "./pages/departmentfocalperson/TeamLeadProgramDetails";
import ProgramReportsPage from "./pages/departmentfocalperson/ProgramReportsPage";

//FOR STAFF
import MainStaffDashboard from "./pages/staff/DashboardStaff";
import StaffProfile from "./pages/staff/Profile";
import StaffChangePassword from "./pages/staff/ChangePassword";
import StaffLineManager from "./pages/staff/LineManager";
import StaffSupportTickets from "./pages/staff/MySupportTickets";
import Colleague from "./pages/staff/Colleague";
import WorkStreamDocument from "./pages/staff/WorkStreamDocument";
import WorkstreamDocumentDetail from "./pages/staff/WorkstreamDocumentDetail";
import StaffInternalAccessRequests from "./pages/staff/InternalAccessRequests";
import WorkstreamDocumentRequests from "./pages/staff/MyDocumentRequests";
import OtherWorkstreamDocument from "./pages/staff/OtherWorkstream";
import OtherWorkstreamDocumentDetail from "./pages/staff/OtherWorkstreamDocumentDetail";
import AllStaffList from "./pages/staff/AllStaffList";
import TeamLead from "./pages/staff/TeamLead";
import TeamLeadDetails from "./pages/staff/TeamLeadDetail";

//FOR PARTNER
import PartnerHome from "./pages/partners/home";
import PartnerLayout from "./layout/PartnerLayout";
import PartnerDocuments from "./pages/partners/Documents";
import PartnerChangePassword from "./pages/partners/ChangePassword";
import PartnerUserGuide from "./pages/partners/PartnerUserGuide";
import PartnerSupportTickets from "./pages/partners/SupportTicket";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/public/document/:token"
          element={<PublicDocumentLink />}
        />

        {/* Secure Routes for Super Administrator start */}
        <Route
          path="/superadmin"
          element={
            <RequireAuth>
              <SuperAdminLayout />
            </RequireAuth>
          }
        >
          {/* Nested routes (relative) */}
          <Route index element={<SuperAdministratorDashboard />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route
            path="change-password"
            element={<SuperAdminChangePassword />}
          />
          <Route path="line-manager" element={<SuperAdminLineManager />} />
          <Route path="audit-trait" element={<SuperAdminAuditTrail />} />
          <Route path="staff" element={<StaffDirectorySuperAdmin />} />
          <Route path="account/admin" element={<AdminManagement />} />
          <Route
            path="account/focal-person"
            element={<FocalPersonManagement />}
          />
          <Route path="account/staff" element={<StaffManagement />} />
          <Route path="account/partner" element={<PartnerManagement />} />
          <Route path="department" element={<DepartmentManagement />} />
          <Route path="tickets" element={<TicketManagement />} />
          <Route path="support-contact" element={<ManageSupportContacts />} />
          <Route path="system-storage" element={<StorageDashboard />} />
        </Route>

        {/* Secure Routes for Administrator start */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          {/* Nested routes (relative) */}
          <Route index element={<AdministratorDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="change-password" element={<AdminChangePassword />} />
          <Route path="line-manager" element={<AdminLineManager />} />
          <Route path="my-support-tickets" element={<AdminSupportTickets />} />
          <Route path="staff" element={<StaffDirectoryAdmin />} />
          <Route path="partners" element={<PartnerPage />} />
          <Route path="documents" element={<DocumentAdmin />} />
          <Route path="document/:id" element={<DocumentDetailAdmin />} />
          <Route path="document/share/:id" element={<ShareDocumentPage />} />
          <Route
            path="documents/archived-deleted"
            element={<ArchiveDeletePageAdmin />}
          />
          <Route path="documents/shared" element={<DocumentSharedList />} />
          <Route
            path="partner/dashboard/:id"
            element={<PartnerDashboardAdmin />}
          />
          <Route
            path="document/cross-department-access"
            element={<AdminReviewDepartmentDocRequests />}
          />
          <Route path="document/delete" element={<DeleteDocumentRequests />} />
          <Route path="document/restore" element={<AdminRestoreRequests />} />
          <Route path="audit-trait" element={<AdminAuditTrail />} />
          <Route path="program/team-lead" element={<TeamLeadAdmin />} />
          <Route
            path="program/team-lead/:id"
            element={<TeamLeadDetailsAdmin />}
          />
          <Route
            path="document-tracker/:documentCode"
            element={<AdminDocumentTracker />}
          />
          <Route path="system-storage" element={<StorageDashboardAdmin />} />
        </Route>

        {/* Secure Routes for department start */}
        <Route
          path="/department"
          element={
            <RequireAuth>
              <FocalPersonLayout />
            </RequireAuth>
          }
        >
          {/* Nested routes (relative) */}
          <Route index element={<DfpDashboard />} />
          <Route path="user/profile" element={<DfpProfile />} />
          <Route path="user/change-password" element={<ChangePasswordDFP />} />
          <Route path="document/upload" element={<Upload />} />
          <Route path="document/manage" element={<ManageDocumentDFP />} />
          <Route path="document/:id" element={<DocumentDetail />} />
          <Route
            path="document/expired/:id"
            element={<ExpiredDocumentDetail />}
          />
          <Route
            path="retention-notifications"
            element={<RetentionNotifications />}
          />
          <Route path="document/section" element={<SectionDocumentDFP />} />
          <Route
            path="document/section/:id"
            element={<SectionDocumentDetail />}
          />
          <Route path="document/request" element={<MyDocumentRequests />} />
          <Route
            path="document/staff/department-access-requests"
            element={<ReviewDepartmentDocRequests />}
          />
          <Route
            path="document/archived-deleted"
            element={<ArchiveDeletePage />}
          />
          <Route path="staff" element={<DepartmentStaff />} />
          <Route path="staff-directory" element={<StaffDirectory />} />
          <Route path="staff/:id/dashboard" element={<StaffDashboard />} />
          <Route path="/department/line-manager" element={<LineManager />} />
          <Route
            path="/department/my-support-tickets"
            element={<MySupportTickets />}
          />
          <Route
            path="/department/access-requests"
            element={<InternalAccessRequests />}
          />
          <Route path="/department/programs" element={<ProgramsPage />} />
          <Route path="/department/programs/:id" element={<ProgramDetails />} />
          <Route
            path="/department/programs/assigned"
            element={<TeamLeadDashboard />}
          />
          <Route
            path="/department/team-lead/programs/:id"
            element={<TeamLeadProgramDetails />}
          />
          <Route
            path="/department/programs/:id/reports"
            element={<ProgramReportsPage />}
          />
        </Route>

        {/* Secure Routes for staff start */}
        <Route
          path="/staff"
          element={
            <RequireAuth>
              <StaffLayout />
            </RequireAuth>
          }
        >
          {/* Nested routes (relative) */}
          <Route index element={<MainStaffDashboard />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="change-password" element={<StaffChangePassword />} />
          <Route path="line-manager" element={<StaffLineManager />} />
          <Route path="my-support-tickets" element={<StaffSupportTickets />} />
          <Route path="staff-list" element={<Colleague />} />
          <Route path="document/workstream" element={<WorkStreamDocument />} />
          <Route path="document/:id" element={<WorkstreamDocumentDetail />} />
          <Route
            path="access-requests"
            element={<StaffInternalAccessRequests />}
          />
          <Route
            path="document/other_workstreams"
            element={<OtherWorkstreamDocument />}
          />
          <Route
            path="other-workstream/document/request"
            element={<WorkstreamDocumentRequests />}
          />
          <Route
            path="document/other-workstream/:id"
            element={<OtherWorkstreamDocumentDetail />}
          />
          <Route path="staff-directory" element={<AllStaffList />} />
          <Route path="program/team-lead" element={<TeamLead />} />
          <Route path="program/team-lead/:id" element={<TeamLeadDetails />} />
        </Route>

        {/* Secure Routes for Partner start */}
        <Route
          path="/partner"
          element={
            <RequireAuth>
              <PartnerLayout />
            </RequireAuth>
          }
        >
          {/* Nested routes (relative) */}
          <Route index element={<PartnerHome />} />
          <Route path="documents" element={<PartnerDocuments />} />
          <Route path="change-password" element={<PartnerChangePassword />} />
          <Route path="user-guide" element={<PartnerUserGuide />} />
          <Route path="support-ticket" element={<PartnerSupportTickets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
