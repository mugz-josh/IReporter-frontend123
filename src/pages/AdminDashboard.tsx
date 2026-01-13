import {
  Flag,
  LogOut,
  Grid3x3,
  Users,
  Eye,
  X,
  Menu,
  Search,
  MessageSquare,
  Download,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { storage } from "@/utils/storage";
import { useState, useEffect } from "react";
import { Report, User } from "@/types/report";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "@/components/CommentsSection";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const currentUser = storage.getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const FILE_BASE = API_URL.replace(/\/api$/, "");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chartData, setChartData] = useState({
    statusDistribution: [] as { name: string; value: number; color: string }[],
    typeDistribution: [] as { name: string; value: number; color: string }[],
    userActivity: [] as { date: string; reports: number; users: number }[],
  });

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) {
      navigate("/");
      return;
    }
    loadReports();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [redFlagsRes, interventionsRes] = await Promise.all([
        api.getRedFlags(),
        api.getInterventions(),
      ]);

      const allReports: Report[] = [];
      
      if (
        redFlagsRes.status === 200 &&
        redFlagsRes.data &&
        Array.isArray(redFlagsRes.data)
      ) {
        const redFlags = redFlagsRes.data.map((item: any) => ({
          id: item.id?.toString() || "",
          type: "red-flag" as const,
          title: item.title || "",
          description: item.description || "",
          latitude: parseFloat(item.latitude) || 0,
          longitude: parseFloat(item.longitude) || 0,
          status: (item.status?.toUpperCase().replace("-", " ") ||
            "DRAFT") as Report["status"],
          userId: item.user_id?.toString() || "",
          userName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
          createdAt: item.created_at || "",
          updatedAt: item.updated_at || "",
          images: item.images || [],
          videos: item.videos || [],
        }));
        allReports.push(...redFlags);
      }
     if (
        interventionsRes.status === 200 &&
        interventionsRes.data &&
        Array.isArray(interventionsRes.data)
      ) {
        const interventions = interventionsRes.data.map((item: any) => ({
          id: item.id?.toString() || "",
          type: "intervention" as const,
          title: item.title || "",
          description: item.description || "",
          latitude: parseFloat(item.latitude) || 0,
          longitude: parseFloat(item.longitude) || 0,
          status: (item.status?.toUpperCase().replace("-", " ") ||
            "DRAFT") as Report["status"],
          userId: item.user_id?.toString() || "",
          userName: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
          createdAt: item.created_at || "",
          updatedAt: item.updated_at || "",
          images: item.images || [],
          videos: item.videos || [],
        }));
        allReports.push(...interventions);
      }

      setReports(allReports);
      const mockUsers = storage.getUsers().map((user) => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        role: user.is_admin ? "admin" : "user" as "admin" | "user",
      }));
      setUsers(mockUsers);

      // Generate chart data
      const statusCounts = {
        draft: allReports.filter(r => r.status === 'DRAFT').length,
        underInvestigation: allReports.filter(r => r.status === 'UNDER INVESTIGATION').length,
        resolved: allReports.filter(r => r.status === 'RESOLVED').length,
        rejected: allReports.filter(r => r.status === 'REJECTED').length,
      };

      const redFlagsCount = allReports.filter(r => r.type === 'red-flag').length;
      const interventionsCount = allReports.filter(r => r.type === 'intervention').length;

      const statusDistribution = [
        { name: 'Draft', value: statusCounts.draft, color: 'hsl(var(--muted-foreground))' },
        { name: 'Under Investigation', value: statusCounts.underInvestigation, color: 'hsl(var(--chart-2))' },
        { name: 'Resolved', value: statusCounts.resolved, color: 'hsl(var(--chart-3))' },
        { name: 'Rejected', value: statusCounts.rejected, color: 'hsl(var(--destructive))' },
      ];

      const typeDistribution = [
        { name: 'Red Flags', value: redFlagsCount, color: 'hsl(var(--destructive))' },
        { name: 'Interventions', value: interventionsCount, color: 'hsl(var(--chart-2))' },
      ];

      // Mock user activity data (last 7 days)
      const userActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        userActivity.push({
          date: dateStr,
          reports: Math.floor(Math.random() * 10) + 1,
          users: Math.floor(Math.random() * 5) + 1,
        });
      }

      setChartData({
        statusDistribution,
        typeDistribution,
        userActivity,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearCurrentUser();
    navigate("/");
  };

  const handleStatusChange = async (
    reportId: string,
    reportType: string,
    newStatus: Report["status"]
  ) => {
    try {
      const apiStatus = newStatus.toLowerCase().replace(" ", "-");

      if (reportType === "red-flag") {
        await api.updateRedFlagStatus(reportId, apiStatus);
      } else {
        await api.updateInterventionStatus(reportId, apiStatus);
      }

      toast({ title: "Success", description: "Status updated successfully" });
      loadReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const loadRealUsers = async () => {
    try {
      const response = await api.getUsers();
      if (
        response.status === 200 &&
        response.data &&
        Array.isArray(response.data)
      ) {
        const formattedUsers = response.data.map((user: any) => ({
          ...user,
          name: `${user.first_name} ${user.last_name}`,
          role: (user.is_admin ? "admin" : "user") as "admin" | "user",
        }));
        setRealUsers(formattedUsers);
        toast({ title: "Success", description: " Users loaded successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load  Users",
        variant: "destructive",
      });
    }
  };

  const isUsersPage = location.pathname === "/admin/users";
  const isCommentsPage = location.pathname === "/admin/comments";
  const getUserReports = (userId: string) =>
    reports.filter((r) => r.userId === userId);

  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (!isNaN(Number(query))) {
      return report.id === query;
    }
    return (
      report.id.toLowerCase().includes(query) ||
      report.userName.toLowerCase().includes(query)
    );
  });

  const handleExportReports = () => {
    const dataStr = JSON.stringify({
      reports: filteredReports,
      stats: {
        total: reports.length,
        draft: reports.filter(r => r.status === 'DRAFT').length,
        underInvestigation: reports.filter(r => r.status === 'UNDER INVESTIGATION').length,
        resolved: reports.filter(r => r.status === 'RESOLVED').length,
        rejected: reports.filter(r => r.status === 'REJECTED').length,
      },
      exportedAt: new Date().toISOString(),
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `admin-reports-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="page-admin">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`mobile-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`page-aside ${sidebarOpen ? "" : "mobile-hidden"}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Flag className="text-primary-foreground" size={20} />
          </div>
          <h1 className="sidebar-title">iReporter Admin</h1>
        </div>

        <nav className="sidebar-nav" style={{ marginTop: "2rem" }}>
          <Link
            to="/admin"
            className={`nav-link ${!isUsersPage ? "nav-link-active" : ""}`}
          >
            <Grid3x3 size={20} />
            <span>All Reports</span>
          </Link>

          <Link
            to="/admin/users"
            className={`nav-link ${isUsersPage ? "nav-link-active" : ""}`}
          >
            <Users size={20} />
            <span>Users</span>
          </Link>

          <Link
            to="/admin/comments"
            className={`nav-link ${location.pathname === "/admin/comments" ? "nav-link-active" : ""}`}
          >
            <MessageSquare size={20} />
            <span>Comments</span>
          </Link>

          <button
            onClick={handleLogout}
            className="nav-link"
            style={{ width: "100%", textAlign: "left" }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {isCommentsPage ? (
          <>
            <div className="page-header">
              <h2 className="text-2xl font-semibold">Comments Management</h2>
              <div className="flex items-center gap-3">
                <span>Admin</span>
                <div
                  className="brand-icon"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <span>AD</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground">
                Manage all comments and official responses across reports. As an admin, you can post official responses to provide authoritative information to users.
              </p>
            </div>

            <div className="space-y-6">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.type === "red-flag" ? "Red Flag" : "Intervention"} • {report.userName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                      report.status === "UNDER INVESTIGATION" ? "bg-blue-100 text-blue-800" :
                      report.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <CommentsSection
                    reportType={report.type === "red-flag" ? "red_flag" : "intervention"}
                    reportId={report.id}
                  />
                </div>
              ))}
            </div>
          </>
        ) : isUsersPage ? (
          <>
            <div className="page-header">
              <h2 className="text-2xl font-semibold">Users</h2>
              <div className="flex items-center gap-3">
                <span>Admin</span>
                <div
                  className="brand-icon"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <span>AD</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Button onClick={loadRealUsers} variant="outline">
                Load Real Users
              </Button>
            </div>

            <div className="admin-stats-grid">
              {(realUsers.length > 0 ? realUsers : users).map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-avatar">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                  <div className="user-stats">
                    <div className="user-stat">
                      <div className="user-stat-value">{getUserReports(user.id).length}</div>
                      <div className="user-stat-label">Reports</div>
                    </div>
                    <div className="user-stat">
                      <div className="user-stat-value">{user.email}</div>
                      <div className="user-stat-label">Email</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye size={16} />
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {selectedUser && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 50,
                }}
                onClick={() => setSelectedUser(null)}
              >
                <div
                  className="bg-card"
                  style={{
                    maxWidth: "40rem",
                    width: "100%",
                    borderRadius: "1rem",
                    padding: "2rem",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedUser(null)}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="muted-foreground">{selectedUser.email}</p>
                    <div>
                      <h4 className="font-semibold mb-2">Reports</h4>
                      {getUserReports(selectedUser.id).map((report) => (
                        <div
                          key={report.id}
                          className="p-3 border border-border rounded-lg mb-2"
                        >
                          <p className="font-medium text-sm">{report.title}</p>
                          <p className="text-xs muted-foreground">
                            {report.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="page-header">
              <h2 className="text-2xl font-semibold">All Reports</h2>
              <div className="flex items-center gap-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                  <Clock size={16} />
                  {currentTime.toLocaleTimeString()}
                </div>
                <span>Admin</span>
                <div
                  className="brand-icon"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <span>AD</span>
                </div>
              </div>
            </div>

            <div
              className="mb-6"
              style={{ position: "relative", maxWidth: "500px" }}
            >
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "hsl(var(--muted-foreground))",
                }}
              />
              <Input
                type="text"
                placeholder="Search by Report ID or User Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "3rem" }}
              />
            </div>

            {/* Analytics Section */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                  📊 Admin Analytics Overview
                </h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Button onClick={loadReports} variant="outline" size="sm">
                    <Activity size={16} />
                    Refresh
                  </Button>
                  <Button onClick={handleExportReports} variant="outline" size="sm">
                    <Download size={16} />
                    Export
                  </Button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
                {/* Status Distribution Pie Chart */}
                <div
                  style={{
                    padding: "1.5rem",
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.07)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                      Report Status Distribution
                    </h4>
                    <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                      {reports.length} total
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={chartData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          color: "hsl(var(--popover-foreground))"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* User Activity Line Chart */}
                <div
                  style={{
                    padding: "1.5rem",
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.07)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                      Recent Activity (7 days)
                    </h4>
                    <TrendingUp size={20} style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData.userActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                          color: "hsl(var(--popover-foreground))"
                        }}
                      />
                      <Line type="monotone" dataKey="reports" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div
                  className="admin-stat-value"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {reports.length}
                </div>
                <div className="admin-stat-label">Total Reports</div>
              </div>
              <div className="admin-stat-card">
                <div
                  className="admin-stat-value"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {reports.filter((r) => r.status === "DRAFT").length}
                </div>
                <div className="admin-stat-label">Draft</div>
              </div>
              <div className="admin-stat-card">
                <div
                  className="admin-stat-value"
                  style={{ color: "hsl(var(--chart-2))" }}
                >
                  {
                    reports.filter((r) => r.status === "UNDER INVESTIGATION")
                      .length
                  }
                </div>
                <div className="admin-stat-label">Under Investigation</div>
              </div>
              <div className="admin-stat-card">
                <div
                  className="admin-stat-value"
                  style={{ color: "hsl(var(--chart-3))" }}
                >
                  {reports.filter((r) => r.status === "RESOLVED").length}
                </div>
                <div className="admin-stat-label">Resolved</div>
              </div>
              <div className="admin-stat-card">
                <div
                  className="admin-stat-value"
                  style={{ color: "hsl(var(--destructive))" }}
                >
                  {reports.filter((r) => r.status === "REJECTED").length}
                </div>
                <div className="admin-stat-label">Rejected</div>
              </div>
              <div className="admin-stat-card">
                <div
                  className="admin-stat-value"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  {users.length}
                </div>
                <div className="admin-stat-label">Total Users</div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="muted-foreground">Loading reports...</p>
              </div>
            ) : (
              <div className="reports-table">
                <div className="reports-table-header">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: "1rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                    <div>Type</div>
                    <div>Title</div>
                    <div>User</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                </div>
                <div className="reports-table-body">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="report-row">
                      <div className="report-cell">
                        <span className={`status-badge ${report.type === "red-flag" ? "status-rejected" : "status-under-investigation"}`}>
                          {report.type === "red-flag" ? "Red Flag" : "Intervention"}
                        </span>
                      </div>
                      <div className="report-cell">
                        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{report.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                          ID: {report.id}
                        </div>
                      </div>
                      <div className="report-cell">{report.userName}</div>
                      <div className="report-cell">
                        <span className={`status-badge ${
                          report.status === "RESOLVED" ? "status-resolved" :
                          report.status === "UNDER INVESTIGATION" ? "status-under-investigation" :
                          report.status === "REJECTED" ? "status-rejected" :
                          "status-draft"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="report-cell">
                        <select
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(
                              report.id,
                              report.type,
                              e.target.value as Report["status"]
                            )
                          }
                          style={{
                            padding: "0.25rem 0.5rem",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.25rem",
                            background: "hsl(var(--background))",
                            color: "hsl(var(--foreground))",
                            fontSize: "0.75rem"
                          }}
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="UNDER INVESTIGATION">Under Investigation</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
