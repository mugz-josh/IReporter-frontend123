import { Flag, LogOut, Grid3x3, Plus, Menu, X, Edit } from "lucide-react";
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
    <div className="page-dashboard">
      {/* Welcome Animation */}
      <div className="welcome-animation" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'hsl(var(--background))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeOut 2s ease-in-out 1s forwards'
      }}>
        <div style={{
          textAlign: 'center',
          animation: 'slideIn 0.8s ease-out'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--destructive)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
          <h2 style={{
            color: 'hsl(var(--foreground))',
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {currentUser?.first_name}!
          </h2>
          <p style={{
            color: 'hsl(var(--muted-foreground))',
            fontSize: '1rem'
          }}>
            Ready to make a difference today?
          </p>
        </div>
      </div>

      <style >{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
        @keyframes slideIn {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

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
          <h1 className="sidebar-title">iReporter</h1>
        </div>

        <nav className="sidebar-nav" style={{ marginTop: "2rem" }}>
          <Link to="/dashboard" className="nav-link nav-link-active">
            <Grid3x3 size={20} />
            <span>My reports</span>
          </Link>

          <Link to="/red-flags" className="nav-link">
            <Flag size={20} />
            <span>Red Flags</span>
          </Link>

          <Link to="/interventions" className="nav-link">
            <Plus size={20} />
            <span>Interventions</span>
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

        <div
          style={{
            marginTop: "auto",
            padding: "1rem",
            borderTop: "1px solid hsl(var(--border))",
          }}
        >
          {/* User Profile Section */}
          {currentUser && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  className="brand-icon"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid hsl(var(--border))",
                  }}
                >
                  {currentUser.profile_picture ? (
                    <img
                      src={`${(import.meta.env.VITE_API_URL || "http://localhost:3000").replace('/api', '')}${currentUser.profile_picture}`}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "hsl(var(--primary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "hsl(var(--primary-foreground))",
                        fontWeight: "bold",
                      }}
                    >
                      {`${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "hsl(var(--foreground))",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {`${currentUser.first_name} ${currentUser.last_name}`}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    Citizen Reporter
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem" }}>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <div className="page-subtitle">
              <Grid3x3 size={20} />
              <span>Overview</span>
            </div>
            <h2 className="text-2xl font-semibold">My Reports</h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <span>
              {currentUser?.first_name} {currentUser?.last_name}
            </span>
            <button
              onClick={handleEditProfile}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "hsl(var(--muted-foreground))",
                padding: "0.25rem",
                borderRadius: "0.25rem",
              }}
              title="Edit Profile"
            >
              <Edit size={16} />
            </button>
            <div
              className="brand-icon"
              style={{ width: "2.5rem", height: "2.5rem", overflow: "hidden", borderRadius: "50%" }}
            >
              {currentUser?.profile_picture ? (
                <img
                  src={`${(import.meta.env.VITE_API_URL || "http://localhost:3000").replace('/api', '')}${currentUser.profile_picture}`}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // Hide broken image and show fallback
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                style={{
                  display: currentUser?.profile_picture ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {`${currentUser?.first_name?.[0] || ""}${
                  currentUser?.last_name?.[0] || ""
                }`}
              </span>
            </div>
          </div>

          {showProfileModal && (
            <div
              className="profile-edit-modal"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                className="profile-edit-content"
                style={{
                  background: "hsl(var(--background))",
                  padding: "2rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  maxWidth: "400px",
                  width: "100%",
                  margin: "1rem",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1.5rem",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  Edit Profile
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          first_name: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        fontSize: "0.875rem",
                      }}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          last_name: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        fontSize: "0.875rem",
                      }}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        fontSize: "0.875rem",
                      }}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfilePictureFile(file);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        fontSize: "0.875rem",
                      }}
                    />
                    {profilePictureFile && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <p style={{ fontSize: "0.75rem", marginBottom: "0.25rem", color: "hsl(var(--muted-foreground))" }}>
                          Selected: {profilePictureFile.name}
                        </p>
                        <img
                          src={URL.createObjectURL(profilePictureFile)}
                          alt="Profile preview"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "2px solid hsl(var(--border))"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "hsl(var(--muted))",
                      color: "hsl(var(--muted-foreground))",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cards-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div
              className="stat-value"
              style={{ color: "hsl(var(--primary))" }}
            >
              {stats.total}
            </div>
            <div className="stat-label">Total Reports</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-value"
              style={{ color: "hsl(var(--destructive))" }}
            >
              {stats.redFlags}
            </div>
            <div className="stat-label">Red Flags</div>
          </div>

          <div className="stat-card">
            <div
              className="stat-value"
              style={{ color: "hsl(var(--chart-2))" }}
            >
              {stats.interventions}
            </div>
            <div className="stat-label">Interventions</div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
              Analytics Overview
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={loadStats}
                style={{
                  padding: "0.5rem 1rem",
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                🔄 Refresh
              </button>
              {currentUser?.is_admin && (
                <button
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "hsl(var(--destructive))",
                    color: "hsl(var(--destructive-foreground))",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: loadingUsers ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    opacity: loadingUsers ? 0.6 : 1
                  }}
                >
                  👥 {loadingUsers ? "Loading..." : "Load Users"}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
            {/* Report Type Distribution Pie Chart */}
            <div
              className="stat-card"
              style={{
                padding: "1.5rem",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
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
                  Report Types
                </h4>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                  {stats.total} total
                </div>
              </div>
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
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {chartData.typeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--popover-foreground))"
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} reports (${((value / stats.total) * 100).toFixed(1)}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                {chartData.typeDistribution.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: item.color
                      }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution Pie Chart */}
            <div
              className="stat-card"
              style={{
                padding: "1.5rem",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer"
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
                  Report Status
                </h4>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                  {stats.total} total
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
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {chartData.statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--popover-foreground))"
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} reports (${stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : 0}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", marginTop: "1rem" }}>
                {chartData.statusDistribution.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: item.color
                      }}
                    />
                    <span style={{ fontSize: "0.7rem", color: "hsl(var(--muted-foreground))" }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend Bar Chart */}
            <div
              className="stat-card"
              style={{
                padding: "1.5rem",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                gridColumn: "1 / -1",
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
                  Monthly Report Trends
                </h4>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                  Last 6 months
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={chartData.monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--popover-foreground))"
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} ${name.toLowerCase()}`,
                      name
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "1rem" }}
                  />
                  <Bar
                    dataKey="redFlags"
                    fill="hsl(var(--destructive))"
                    name="Red Flags"
                    radius={[4, 4, 0, 0]}
                
                
                    animationBegin={400}
                    animationDuration={1200}
                  />
                  <Bar
                    dataKey="interventions"
                    fill="hsl(var(--chart-2))"
                    name="Interventions"
                    radius={[4, 4, 0, 0]}
                    animationBegin={600}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Report History Section */}
          <div style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                Report History
                
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.375rem",
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    fontSize: "0.875rem",
                    width: "200px"
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px soli for real and for sure pleaser(--border))",
                    borderRadius: "0.375rem",
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    fontSize: "0.875rem"
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="underinvestigation">Under Investigation</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.375rem",
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    fontSize: "0.875rem"
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="red-flag">Red Flags</option>
                  <option value="intervention">Interventions</option>
                </select>
              </div>
            </div>

            <div style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              overflow: "hidden"
            }}>
              {filteredReports.length === 0 ? (
                <div style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "hsl(var(--muted-foreground))"
                }}>
                  {userReports.length === 0 ? "No reports found. Create your first report!" : "No reports match your filters."}
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredReports.map((report, index) => (
                    <div
                      key={report.id || index}
                      style={{
                        padding: "1rem",
                        borderBottom: index < filteredReports.length - 1 ? "1px solid hsl(var(--border))" : "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease"
                      }}
                      onClick={() => handleViewReportDetails(report)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "hsl(var(--muted) / 0.5)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <span style={{
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              color: report.reportType === 'red-flag' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-2))',
                              textTransform: "uppercase",
                              letterSpacing: "0.05em"
                            }}>
                              {report.reportType === 'red-flag' ? 'Red Flag' : 'Intervention'}
                            </span>
                            <span style={{
                              fontSize: "0.75rem",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "0.25rem",
                              backgroundColor: getStatusColor(report.status),
                              color: "white",
                              fontWeight: "500"
                            }}>
                              {getStatusBadge(report.status)}
                            </span>
                          </div>
                          <h4 style={{
                            fontSize: "1rem",
                            fontWeight: "600",
                            color: "hsl(var(--foreground))",
                            marginBottom: "0.25rem"
                          }}>
                            {report.title || 'Untitled Report'}
                          </h4>
                          <p style={{
                            fontSize: "0.875rem",
                            color: "hsl(var(--muted-foreground))",
                            marginBottom: "0.5rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}>
                            {report.description || 'No description provided'}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                            <span>📍 {report.location || 'Location not specified'}</span>
                            <span>📅 {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Date unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Settings Section */}
          <div style={{ marginTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                Account Settings
              </h3>
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: "0.5rem 1rem",
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500"
                }}
              >
                Save Settings
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem"
            }}>
              <div style={{
                padding: "1.5rem",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem"
              }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "1rem" }}>
                  Notifications
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={userSettings.emailNotifications}
                      onChange={(e) => setUserSettings({...userSettings, emailNotifications: e.target.checked})}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))" }}>
                      Email notifications for status updates
                    </span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={userSettings.smsNotifications}
                      onChange={(e) => setUserSettings({...userSettings, smsNotifications: e.target.checked})}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))" }}>
                      SMS notifications for critical updates
                    </span>
                  </label>
                </div>
              </div>

              <div style={{
                padding: "1.5rem",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem"
              }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "1rem" }}>
                  Preferences
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>
                      Theme
                    </label>
                    <select
                      value={userSettings.theme}
                      onChange={(e) => setUserSettings({...userSettings, theme: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>
                      Language
                    </label>
                    <select
                      value={userSettings.language}
                      onChange={(e) => setUserSettings({...userSettings, language: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="sw">Kiswahili</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1.5rem"
          }}>
            <div style={{
              padding: "1rem",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(var(--primary))" }}>
                {stats.draft}
              </div>
              <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                Draft Reports
              </div>
            </div>
            <div style={{
              padding: "1rem",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(var(--chart-2))" }}>
                {stats.underInvestigation}
              </div>
              <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                Under Investigation
              </div>
            </div>
            <div style={{
              padding: "1rem",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(var(--chart-3))" }}>
                {stats.resolved}
              </div>
              <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                Resolved
              </div>
            </div>
            <div style={{
              padding: "1rem",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(var(--destructive))" }}>
                {stats.rejected}
              </div>
              <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                Rejected
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div
          className="report-details-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="report-details-content"
            style={{
              background: "hsl(var(--background))",
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              maxWidth: "600px",
              width: "100%",
              margin: "1rem",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "hsl(var(--foreground))" }}>
                Report Details
              </h3>
              <button
                onClick={handleCloseReportDetails}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "hsl(var(--muted-foreground))",
                  padding: "0.25rem",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  color: selectedReport.reportType === 'red-flag' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-2))',
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {selectedReport.reportType === 'red-flag' ? 'Red Flag' : 'Intervention'}
                </span>
                <span style={{
                  fontSize: "0.75rem",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "0.25rem",
                  backgroundColor: getStatusColor(selectedReport.status),
                  color: "white",
                  fontWeight: "500"
                }}>
                  {getStatusBadge(selectedReport.status)}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "600", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>
                  {selectedReport.title || 'Untitled Report'}
                </h4>
                <p style={{ color: "hsl(var(--muted-foreground))", lineHeight: "1.5" }}>
                  {selectedReport.description || 'No description provided'}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "hsl(var(--primary))", display: "block", marginBottom: "0.25rem" }}>
                    Location
                  </label>
                  <p style={{ color: "hsl(var(--foreground))" }}>
                    📍 {selectedReport.location || 'Location not specified'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "hsl(var(--primary))", display: "block", marginBottom: "0.25rem" }}>
                    Created Date
                  </label>
                  <p style={{ color: "hsl(var(--foreground))" }}>
                    📅 {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleDateString() : 'Date unknown'}
                  </p>
                </div>
              </div>

              {selectedReport.latitude && selectedReport.longitude && (
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "hsl(var(--primary))", display: "block", marginBottom: "0.25rem" }}>
                    Coordinates
                  </label>
                  <p style={{ color: "hsl(var(--foreground))", fontFamily: "monospace" }}>
                    {selectedReport.latitude}, {selectedReport.longitude}
                  </p>
                </div>
              )}

              {selectedReport.images && selectedReport.images.length > 0 && (
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "hsl(var(--primary))", display: "block", marginBottom: "0.5rem" }}>
                    Evidence Images
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.5rem" }}>
                    {selectedReport.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={`${(import.meta.env.VITE_API_URL || "http://localhost:3000").replace('/api', '')}${image}`}
                        alt={`Evidence ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "0.25rem",
                          border: "1px solid hsl(var(--border))"
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem" }}>
              <button
                onClick={handleCloseReportDetails}
                style={{
                  padding: "0.5rem 1rem",
                  background: "hsl(var(--muted))",
                  color: "hsl(var(--muted-foreground))",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
