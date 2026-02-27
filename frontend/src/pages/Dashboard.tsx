import { Flag, LogOut, Grid3x3, Plus, Menu, X, Edit, Home, FilePlus, AlertCircle } from "lucide-react";
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
  
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    theme: 'light',
    language: 'en'
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    loadStats();
  }, []);

  const loadUsers = async () => {
    if (!currentUser?.is_admin) {
      alert("You don't have admin privileges to view users.");
      return;
    }

    try {
      setLoadingUsers(true);
      const usersRes = await api.getUsers();
      if (usersRes.status === 200 && usersRes.data) {
        setAllUsers(usersRes.data);
        setShowUsersModal(true);
      } else {
        alert("Failed to load users. Please try again.");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error loading users. Please check your connection.");
    } finally {
      setLoadingUsers(false);
    }
  };

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

      // Calculate status distribution
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

      // Prepare chart data
      const typeDistribution = [
        { name: 'Red Flags', value: redFlagsCount, color: 'hsl(var(--destructive))' },
        { name: 'Interventions', value: interventionsCount, color: 'hsl(var(--chart-2))' },
      ];

      const statusDistribution = [
        { name: 'Draft', value: statusCounts.draft, color: 'hsl(var(--muted-foreground))' },
        { name: 'Under Investigation', value: statusCounts.underInvestigation, color: 'hsl(var(--chart-2))' },
        { name: 'Resolved', value: statusCounts.resolved, color: 'hsl(var(--chart-3))' },
        { name: 'Rejected', value: statusCounts.rejected, color: 'hsl(var(--destructive))' },
      ];

      // Process real monthly data from user's reports
      const monthlyStats: { [key: string]: { redFlags: number; interventions: number } } = {};

      // Initialize last 6 months
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyStats[monthKey] = { redFlags: 0, interventions: 0 };
      }

      // Count reports by month
      allUserReports.forEach((report: any) => {
        if (report.created_at || report.createdAt) {
          const createdDate = new Date(report.created_at || report.createdAt);
          const monthKey = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          // Only count if it's within the last 6 months
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          if (createdDate >= sixMonthsAgo) {
            if (monthlyStats[monthKey]) {
              // Check if it's a red flag or intervention based on the data structure
              const isRedFlag = report.type === 'red-flag' || report.type === 'redflag' ||
                               (report.title && report.title.toLowerCase().includes('red flag')) ||
                               userRedFlags.some((rf: any) => rf.id === report.id);

              if (isRedFlag) {
                monthlyStats[monthKey].redFlags++;
              } else {
                monthlyStats[monthKey].interventions++;
              }
            }
          }
        }
      });

      // Convert to array format for the chart
      const monthlyData = Object.entries(monthlyStats).map(([month, counts]) => ({
        month: month.split(' ')[0], // Just the month abbreviation
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

      // Set user reports for the history section
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

  // Filter reports based on search and filters
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

      // Upload profile picture if selected
      if (profilePictureFile) {
        const uploadRes = await api.uploadProfilePicture(profilePictureFile);
        if (uploadRes.status === 200 && uploadRes.data && uploadRes.data[0]) {
          updatedUser.profile_picture = uploadRes.data[0].profile_picture;
        } else {
          alert("Failed to upload profile picture");
          return;
        }
      }

      // Update profile data
      const res = await api.updateProfile(profileData);
      if (res.status === 200 && res.data) {
        updatedUser = { ...updatedUser, ...profileData };
        setUser(updatedUser);
        setProfilePictureFile(null);
        setShowProfileModal(false);
        loadStats();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowProfileModal(false);
  };

  const handleViewReportDetails = (report: any) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleCloseReportDetails = () => {
    setShowReportDetails(false);
    setSelectedReport(null);
  };

  const handleSaveSettings = async () => {
    try {
      // Here you would typically save settings to backend
      // For now, we'll just store in localStorage
      localStorage.setItem('userSettings', JSON.stringify(userSettings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '') || 'draft';
    switch (statusLower) {
      case 'draft':
        return 'hsl(var(--muted-foreground))';
      case 'underinvestigation':
        return 'hsl(var(--chart-2))';
      case 'resolved':
        return 'hsl(var(--chart-3))';
      case 'rejected':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase().replace(/\s+/g, '') || 'draft';
    switch (statusLower) {
      case 'draft':
        return 'Draft';
      case 'underinvestigation':
        return 'Under Investigation';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="page-dashboard dashboard-layout min-h-screen bg-background">
      {/* Mobile Hamburger Menu Button - Fixed at top left */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-primary-foreground p-2 rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-300"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
        }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Dark Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          style={{ backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Sidebar - Slide in from left on mobile, fixed on desktop */}
      <aside 
        className={`fixed md:static top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          paddingTop: '60px',
        }}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Flag className="text-primary-foreground" size={20} />
            </div>
            <h1 className="text-xl font-bold">iReporter</h1>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Grid3x3 size={20} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/create" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <FilePlus size={20} />
            <span>Create Red Flag</span>
          </Link>

          <Link 
            to="/create" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <AlertCircle size={20} />
            <span>Create Intervention</span>
          </Link>

          <Link 
            to="/red-flags" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Flag size={20} />
            <span>My Reports</span>
          </Link>

          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          {currentUser && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {`${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{`${currentUser.first_name} ${currentUser.last_name}`}</p>
                <p className="text-xs text-muted-foreground">Citizen Reporter</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Grid3x3 size={20} />
              <span>Overview</span>
            </div>
            <h2 className="text-2xl font-semibold">My Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline">{currentUser?.first_name} {currentUser?.last_name}</span>
              <button
                onClick={handleEditProfile}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Edit Profile"
              >
                <Edit size={16} className="text-muted-foreground" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {`${currentUser?.first_name?.[0] || ""}${currentUser?.last_name?.[0] || ""}`}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-destructive mb-2">{stats.redFlags}</div>
            <div className="text-sm text-muted-foreground">Red Flags</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-chart-2 mb-2">{stats.interventions}</div>
            <div className="text-sm text-muted-foreground">Interventions</div>
          </div>
        </div>

        {/* Quick Actions - Mobile Friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/create"
            className="flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            <span>Create Red Flag</span>
          </Link>
          <Link
            to="/create"
            className="flex items-center justify-center gap-2 p-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
          >
            <AlertCircle size={20} />
            <span>Create Intervention</span>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Report Type Distribution */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Report types</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData.typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {chartData.typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Report Status</h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {chartData.statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="redFlags" fill="hsl(var(--destructive))" name="Red Flags" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interventions" fill="hsl(var(--chart-2))" name="Interventions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Reports */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Recent Reports</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm"
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
            <div className="text-center py-8 text-muted-foreground">
              {userReports.length === 0 ? "No reports yet. Create your first report!" : "No reports match your filters."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.slice(0, 10).map((report, index) => (
                <div
                  key={report.id || index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewReportDetails(report)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        report.reportType === 'red-flag' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-chart-2/10 text-chart-2'
                      }`}>
                        {report.reportType === 'red-flag' ? 'Red Flag' : 'Intervention'}
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded text-white"
                        style={{ background: getStatusColor(report.status) }}
                      >
                        {getStatusBadge(report.status)}
                      </span>
                    </div>
                    <h4 className="font-medium truncate">{report.title || 'Untitled Report'}</h4>
                    <p className="text-sm text-muted-foreground truncate">{report.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 sm:mt-0 text-sm text-muted-foreground">
                    <span>📍 {report.location || 'N/A'}</span>
                    <span>📅 {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
