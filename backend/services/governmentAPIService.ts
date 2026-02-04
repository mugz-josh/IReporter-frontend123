import axios, { AxiosResponse } from 'axios';

interface GovernmentReportData {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  images?: string[];
  videos?: string[];
  user_email: string;
  created_at: string;
  report_type: 'red_flag' | 'intervention';
}

interface GovernmentAPIConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
  endpoint: string;
  headers?: Record<string, string>;
}

class GovernmentAPIService {
  private config: GovernmentAPIConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.GOVERNMENT_API_BASE_URL || '',
      apiKey: process.env.GOVERNMENT_API_KEY || '',
      authToken: process.env.GOVERNMENT_API_TOKEN || '',
      endpoint: process.env.GOVERNMENT_API_ENDPOINT || '/api/reports',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOVERNMENT_API_TOKEN || ''}`,
        'X-API-Key': process.env.GOVERNMENT_API_KEY || '',
      }
    };
  }

  async forwardReportToGovernment(reportData: GovernmentReportData): Promise<boolean> {
    try {
      if (!this.config.baseUrl) {
        console.warn('Government API base URL not configured. Report not forwarded.');
        return false;
      }

      // Transform the report data to match government API format
      const governmentPayload = {
        report_id: reportData.id,
        title: reportData.title,
        description: reportData.description,
        location: {
          latitude: reportData.latitude,
          longitude: reportData.longitude,
        },
        status: this.mapStatusToGovernment(reportData.status),
        media: {
          images: reportData.images || [],
          videos: reportData.videos || [],
        },
        reporter: {
          email: reportData.user_email,
        },
        report_type: reportData.report_type,
        submitted_at: reportData.created_at,
        source: 'iReporter',
        priority: this.determinePriority(reportData),
      };

      const response: AxiosResponse = await axios.post(
        `${this.config.baseUrl}${this.config.endpoint}`,
        governmentPayload,
        {
          headers: this.config.headers,
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Report forwarded to government API successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to forward report to government API:', error);
      return false;
    }
  }

  private mapStatusToGovernment(status: string): string {
    const statusMapping: Record<string, string> = {
      'draft': 'pending',
      'under-investigation': 'investigating',
      'rejected': 'closed',
      'resolved': 'resolved',
    };

    return statusMapping[status] || 'pending';
  }

  private determinePriority(reportData: GovernmentReportData): string {
    // Simple priority determination based on keywords in title/description
    const highPriorityKeywords = ['emergency', 'urgent', 'critical', 'danger', 'crime', 'violence'];
    const mediumPriorityKeywords = ['corruption', 'fraud', 'abuse', 'illegal'];

    const text = `${reportData.title} ${reportData.description}`.toLowerCase();

    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    } else if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  async updateGovernmentReportStatus(
    reportId: number,
    newStatus: string,
    additionalInfo?: string
  ): Promise<boolean> {
    try {
      if (!this.config.baseUrl) {
        console.warn('Government API base URL not configured. Status update not sent.');
        return false;
      }

      const updatePayload = {
        report_id: reportId,
        status: this.mapStatusToGovernment(newStatus),
        updated_at: new Date().toISOString(),
        notes: additionalInfo || 'Status updated via iReporter system',
        source: 'iReporter',
      };

      const response: AxiosResponse = await axios.put(
        `${this.config.baseUrl}${this.config.endpoint}/${reportId}`,
        updatePayload,
        {
          headers: this.config.headers,
          timeout: 30000,
        }
      );

      console.log('Government report status updated successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to update government report status:', error);
      return false;
    }
  }
}

export default new GovernmentAPIService();
