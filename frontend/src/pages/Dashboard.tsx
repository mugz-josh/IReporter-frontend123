import { Flag, LogOut, Grid3x3, Plus, Menu, X, Edit, Home, FilePlus, AlertCircle, TrendingUp, TrendingDown, Users, CheckCircle, Clock, AlertTriangle, BarChart3, PieChart as PieChartIcon, Calendar, ArrowRight, Eye, ThumbsUp, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { useUser } from "@/contexts/UserContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useUser();
  const [stats, setStats] = useState({
    redFlags: 0,
    interventions: 0,
    total: 0,
    draft: 0,
    underInvestigation: 0,
    resolved: 0,
    rejected: 0,
  });

  const [chartData, setChartData] = useState({
    typeDistribution: [] as { name: string; value: number; color: string }[],
    statusDistribution: [] as { name: string; value: number; color: string }[],
    monthlyData: [] as { month: string; redFlags: number; interventions: number }[],
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [redFlagsRes, interventionsRes] = await Promise.all([
        api.getRedFlags(),
        api.getInterventions(),
      ]);

      const userRedFlags = (redFlagsRes.data || []).filter(
        (r: any) => r.user_id.toString() === currentUser?.id
      );
      const userInterventions = (interventionsRes.data || []).filter(
        (r: any) => r.user_id.toString() === currentUser?.id
      );

      const redFlagsCount = userRedFlags.length;
      const interventionsCount = userInterventions.length;

      const allUserReports = [...userRedFlags, ...userInterventions];
      const statusCounts = {
        draft: 0,
        underInvestigation: 0,
        resolved: 0,
        rejected: 0,
      };

      allUserReports.forEach((report: any) => {
        const status = report.status?.toLowerCase().replace(/\s+/g, '') || 'draft';
        if (status === 'draft') statusCounts.draft++;
        else if (status === 'underinvestigation') statusCounts.underInvestigation++;
        else if (status === 'resolved') statusCounts.resolved++;
        else if (status === 'rejected') statusCounts.rejected++;
      });

      const typeDistribution = [
        { name: 'Red Flags', value: redFlagsCount, color: 'hsl(var(--destructive))' },
        { name: 'Interventions', value: interventionsCount, color: 'hsl(var(--primary))' },
      ];

      const statusDistribution = [
        { name: 'Draft', value: statusCounts.draft, color: 'hsl(var(--muted-foreground))' },
        { name: 'Under Investigation', value: statusCounts.underInvestigation, color: 'hsl(var(--chart-2))' },
        { name: 'Resolved', value: statusCounts.resolved, color: 'hsl(var(--chart-3))' },
        { name: 'Rejected', value: statusCounts.rejected, color: 'hsl(var(--destructive))' },
      ];

      const monthlyStats: { [key: string]: { redFlags: number; interventions: number } } = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyStats[monthKey] = { redFlags: 0, interventions: 0 };
      }

      allUserReports.forEach((report: any) => {
        if (report.created_at || report.createdAt) {
          const createdDate = new Date(report.created_at || report.createdAt);
          const monthKey = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          if (createdDate >= sixMonthsAgo && monthlyStats[monthKey]) {
            const isRedFlag = report.type === 'red-flag' || report.type === 'redflag' ||
                             userRedFlags.some((rf: any) => rf.id === report.id);
            if (isRedFlag) {
              monthlyStats[monthKey].redFlags++;
            } else {
              monthlyStats[monthKey].interventions++;
            }
          }
        }
      });

      const monthlyData = Object.entries(monthlyStats).map(([month, counts]) => ({
        month: month.split(' ')[0],
        redFlags: counts.redFlags,
        interventions: counts.interventions,
      }));

      setStats({
        redFlags: redFlagsCount,
        interventions: interventionsCount,
        total: redFlagsCount + interventionsCount,
        draft: statusCounts.draft,
        underInvestigation: statusCounts.underInvestigation,
        resolved: statusCounts.resolved,
        rejected: statusCounts.rejected,
      });

      setChartData({
        typeDistribution,
        statusDistribution,
        monthlyData,
      });

      const reportsWithType = [
        ...userRedFlags.map(r => ({ ...r, reportType: 'red-flag' })),
        ...userInterventions.map(r => ({ ...r, reportType: 'intervention' }))
      ].sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());

      setUserReports(reportsWithType);
      setFilteredReports(reportsWithType);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    let filtered = userReports;
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(report =>
        (report.status?.toLowerCase().replace(/\s+/g, '') || 'draft') === statusFilter
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(report => report.reportType === typeFilter);
    }
    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, typeFilter, userReports]);

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const handleEditProfile = () => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
      });
    }
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      let updatedUser = { ...currentUser };
      if (profilePictureFile) {
        const uploadRes = await api.uploadProfilePicture(profilePictureFile);
        if (uploadRes.status === 200 && uploadRes.data && uploadRes.data[0]) {
          updatedUser.profile_picture = uploadRes.data[0].profile_picture;
        }
      }
      const res = await api.updateProfile(profileData);
      if (res.status === 200 && res.data) {
        updatedUser = { ...updatedUser, ...profileData };
        setUser(updatedUser);
        setProfilePictureFile(null);
        setShowProfileModal(false);
        loadStats();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '') || 'draft';
    switch (statusLower) {
      case 'draft': return 'hsl(var(--muted-foreground))';
      case 'underinvestigation': return 'hsl(var(--chart-2))';
      case 'resolved': return 'hsl(var(--chart-3))';
      case 'rejected': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '') || 'draft';
    switch (statusLower) {
      case 'draft': return 'Draft';
      case 'underinvestigation': return 'Under Investigation';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return 'Draft';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Hamburger */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay show" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`page-aside ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <Flag size={24} />
          </div>
          <span className="sidebar-title">iReporter</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link nav-link-active">
            <Grid3x3 size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/create" className="nav-link">
            <FilePlus size={20} />
            <span>Create Report</span>
          </Link>
          <Link to="/red-flags" className="nav-link">
            <Flag size={20} />
            <span>My Reports</span>
          </Link>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', textAlign: 'left' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {currentUser && (
            <div className="user-info-card">
              <div className="user-avatar-large">
                {`${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`}
              </div>
              <div className="user-info-text">
                <p className="user-name">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="user-role">Citizen Reporter</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-welcome">
            <h1 className="header-title">Welcome back, {currentUser?.first_name}</h1>
            <p className="header-subtitle">Here's what's happening with your reports</p>
          </div>
          <div className="header-actions">
            <NotificationBell />
            <ThemeToggle />
            <button onClick={handleEditProfile} className="btn btn-outline btn-sm">
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card-primary">
              <div className="stat-icon-wrapper">
                <FilePlus size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Reports</span>
              </div>
              <div className="stat-trend positive">
                <TrendingUp size={16} />
                <span>All time</span>
              </div>
            </div>

            <div className="stat-card-danger">
              <div className="stat-icon-wrapper">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.redFlags}</span>
                <span className="stat-label">Red Flags</span>
              </div>
              <div className="stat-badge">Corruption Reports</div>
            </div>

            <div className="stat-card-success">
              <div className="stat-icon-wrapper">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.resolved}</span>
                <span className="stat-label">Resolved</span>
              </div>
              <div className="stat-badge">Issues Fixed</div>
            </div>

            <div className="stat-card-warning">
              <div className="stat-icon-wrapper">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{stats.underInvestigation}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-badge">Awaiting Action</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2 className="section-heading">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/create" className="quick-action-card primary">
              <div className="action-icon">
                <Flag size={28} />
              </div>
              <div className="action-content">
                <h3>Report Corruption</h3>
                <p>Submit a red-flag report</p>
              </div>
              <ArrowRight size={20} className="action-arrow" />
            </Link>
            <Link to="/create" className="quick-action-card secondary">
              <div className="action-icon">
                <AlertCircle size={28} />
              </div>
              <div className="action-content">
                <h3>Request Intervention</h3>
                <p>Report infrastructure issues</p>
              </div>
              <ArrowRight size={20} className="action-arrow" />
            </Link>
            <Link to="/red-flags" className="quick-action-card tertiary">
              <div className="action-icon">
                <Eye size={28} />
              </div>
              <div className="action-content">
                <h3>View All Reports</h3>
                <p>Track your submissions</p>
              </div>
              <ArrowRight size={20} className="action-arrow" />
            </Link>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3><PieChartIcon size={20} /> Report Types</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {chartData.typeDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-dot" style={{ background: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3><BarChart3 size={20} /> Status Overview</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {chartData.statusDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-dot" style={{ background: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Trends */}
        <section className="trends-section">
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3><Calendar size={20} /> Monthly Activity</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="redFlags" fill="hsl(var(--destructive))" name="Red Flags" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interventions" fill="hsl(var(--primary))" name="Interventions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Reports */}
        <section className="reports-section">
          <div className="section-header">
            <h2 className="section-heading">Recent Reports</h2>
            <div className="filter-controls">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="underinvestigation">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <FilePlus size={48} />
              <h3>No Reports Yet</h3>
              <p>Create your first report to start making a difference</p>
              <Link to="/create" className="btn btn-primary">
                Create Report
              </Link>
            </div>
          ) : (
            <div className="reports-list">
              {filteredReports.slice(0, 8).map((report, index) => (
                <div
                  key={report.id || index}
                  className="report-card"
                  onClick={() => { setSelectedReport(report); setShowReportDetails(true); }}
                >
                  <div className="report-type-indicator" 
                    style={{ background: report.reportType === 'red-flag' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}
                  />
                  <div className="report-main">
                    <div className="report-header">
                      <span className={`report-type-badge ${report.reportType}`}>
                        {report.reportType === 'red-flag' ? <Flag size={14} /> : <AlertCircle size={14} />}
                        {report.reportType === 'red-flag' ? 'Red Flag' : 'Intervention'}
                      </span>
                      <span className="report-status" style={{ background: getStatusColor(report.status) }}>
                        {getStatusBadge(report.status)}
                      </span>
                    </div>
                    <h4 className="report-title">{report.title || 'Untitled Report'}</h4>
                    <p className="report-description">{report.description || 'No description provided'}</p>
                  </div>
                  <div className="report-meta">
                    <span className="meta-item"><MapPin size={14} /> {report.location || 'N/A'}</span>
                    <span className="meta-item"><Calendar size={14} /> {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Helper component for MapPin icon
function MapPin({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}
