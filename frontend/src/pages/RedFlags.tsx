import {
  Flag,
  Edit,
  Trash2,
  Home,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  TrendingUp,
  Download,
  FileText,
  FileSpreadsheet,
  Plus,
  MessageSquare,
  Heart,
  Share2,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Report } from "@/types/report";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import MapPicker from "@/components/MapPicker";
import { useUser } from "@/contexts/UserContext";
import Sidebar from "@/components/Sidebar";
import { getGreeting } from "@/utils/greetingUtils";
import { UpvoteButton } from "@/components/UpvoteButton";
import { CommentsSection } from "@/components/CommentsSection";
import { ShareReport } from "@/components/ShareReport";
import { AdvancedSearch, SearchFilters } from "@/components/AdvancedSearch";



export default function RedFlags() {
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    resolved: 0,
    unresolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<{
    id?: string;
    lat: number;
    lng: number;
    open: boolean;
  } | null>(null);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [shareReport, setShareReport] = useState<{
    id: string;
    type: 'red-flag' | 'intervention';
    title: string;
  } | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    type: '',
    sortBy: 'newest',
    sortOrder: 'desc',
    hasImages: false,
    hasComments: false,
    minUpvotes: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [showCharts, setShowCharts] = useState(false);


  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const FILE_BASE = API_URL.replace(/\/api$/, "");

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }
    loadReports();
    generateChartData();
  }, [currentUser]);

  const loadReports = async () => {
    try {
      setLoading(true);
      console.log('Loading red flags...');
      const response = await api.getRedFlags();
      console.log('Red Flags API response:', response);

      if (response.status === 200 && response.data) {
        console.log('Red Flags data:', response.data);
        try {
          const mappedReports = response.data.map((item: any) => ({
            id: item.id.toString(),
            type: "red-flag" as const,
            title: item.title,
            description: item.description,
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            status: item.status
              .toUpperCase()
              .replace("-", " ") as Report["status"],
            userId: item.user_id.toString(),
            userName: `${item.first_name} ${item.last_name}`,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            images: item.images || [],
            videos: item.videos || [],
            audio: item.audio || [],
          }));

          console.log('Mapped red flags:', mappedReports);
          setReports(mappedReports);

          const resolved = mappedReports.filter(
            (r: Report) => r.status === "RESOLVED"
          ).length;
          const unresolved = mappedReports.filter(
            (r: Report) =>
              r.status === "DRAFT" || r.status === "UNDER INVESTIGATION"
          ).length;
          const rejected = mappedReports.filter(
            (r: Report) => r.status === "REJECTED"
          ).length;
          setStats({ resolved, unresolved, rejected });
        } catch (mapError) {
          console.error('Error mapping red flags data:', mapError);
          toast({
            title: "Error",
            description: "Failed to process red flags data",
            variant: "destructive",
          });
        }
      } else {
        console.error('Invalid response:', response);
        toast({
          title: "Error",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading red flags:', error);
      toast({
        title: "Error",
        description: "Failed to load red flags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort reports based on filters
  const filteredReports = reports
    .filter(report => {
      const matchesStatus = statusFilter === "" || report.status === statusFilter;
      return matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const handleDelete = async (reportId: string, status: string) => {
    if (status !== "DRAFT") {
      toast({
        title: "Error",
        description: "Cannot delete report - status has been changed by admin",
        variant: "destructive",
      });
      return;
    }
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await api.deleteRedFlag(reportId);
        toast({
          title: "Success",
          description: "Red flag deleted successfully",
        });
        loadReports();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete red flag",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (reportId: string, status: string) => {
    if (status !== "DRAFT") {
      alert("Cannot edit report - status has been changed by admin");
      return;
    }
    navigate(`/create?id=${reportId}&type=red-flag`);
  };

  const openLocationEditor = (report: Report) => {
    if (report.status !== "DRAFT") {
      toast({
        title: "Error",
        description: "Cannot update location - status changed",
        variant: "destructive",
      });
      return;
    }
    setEditingLocation({
      id: report.id,
      lat: report.latitude,
      lng: report.longitude,
      open: true,
    });
  };

  const saveLocation = async () => {
    if (!editingLocation?.id) return;
    try {
      const resp = await api.updateRedFlagLocation(
        editingLocation.id,
        editingLocation.lat,
        editingLocation.lng
      );
      if (resp.status >= 400) {
        toast({
          title: "Error",
          description: resp.message || "Failed to update location",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Success", description: "Location updated" });
      setEditingLocation(null);
      loadReports();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        "Report ID",
        "Title",
        "Description",
        "Status",
        "Latitude",
        "Longitude",
        "Created Date",
        "Updated Date",
        "User Name",
        "Images Count",
        "Videos Count"
      ];

      const csvData = filteredReports.map(report => [
        report.id,
        report.title,
        report.description.replace(/"/g, '""'), // Escape quotes
        report.status,
        report.latitude,
        report.longitude,
        new Date(report.createdAt).toLocaleDateString(),
        new Date(report.updatedAt).toLocaleDateString(),
        report.userName,
        report.images?.length || 0,
        report.videos?.length || 0,
        report.audio?.length || 0
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(field => `"${field}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `red-flags-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "CSV report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const generateChartData = () => {
    // Bar chart data for status distribution
    const statusData = [
      { name: 'Resolved', value: stats.resolved, color: '#10b981' },
      { name: 'Unresolved', value: stats.unresolved, color: '#f59e0b' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    ];
    setChartData(statusData);

    // Pie chart data for status percentages
    const total = stats.resolved + stats.unresolved + stats.rejected;
    const pieChartData = [
      { name: 'Resolved', value: stats.resolved, percentage: total > 0 ? ((stats.resolved / total) * 100).toFixed(1) : 0, color: '#10b981' },
      { name: 'Unresolved', value: stats.unresolved, percentage: total > 0 ? ((stats.unresolved / total) * 100).toFixed(1) : 0, color: '#f59e0b' },
      { name: 'Rejected', value: stats.rejected, percentage: total > 0 ? ((stats.rejected / total) * 100).toFixed(1) : 0, color: '#ef4444' },
    ];
    setPieData(pieChartData);

    // Line chart data for reports over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const lineChartData = last7Days.map(date => {
      const dayReports = reports.filter(report =>
        new Date(report.createdAt).toISOString().split('T')[0] === date
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reports: dayReports.length,
        resolved: dayReports.filter(r => r.status === 'RESOLVED').length,
        unresolved: dayReports.filter(r => r.status === 'DRAFT' || r.status === 'UNDER INVESTIGATION').length,
      };
    });
    setLineData(lineChartData);
  };

  const exportToPDF = async () => {
    try {
      // Create a simple HTML template for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Red Flags Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-resolved { color: #16a34a; font-weight: bold; }
            .status-other { color: #dc2626; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>iReporter - Red Flags Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Reports: ${filteredReports.length}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.resolved}</div>
              <div class="stat-label">Resolved</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.unresolved}</div>
              <div class="stat-label">Unresolved</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.rejected}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Location</th>
                <th>Created</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReports.map(report => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.title}</td>
                  <td>${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</td>
                  <td class="${report.status === 'RESOLVED' ? 'status-resolved' : 'status-other'}">${report.status}</td>
                  <td>${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</td>
                  <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>${report.userName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Report generated by iReporter System</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `red-flags-report-${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "PDF report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };
  const displayName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : "";
  const initials = `${currentUser?.first_name?.[0] || ""}${
    currentUser?.last_name?.[0] || ""
  }`;
  return (
    <div className="page-dashboard min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              to="/dashboard"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home size={16} className="mr-1" />
              Dashboard
            </Link>
            <ChevronRight size={16} />
            <span className="text-foreground font-medium">Red Flags</span>
          </nav>
        </div>

        <div className="page-header">
          <div className="flex-1">
            {/* Personalized Greeting */}
            <div className="mb-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock size={16} />
                <span className="text-sm">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {getGreeting(currentUser?.first_name || 'User')}
              </h1>
            </div>

            <div className="page-subtitle">
              <Flag size={20} className="text-red-500" />
              <span>Red Flags Management</span>
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground">My Red Flags</h2>
          </div>

          {/* Enhanced User Profile Section */}
          <div className="flex items-center gap-4" style={{ marginTop: '-6rem' }}>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-foreground">{displayName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User size={12} />
                Citizen Reporter
              </div>
            </div>
            <div
              className="brand-icon relative"
              style={{
                width: "3rem",
                height: "3rem",
                overflow: "hidden",
                borderRadius: "50%",
                border: "2px solid hsl(var(--border))",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              {currentUser?.profile_picture ? (
                <img
                  src={`${FILE_BASE}${currentUser.profile_picture}`}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">{initials}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
          </div>
        </div>
        {/* Enhanced Stats Dashboard */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Report Statistics</h3>
          <div className="cards-grid">
            {/* Resolved Stats Card */}
            <div className="stat-card group hover:shadow-lg transition-all duration-300 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12%
                </div>
              </div>
              <div className="stat-value text-green-700 dark:text-green-300 text-3xl font-bold mb-1">
                {stats.resolved}
              </div>
              <div className="stat-label text-green-800 dark:text-green-200 font-medium">Resolved Red Flags</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                Successfully addressed
              </div>
            </div>

            {/* Unresolved Stats Card */}
            <div className="stat-card group hover:shadow-lg transition-all duration-300 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center justify-between mb-3">
                <ClockIcon className="w-8 h-8 text-blue-600" />
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5%
                </div>
              </div>
              <div className="stat-value text-blue-700 dark:text-blue-300 text-3xl font-bold mb-1">
                {stats.unresolved}
              </div>
              <div className="stat-label text-blue-800 dark:text-blue-200 font-medium">Unresolved Red Flags</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Draft or Under Investigation
              </div>
            </div>

            {/* Rejected Stats Card */}
            <div className="stat-card group hover:shadow-lg transition-all duration-300 border border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <div className="flex items-center justify-between mb-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  -3%
                </div>
              </div>
              <div className="stat-value text-red-700 dark:text-red-300 text-3xl font-bold mb-1">
                {stats.rejected}
              </div>
              <div className="stat-label text-red-800 dark:text-red-200 font-medium">Rejected Red Flags</div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                Not approved for review
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="UNDER INVESTIGATION">Under Investigation</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(true)}
              className="px-3 py-2"
            >
              <Filter size={16} className="mr-2" />
              Advanced Search
            </Button>
          </div>
        </div>

        {/* Analytics Toggle Button */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => navigate("/create?type=red-flag")}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Plus size={20} className="mr-2" />
            Create Red Flag
          </Button>
          <Button
            onClick={() => setShowCharts(!showCharts)}
            variant="outline"
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            {showCharts ? <BarChart3 size={20} className="mr-2" /> : <Activity size={20} className="mr-2" />}
            {showCharts ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
        </div>

        {/* Interactive Charts Section */}
        {showCharts && (
          <div className="mb-8 space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Analytics Dashboard</h3>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Status Distribution */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-medium mb-4 text-foreground flex items-center gap-2">
                  <BarChart3 size={20} />
                  Status Distribution
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Status Percentages */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-medium mb-4 text-foreground flex items-center gap-2">
                  <PieChart size={20} />
                  Status Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart - Reports Over Time */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-medium mb-4 text-foreground flex items-center gap-2">
                <LineChart size={20} />
                Reports Trend (Last 7 Days)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="reports" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="resolved" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {loading ? (
          <div className="space-y-6">
            {/* Skeleton Loading Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="record-card animate-pulse">
                <div className="record-body">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-muted rounded w-24"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <Flag size={48} className="mx-auto mb-4 opacity-50" />
            <p className="muted-foreground">
              No red flags yet. Create your first report!
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredReports.map((report) => (
              <div key={report.id} className="record-card hover:shadow-lg transition-all duration-300 group">
                <div className="record-body">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-5 text-red-500" />
                      <span className="record-badge badge-destructive">Red Flag</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === "RESOLVED" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      report.status === "UNDER INVESTIGATION" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                      report.status === "REJECTED" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}>
                      {report.status === "UNDER INVESTIGATION" ? "Under Review" : report.status}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {report.title}
                  </h4>

                  {/* Content Section */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground mb-1"><strong>Report ID:</strong> {report.id}</p>
                      <p className="text-sm text-muted-foreground mb-2"><strong>Description:</strong></p>
                      <p className="text-sm text-foreground line-clamp-2">{report.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>📍 Lat: {report.latitude.toFixed(4)}, Lon: {report.longitude.toFixed(4)}</span>
                      <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Media Section */}
                  {report.images && report.images.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {report.images.slice(0, 2).map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={`${FILE_BASE}/uploads/${img}`}
                            alt={`${report.title} ${idx + 1}`}
                            className="record-image rounded-lg border border-border"
                          />
                        ))}
                        {report.images.length > 2 && (
                          <div className="bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                            +{report.images.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Actions Section */}
                  <div className="flex gap-2 pt-4 pb-2 px-2 border-t border-border bg-muted/30 rounded-b-lg">
                    <UpvoteButton
                      reportType="red_flag"
                      reportId={report.id}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowComments(true);
                      }}
                      className="flex-1 text-xs px-3 py-2 h-9"
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Comments
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShareReport({ id: report.id, type: 'red-flag', title: report.title })}
                      className="flex-1 text-xs px-3 py-2 h-9"
                    >
                      <Share2 size={14} className="mr-1" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(report.id, report.status)}
                      disabled={report.status !== "DRAFT"}
                      className="flex-1 text-xs px-3 py-2 h-9"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(report.id, report.status)}
                      disabled={report.status !== "DRAFT"}
                      className="flex-1 text-xs px-3 py-2 h-9 opacity-100"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {editingLocation && editingLocation.open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 60,
            }}
            onClick={() => setEditingLocation(null)}
          >
            <div
              className="bg-card"
              style={{
                width: "90%",
                maxWidth: "800px",
                padding: "1.5rem",
                borderRadius: "0.75rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">Update Location</h3>
              <MapPicker
                latitude={editingLocation.lat}
                longitude={editingLocation.lng}
                onLocationChange={(lat, lng) =>
                  setEditingLocation({ ...editingLocation, lat, lng })
                }
              />
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => setEditingLocation(null)}
                >
                  Cancel
                </Button>
                <Button onClick={saveLocation}>Save Location</Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments Modal */}
        {showComments && selectedReport && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComments(false)}
          >
            <div
              className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Comments for "{selectedReport.title}"</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <CommentsSection
                  reportType="red_flag"
                  reportId={selectedReport.id}
                />
              </div>
            </div>
          </div>
        )}

        {/* Share Report Modal */}
        {shareReport && (
          <ShareReport
            reportId={shareReport.id}
            reportType={shareReport.type}
            reportTitle={shareReport.title}
            isOpen={!!shareReport}
            onClose={() => setShareReport(null)}
          />
        )}

        {/* Advanced Search Modal */}
        {showAdvancedSearch && (
          <AdvancedSearch
            onSearch={(filters) => {
              setSearchFilters(filters);
              setShowAdvancedSearch(false);
              // Apply filters to reports
              loadReports();
            }}
            onClose={() => setShowAdvancedSearch(false)}
          />
        )}
      </main>
    </div>
  );
}
