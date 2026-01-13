import { Flag, LogOut, Grid3x3, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import MapPicker from "@/components/MapPicker";
import { storage } from "@/utils/storage";
import { api } from "@/services/api";
 
export default function CreateReport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("id");
  const typeParam = searchParams.get("type") as
    | "red-flag"
    | "intervention"
    | null;

  const currentUser = storage.getCurrentUser();
  const [reportType, setReportType] = useState<"red-flag" | "intervention">(
    typeParam || "red-flag"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(0.3476);
  const [longitude, setLongitude] = useState(32.5825);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);



useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    if (reportId) {
      
      (async () => {
        try {
          const resp =
            reportType === "red-flag"
              ? await api.getRedFlag(reportId)
              : await api.getIntervention(reportId);
          if (
            resp &&
            resp.status === 200 &&
            resp.data &&
            resp.data.length > 0
          ) {
            const item = resp.data[0];
            
            setTitle(item.title || "");
            setDescription(item.description || "");
            setLatitude(item.latitude ? parseFloat(item.latitude) : latitude);
            setLongitude(
              item.longitude ? parseFloat(item.longitude) : longitude
            );

            
            const API_BASE = (
              import.meta.env.VITE_API_URL || "http://localhost:3000/api"
            ).replace(/\/api$/, "");
            if (item.images && item.images.length > 0) {
              setImagePreview(`${API_BASE}/uploads/${item.images[0]}`);
            } else if (item.videos && item.videos.length > 0) {
              setImagePreview(`${API_BASE}/uploads/${item.videos[0]}`);
            }
          }
        } catch (err) {
          console.error("Failed to load report", err);
        }
      })();
    }
  }, [reportId]);

  const handleLogout = () => {
    storage.clearCurrentUser();
    navigate("/");
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleImageChange = (selected: File[]) => {
    setFiles(selected);

    
    const firstImage = selected.find((f) => f.type.startsWith("image/"));
    if (firstImage) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(firstImage);
      return;
    }

    
    const firstVideo = selected.find((f) => f.type.startsWith("video/"));
    if (firstVideo) {
    
      const url = URL.createObjectURL(firstVideo);
      setImagePreview(url);
      return;
    }

    setImagePreview("");
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    handleImageChange(updated);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    
    console.log(
      "🔄 SUBMITTING - reportId:",
      reportId,
      "files count:",
      files.length,
      "type:",
      reportType
    );

    if (!title || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    
    // Prepare files
    const allFiles = [...files];

    const payload = {
      title,
      description,
      latitude,
      longitude,
    };

    setIsLoading(true);
    (async () => {
      try {
        let resp: any;

        
        if (reportType === "red-flag") {
          resp = reportId
            ? await api.updateRedFlag(reportId, payload, allFiles)
            : await api.createRedFlag(payload, allFiles);
        } else {
          resp = reportId
            ? await api.updateIntervention(reportId, payload, allFiles)
            : await api.createIntervention(payload, allFiles);
        }

        console.log("✅ API Response:", resp);

        if (resp?.status === 201 || resp?.status === 200) {
          toast({
            title: reportId ? "Report updated" : "Report created",
            description: `Your ${reportType} has been ${
              reportId ? "updated" : "submitted"
            } successfully.`,
          });

          setTimeout(() => {
            setIsLoading(false);
            navigate(
              reportType === "red-flag" ? "/red-flags" : "/interventions"
            );
          }, 800);
        } else {
          setIsLoading(false);
          toast({
            title: "Error",
            description: resp?.message || "Failed to save report",
            variant: "destructive",
          });
        }
      } catch (err) {
        setIsLoading(false);
        console.error("Create report error", err);
        toast({
          title: "Error",
          description: "Server error while creating report",
          variant: "destructive",
        });
      }
    })();
  };

  return (
    <div className="page-create">
      <aside className="page-aside">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Flag className="text-primary-foreground" size={20} />
          </div>
          <h1 className="sidebar-title">iReporter</h1>
        </div>

        <nav className="sidebar-nav" style={{ marginTop: "2rem" }}>
          <Link to="/dashboard" className="nav-link">
            <Grid3x3 size={20} />
            <span>Dashboard</span>
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
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h2 className="text-3xl font-semibold">
            {reportId ? "Edit" : "Create"} Report
          </h2>

          <div className="flex items-center gap-3">
            <span>
              {currentUser?.first_name} {currentUser?.last_name}
            </span>
            <div
              className="brand-icon"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <span>{`${currentUser?.first_name?.[0] || ""}${
                currentUser?.last_name?.[0] || ""
              }`}</span>
            </div>
          </div>
        </div>

        <div
          className="bg-card record-card"
          style={{ borderRadius: "1rem", padding: "2rem", maxWidth: "50rem" }}
        >
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="record-type-selector">
              <Label className="muted-foreground mb-3 block">Type</Label>
              {typeParam ? (
                <div
                  className={`record-type ${
                    reportType === "red-flag"
                      ? "badge-destructive"
                      : "badge-secondary"
                  }`}
                  style={{
                    borderRadius: "1rem",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                    border: "2px solid hsl(var(--primary))",
                    cursor: "default",
                  }}
                >
                  {reportType === "red-flag" ? (
                    <Flag size={24} />
                  ) : (
                    <Plus size={24} />
                  )}
                  <span className="font-medium">
                    {reportType === "red-flag" ? "Red Flag" : "Intervention"}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setReportType("red-flag")}
                    className={`record-type ${
                      reportType === "red-flag"
                        ? "badge-destructive"
                        : "badge-secondary"
                    }`}
                    style={{
                      borderRadius: "1rem",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                      border: "2px solid transparent",
                    }}
                  >
                    <Flag size={24} />
                    <span className="font-medium">Red Flag</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportType("intervention")}
                    className={`record-type ${
                      reportType === "intervention"
                        ? "badge-secondary"
                        : "badge-secondary"
                    }`}
                    style={{
                      borderRadius: "1rem",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                      border:
                        reportType === "intervention"
                          ? "2px solid hsl(var(--primary))"
                          : "2px solid transparent",
                    }}
                  >
                    <Plus size={24} />
                    <span className="font-medium">Intervention</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title" className="muted-foreground">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter title"
                className="input-with-margin"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="muted-foreground">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                className="input-with-margin"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <div>
                  <Label
                    htmlFor="latitude"
                    className="text-xs muted-foreground"
                  >
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="input-with-margin"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="longitude"
                    className="text-xs muted-foreground"
                  >
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="input-with-margin"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="muted-foreground">
                Upload Media (Max 2 files)
              </Label>
              <div
                style={{
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                {files.length > 0 && (
                  <span>
                    {files.length}/2 file{files.length !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                )}
              </div>
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  const selected = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  if (selected.length === 0) return;

                  
                  const existing = files || [];
                  const merged: File[] = [...existing];

                  selected.forEach((f) => {
                    const exists = merged.some(
                      (m) => m.name === f.name && m.size === f.size
                    );
                    if (!exists) merged.push(f);
                  });

                  if (merged.length > 2) {
                    toast({
                      title: "Warning",
                      description: "Maximum 2 files allowed",
                      variant: "destructive",
                    });
                    
                    (e.currentTarget as HTMLInputElement).value = "";
                    return;
                  }

                  handleImageChange(merged);
                  
                  (e.currentTarget as HTMLInputElement).value = "";
                }}
                className="input-with-margin"
              />
              {files.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: "1 1 calc(50% - 0.5rem)",
                        minWidth: "200px",
                        position: "relative",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {file.type.startsWith("video/") ? (
                          <video
                            src={URL.createObjectURL(file)}
                            controls
                            style={{ width: "100%", borderRadius: "0.5rem" }}
                          />
                        ) : file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            style={{ width: "100%", borderRadius: "0.5rem" }}
                          />
                        ) : null}
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          style={{
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            background: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "2rem",
                            height: "2rem",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(0, 0, 0, 0.8)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(0, 0, 0, 0.6)")
                          }
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.75rem",
                          color: "hsl(var(--muted-foreground))",
                          wordBreak: "break-word",
                        }}
                      >
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>



            <div
              style={{ display: "flex", gap: "1rem" }}
              className="form-buttons-section"
            >
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : reportId
                  ? "UPDATE REPORT"
                  : "CREATE REPORT"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
