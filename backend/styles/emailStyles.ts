export const emailConstants = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b'
  },
  urls: {
    logo: 'https://via.placeholder.com/150x50/2563eb/white?text=iReporter',
    dashboard: 'https://ireporter.vercel.app/dashboard',
    reports: 'https://ireporter.vercel.app/reports',
    contact: 'https://ireporter.vercel.app/contact',
    helpCenter: 'https://ireporter.vercel.app/help',
    privacyPolicy: 'https://ireporter.vercel.app/privacy',
    terms: 'https://ireporter.vercel.app/terms',
    adminPanel: 'https://ireporter.vercel.app/admin',
    reportDetails: 'https://ireporter.vercel.app/admin/reports',
    auditLogs: 'https://ireporter.vercel.app/admin/audit',
    userProfile: 'https://ireporter.vercel.app/admin/users',
    analytics: 'https://ireporter.vercel.app/admin/analytics',
    settings: 'https://ireporter.vercel.app/admin/settings',
    supportEmail: 'support@ireporter.com'
  }
};

export const getBaseStyles = (): string => {
  return `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
    }

    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    /* Header styles */
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }

    .header-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.1;
      background-image: radial-gradient(circle at 25% 25%, white 2px, transparent 2px);
      background-size: 20px 20px;
    }

    .logo-badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 15px;
      backdrop-filter: blur(10px);
    }

    .logo-container {
      margin-bottom: 20px;
    }

    .logo {
      height: 40px;
      width: auto;
    }

    .header-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .header-subtitle {
      font-size: 16px;
      opacity: 0.9;
    }

    .brand-tagline {
      font-size: 14px;
      opacity: 0.8;
      margin-top: 10px;
    }

    /* Content styles */
    .content {
      padding: 40px 30px;
    }

    .heading-primary {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .text-lead {
      font-size: 16px;
      color: #475569;
      margin-bottom: 24px;
    }

    .text-primary {
      color: #2563eb;
      font-weight: 600;
    }

    .mb-2 { margin-bottom: 8px; }
    .mb-4 { margin-bottom: 16px; }
    .mt-1 { margin-top: 4px; }

    /* Trust indicators */
    .trust-indicators {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 30px;
    }

    .trust-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Progress bar */
    .progress-container {
      background: #e2e8f0;
      height: 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      margin-bottom: 24px;
    }

    /* Data table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .data-table th {
      background: #f8fafc;
      color: #374151;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }

    .data-table .label {
      font-weight: 600;
      color: #374151;
    }

    .data-table code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      color: #2563eb;
    }

    /* Status panel */
    .status-panel {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }

    .status-card {
      flex: 1;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .status-card.old {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .status-card.new {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .status-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .status-value {
      font-size: 16px;
      font-weight: 700;
      padding: 8px 12px;
      border-radius: 6px;
      background: #e2e8f0;
      color: #374151;
    }

    .status-value.old-value {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-value.new-value {
      background: #dcfce7;
      color: #16a34a;
    }

    /* Priority badges */
    .priority-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-high {
      background: #fef2f2;
      color: #dc2626;
    }

    .priority-medium {
      background: #fef3c7;
      color: #d97706;
    }

    .priority-low {
      background: #f0fdf4;
      color: #16a34a;
    }

    /* Action grid */
    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .action-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      border-color: #2563eb;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
    }

    .action-card.primary {
      border-color: #2563eb;
      background: #f0f9ff;
    }

    .action-card.secondary {
      border-color: #64748b;
    }

    .action-card.support {
      border-color: #f59e0b;
      background: #fffbeb;
    }

    .action-icon {
      font-size: 24px;
      margin-bottom: 12px;
      display: block;
    }

    .action-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .action-description {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 16px;
    }

    /* Buttons */
    .btn {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      text-align: center;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-outline {
      background: transparent;
      color: #2563eb;
      border: 1px solid #2563eb;
    }

    .btn-outline:hover {
      background: #2563eb;
      color: white;
    }

    /* Alerts */
    .alert {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid;
    }

    .alert-warning {
      background: #fffbeb;
      border-color: #f59e0b;
      color: #92400e;
    }

    .alert-info {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }

    .alert strong {
      display: block;
      margin-bottom: 8px;
    }

    /* Footer */
    .footer {
      background: #f8fafc;
      padding: 30px;
      border-top: 1px solid #e2e8f0;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }

    .footer-link {
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s ease;
    }

    .footer-link:hover {
      color: #2563eb;
    }

    .footer-copyright {
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }

    .footer-copyright p {
      margin-bottom: 4px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .email-wrapper {
        margin: 10px;
        border-radius: 8px;
      }

      .header, .content, .footer {
        padding: 20px;
      }

      .status-panel {
        flex-direction: column;
        gap: 12px;
      }

      .action-grid {
        grid-template-columns: 1fr;
      }

      .trust-indicators {
        flex-wrap: wrap;
        gap: 8px;
      }

      .footer-links {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }
  `;
};
