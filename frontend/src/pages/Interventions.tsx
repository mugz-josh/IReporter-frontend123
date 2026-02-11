import {
  Flag,
  Edit,
  Trash2,
  Home,
  ChevronRight,
  Clock,
  User,
  Plus,
  Share2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Report } from "@/types/report";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import MapPicker from "@/components/MapPicker";
import { useUser } from "@/contexts/UserContext";
import Sidebar from  "@/components/Sidebar";
import { getGreeting } from "@/utils/greetingUtils";
import { ShareReport } from "@/components/ShareReport";
import { CommentsSection } from "@/components/CommentsSection";
import { UpvoteButton } from "@/components/UpvoteButton";


export default function Interventions() {
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
  const [shareReport, setShareReport] = useState<{
    id: string;
    type: 'red-flag' | 'intervention';
    title: string;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const FILE_BASE = API_URL.replace(/\/api$/, "");

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }
    loadReports();
  }, [currentUser]);

  const loadReports = async () => {
    try {
      setLoading(true);
      console.log('Loading interventions...');
      const response = await api.getInterventions();
      console.log('Interventions API response:', response);

      if (response.status === 200 && response.data) {
        console.log('Interventions data:', response.data);
        try {
          const mappedReports = response.data.map((item: any) => ({
            id: item.id.toString(),
            type: "intervention" as const,
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

          }));

          console.log('Mapped interventions:', mappedReports);
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
          console.error('Error mapping interventions data:', mapError);
          toast({
            title: "Error",
            description: "Failed to process interventions data",
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
      console.error('Error loading interventions:', error);
      toast({
        title: "Error",
        description: "Failed to load interventions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        await api.deleteIntervention(reportId);
        toast({
          title: "Success",
          description: "Intervention deleted successfully",
        });
        loadReports();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete intervention",
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
    navigate(`/create?id=${reportId}&type=intervention`);
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
      const resp = await api.updateInterventionLocation(
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
            <span className="text-foreground font-medium">Interventions</span>
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
              <Plus size={20} className="text-blue-500" />
              <span>Interventions Management</span>
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground">My Interventions</h2>
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

        <div className="cards-grid mb-10">
          <div className="stat-card">
            <div className="stat-value" style={{ color: "hsl(142, 76%, 36%)" }}>
              {stats.resolved}
            </div>
            <div className="stat-label">Resolved Interventions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "hsl(221, 83%, 53%)" }}>
              {stats.unresolved}
            </div>
            <div className="stat-label">Unresolved Interventions</div>
            <div className="text-xs muted-foreground mt-1">
              (Draft or Under Investigation)
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "hsl(0, 84%, 60%)" }}>
              {stats.rejected}
            </div>
            <div className="stat-label">Rejected Interventions</div>
          </div>
        </div>

        <Button
          onClick={() => navigate("/create?type=intervention")}
          className="mb-6"
        >
          <Plus size={20} />
          Create Intervention
        </Button>

        {loading ? (
          <div className="text-center py-12">
            <p className="muted-foreground">Loading interventions...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <Plus size={48} className="mx-auto mb-4 opacity-50" />
            <p className="muted-foreground">
              No interventions yet. Create your first report!
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {reports.map((report) => (
              <div key={report.id} className="record-card hover:shadow-lg transition-all duration-300 group">
                <div className="record-body">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-500" />
                      <span className="record-badge badge-secondary">Intervention</span>
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
                  {(report as any).images && (report as any).images.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {(report as any).images.slice(0, 2).map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={`${FILE_BASE}/uploads/${img}`}
                            alt={`${report.title} ${idx + 1}`}
                            className="record-image rounded-lg border border-border"
                          />
                        ))}
                        {(report as any).images.length > 2 && (
                          <div className="bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                            +{(report as any).images.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  <div className="flex gap-2 mt-4 pt-4 pb-2 px-2 border-t border-border bg-muted/30 rounded-b-lg">
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
                      onClick={() => handleEdit(report.id, report.status)}
                      disabled={report.status !== "DRAFT"}
                      className="flex-1 text-xs px-3 py-2 h-9"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShareReport({ id: report.id, type: 'intervention', title: report.title })}
                      className="flex-1 text-xs px-3 py-2 h-9"
                    >
                      <Share2 size={14} className="mr-1" />
                      Share
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
                  reportType="intervention"
                  reportId={selectedReport.id}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
