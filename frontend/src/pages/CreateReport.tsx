import { Flag, LogOut, Grid3x3, Plus, MapPin, Menu, X, Mic, MicOff, Save, FileText, CheckCircle, Lightbulb, Upload, Clock, FileUp, Sparkles, AlertTriangle, Wrench, ChevronRight, RotateCcw } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(1);

  // Templates for common report types
  const templates = {
    "red-flag": [
      { title: "Bribery Report", description: "I witnessed a government official demanding a bribe in exchange for services that should be free. The official threatened to delay my application if I did not pay.", icon: AlertTriangle },
      { title: "Embezzlement", description: "There appears to be misappropriation of public funds in a local government project. The funds were allocated for road construction but the work was never completed.", icon: AlertTriangle },
      { title: "Favoritism/Nepotism", description: "Government contracts are being awarded to family members of officials without proper procurement processes.", icon: AlertTriangle },
      { title: "Illegal Fee Charging", description: "Public officials are charging illegal fees for services that should be provided free of charge.", icon: AlertTriangle }
    ],
    "intervention": [
      { title: "Pothole on Road", description: "There is a large pothole on the main road that has been there for several weeks. It poses a danger to vehicles and pedestrians.", icon: Wrench },
      { title: "Broken Street Lights", description: "The street lights have not been working for over a month in this area. It is very dark and unsafe at night.", icon: Wrench },
      { title: "Damaged Bridge", description: "The bridge is showing signs of structural damage and needs urgent inspection and repair.", icon: Wrench },
      { title: "Blocked Drainage", description: "The drainage system is blocked causing waterlogging during rainy season. This has led to flooding in nearby homes.", icon: Wrench }
    ]
  };

  // Live time counter effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Voice input handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: "Not Supported", description: "Voice input not supported in your browser", variant: "destructive" });
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(description + (description ? " " : "") + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
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
        title: "Missing Required Fields",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    const allFiles = [...files];

    const payload = {
      title,
      description,
      latitude,
      longitude,
    };

    setIsLoading(true);
    setIsSubmitting(true);
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
            title: reportId ? "Report Updated! 🎉" : "Report Submitted! 🎉",
            description: `Your ${reportType === 'red-flag' ? 'red flag' : 'intervention request'} has been ${reportId ? "updated" : "submitted"} successfully.`,
          });

          setTimeout(() => {
            setIsLoading(false);
            setIsSubmitting(false);
            navigate(
              reportType === "red-flag" ? "/red-flags" : "/interventions"
            );
          }, 1500);
        } else {
          setIsLoading(false);
          setIsSubmitting(false);
          toast({
            title: "Submission Failed",
            description: resp?.message || "Failed to save report. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        setIsLoading(false);
        setIsSubmitting(false);
        console.error("Create report error", err);
        toast({
          title: "Server Error",
          description: "An error occurred while creating your report. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index);
    setTitle(templates[reportType][index].title);
    setDescription(templates[reportType][index].description);
    setActiveSection(3);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="page-create">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {isSidebarOpen && (
        <div className="mobile-overlay show" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={"page-aside " + (isSidebarOpen ? "mobile-open" : "")}>
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
        {/* Enhanced Header */}
        <header className="page-header">
          <div className="page-header-content">
            <h2 className="page-title">
              {reportId ? (
                <>
                  <RotateCcw size={24} />
                  Edit Report
                </>
              ) : (
                <>
                  <Plus size={24} />
                  Create New Report
                </>
              )}
            </h2>
            <p className="page-subtitle">
              {reportType === "red-flag" 
                ? "Report corruption, bribery, or misconduct" 
                : "Request intervention for infrastructure issues"}
            </p>
          </div>

          <div className="header-actions-enhanced">
            {/* Live Time Display */}
            <div className="time-display">
              <Clock size={16} />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            
            {/* User Info */}
            <div className="user-info">
              <div className="user-avatar">
                {`${currentUser?.first_name?.[0] || ""}${
                  currentUser?.last_name?.[0] || ""
                }`}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser?.first_name} {currentUser?.last_name}</span>
                <span className="user-role">Citizen Reporter</span>
              </div>
            </div>
          </div>
        </header>

        {/* Form Container - Premium Styling */}
        <div className="create-report-container">
          <div className="create-report-form bg-card record-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              
              {/* Section 1: Report Type Selection */}
              <div className="form-section">
                <div className="form-section-header">
                  <Flag size={20} />
                  <h3>1. Select Report Type</h3>
                </div>
                
                <div className="record-type-selector">
                  <div className="record-type-container">
                    <button
                      type="button"
                      onClick={() => setReportType("red-flag")}
                      className={`record-type-card red-flag ${reportType === "red-flag" ? "selected" : ""}`}
                    >
                      <div className="record-type-icon">
                        <Flag size={28} />
                      </div>
                      <span className="record-type-label">Red Flag</span>
                      <span className="record-type-desc">Corruption & misconduct reports</span>
                      {reportType === "red-flag" && (
                        <div className="selected-indicator">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportType("intervention")}
                      className={`record-type-card intervention ${reportType === "intervention" ? "selected" : ""}`}
                    >
                      <div className="record-type-icon">
                        <Wrench size={28} />
                      </div>
                      <span className="record-type-label">Intervention</span>
                      <span className="record-type-desc">Infrastructure & public issues</span>
                      {reportType === "intervention" && (
                        <div className="selected-indicator">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Quick Templates */}
              <div className="form-section">
                <div className="form-section-header">
                  <Sparkles size={20} />
                  <h3>2. Quick Templates (Optional)</h3>
                </div>
                
                <div className="template-selector">
                  <div className="template-selector-label">
                    <Lightbulb size={18} />
                    <span>Choose a template to get started quickly</span>
                  </div>
                  <div className="template-grid">
                    {templates[reportType].map((template, index) => {
                      const IconComponent = template.icon;
                      return (
                        <button
                          key={index}
                          type="button"
                          className={`template-item ${selectedTemplate === index ? 'selected' : ''}`}
                          onClick={() => handleTemplateSelect(index)}
                        >
                          <div className="template-item-icon">
                            <IconComponent size={16} />
                          </div>
                          <div className="template-item-content">
                            <span className="template-item-title">{template.title}</span>
                            <span className="template-item-desc">{template.description.substring(0, 60)}...</span>
                          </div>
                          <ChevronRight size={16} className="template-item-arrow" />
                        </button>
                      );
                    })}
                  </div>
                  {selectedTemplate !== null && (
                    <button
                      type="button"
                      className="clear-template-btn"
                      onClick={clearTemplate}
                    >
                      <RotateCcw size={14} />
                      Clear template
                    </button>
                  )}
                </div>
              </div>

              {/* Section 3: Report Details */}
              <div className="form-section">
                <div className="form-section-header">
                  <FileText size={20} />
                  <h3>3. Report Details</h3>
                </div>

                {/* Title Input */}
                <div className="input-group">
                  <div className="input-label">
                    <Label htmlFor="title" className="input-label-text">
                      <FileText size={16} />
                      Title
                    </Label>
                    <span className="input-hint">Required *</span>
                  </div>
                  <div className="input-wrapper">
                    <Input
                      id="title"
                      placeholder="Enter a clear, descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Description Input with Voice */}
                <div className="input-group">
                  <div className="input-label">
                    <Label htmlFor="description" className="input-label-text">
                      <FileText size={16} />
                      Description
                    </Label>
                    <span className="input-hint">Required *</span>
                  </div>
                  <div className="textarea-wrapper">
                    <Textarea
                      id="description"
                      placeholder="Describe the incident or issue in detail. Include who, what, when, where, and any other relevant information..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="enhanced-textarea"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                  {isListening && (
                    <div className="voice-status">
                      <div className="voice-pulse"></div>
                      <span>🎤 Listening... Speak now</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Location */}
              <div className="form-section">
                <div className="form-section-header">
                  <MapPin size={20} />
                  <h3>4. Location</h3>
                </div>

                <div className="map-section">
                  <div className="map-header">
                    <h4>
                      <MapPin size={18} />
                      Select Location on Map
                    </h4>
                    <span className="input-hint">Click to pin location</span>
                  </div>
                  <div className="map-container">
                    <MapPicker
                      latitude={latitude}
                      longitude={longitude}
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                  
                  {/* Coordinates */}
                  <div className="coordinates-grid">
                    <div className="input-group">
                      <div className="input-label">
                        <Label htmlFor="latitude" className="input-label-text">
                          Latitude
                        </Label>
                      </div>
                      <div className="input-wrapper">
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-label">
                        <Label htmlFor="longitude" className="input-label-text">
                          Longitude
                        </Label>
                      </div>
                      <div className="input-wrapper">
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Media Upload */}
              <div className="form-section">
                <div className="form-section-header">
                  <Upload size={20} />
                  <h3>5. Evidence (Optional)</h3>
                </div>

                <div className="file-upload-section">
                  <div className="file-upload-header">
                    <h4>
                      <FileUp size={18} />
                      Upload Media
                    </h4>
                    {files.length > 0 && (
                      <span className="file-count">{files.length}/2 files</span>
                    )}
                  </div>
                  
                  <div className="upload-dropzone-enhanced">
                    <div className="upload-icon">
                      <Upload size={24} />
                    </div>
                    <span className="upload-text">
                      Drag & drop files here or click to browse
                    </span>
                    <span className="upload-hint">
                      Supports images and videos (max 2 files)
                    </span>
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
                            title: "File Limit Reached",
                            description: "Maximum 2 files allowed. Please remove some files first.",
                            variant: "destructive",
                          });
                          (e.currentTarget as HTMLInputElement).value = "";
                          return;
                        }

                        handleImageChange(merged);
                        (e.currentTarget as HTMLInputElement).value = "";
                      }}
                      className="file-input-hidden"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="file-preview-grid">
                      {files.map((file, idx) => (
                        <div key={idx} className="file-preview-item">
                          {file.type.startsWith("video/") ? (
                            <video
                              src={URL.createObjectURL(file)}
                              controls
                            />
                          ) : file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                            />
                          ) : null}
                          <div className="file-preview-overlay">
                            <span className="file-name">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="file-remove-btn"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="form-buttons-section">
                <Button 
                  type="submit" 
                  className={`btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing...
                    </>
                  ) : reportId ? (
                    <>
                      <Save size={18} />
                      UPDATE REPORT
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      CREATE REPORT
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                  className="btn-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
