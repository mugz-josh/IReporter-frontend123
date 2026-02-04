import axios from 'axios';

interface SMSOptions {
  to: string;
  message: string;
}

class SMSService {
  private apiKey: string;
  private username: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AFRICAS_TALKING_API_KEY || '';
    this.username = process.env.AFRICAS_TALKING_USERNAME || '';
    this.baseUrl = 'https://api.africastalking.com/version1/messaging';
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      if (!this.apiKey || !this.username) {
        console.warn('Africa\'s Talking credentials not configured. SMS not sent.');
        return false;
      }

      const response = await axios.post(
        this.baseUrl,
        {
          username: this.username,
          to: options.to,
          message: options.message,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );

      console.log('SMS sent successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendStatusUpdateSMS(
    phoneNumber: string,
    reportType: string,
    reportTitle: string,
    newStatus: string
  ): Promise<boolean> {
    const message = `IREPORTER: Your ${reportType} report "${reportTitle}" status has been updated to: ${newStatus.toUpperCase()}`;

    return this.sendSMS({
      to: phoneNumber,
      message: message,
    });
  }
}

export default new SMSService();
