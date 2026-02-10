# iReporter Integrations System

## Overview

The iReporter Integrations System allows users to connect iReporter with external services and platforms to automate report distribution and notifications. This document covers the frontend implementation.

## Features

- **Multiple Integration Types**: REST API, Slack, Microsoft Teams, SMS (Twilio), WhatsApp (Twilio)
- **API Key Management**: Generate, manage, and revoke API keys with rate limiting
- **Event-Based Triggers**: Configure which report events trigger notifications
- **Webhook Logging**: Complete audit trail of all webhook calls
- **Connection Testing**: Verify integration connectivity before enabling
- **Error Handling**: Detailed error messages for failed integrations

## Components

### IntegrationsManager (`src/components/IntegrationsManager.tsx`)

Main component that displays all integrations and provides CRUD operations.

**Features:**
- List all created integrations with status badges
- Add new integrations via modal form
- Enable/disable integrations
- Delete integrations
- Test integration connectivity
- View webhook execution logs

**Usage:**
```tsx
import IntegrationsManager from "@/components/IntegrationsManager";

export default function IntegrationsPage() {
  return <IntegrationsManager />;
}
```

### IntegrationForm (`src/components/IntegrationForm.tsx`)

Modal form for creating new integrations.

**Supported Types:**
1. **REST API**
   - Auto-generates webhook URL and API key
   - Useful for custom integrations

2. **Slack**
   - Requires Slack Incoming Webhook URL
   - Posts formatted messages to Slack channels

3. **Microsoft Teams**
   - Requires Teams Incoming Webhook URL
   - Sends rich formatted messages to Teams

4. **SMS (Twilio)**
   - Requires Twilio Account SID and phone number
   - Sends SMS notifications for reports

5. **WhatsApp (Twilio)**
   - Requires Twilio Account SID and WhatsApp number
   - Sends WhatsApp messages for reports

**Event Configuration:**
Users can select which events trigger the integration:
- Report Created
- Report Updated
- Report Resolved
- Comment Added
- Status Changed

### WebhookLogs (`src/components/WebhookLogs.tsx`)

Modal displaying webhook execution history for an integration.

**Features:**
- Lists all webhook calls with timestamp and status
- Expandable details showing request/response payloads
- Retry functionality for failed webhooks
- Status filtering (Success/Failed)

### ApiKeyManager (`src/components/ApiKeyManager.tsx`)

Component for managing API keys for integrations.

**Features:**
- Create new API keys with custom names
- View key details (creation date, rate limit)
- Copy keys to clipboard
- Revoke individual keys

## Integration Types

### REST API Integration

```json
{
  "type": "api",
  "config": {
    "events_config": {
      "on_report_created": true,
      "on_report_updated": true,
      "on_report_resolved": true,
      "on_comment_added": false,
      "on_status_changed": true
    }
  }
}
```

**Generated on creation:**
- Webhook URL: `https://api.ireporter.app/webhooks/{integrationId}`
- API Key: Auto-generated secure key

### Slack Integration

```json
{
  "type": "slack",
  "config": {
    "slack_webhook_url": "https://hooks.slack.com/services/...",
    "events_config": { ... }
  }
}
```

**Setup Instructions:**
1. Go to your Slack workspace settings
2. Create an Incoming Webhook
3. Copy the webhook URL
4. Paste in the integration form

### Microsoft Teams Integration

```json
{
  "type": "teams",
  "config": {
    "teams_webhook_url": "https://outlook.webhook.office.com/...",
    "events_config": { ... }
  }
}
```

**Setup Instructions:**
1. Open your Teams channel
2. Click ⋯ (More options) → Connectors
3. Search for "Incoming Webhook"
4. Configure and copy the webhook URL
5. Paste in the integration form

### SMS Integration (Twilio)

```json
{
  "type": "sms",
  "config": {
    "sms_api_key": "your-twilio-account-sid",
    "sms_number": "+1234567890",
    "events_config": { ... }
  }
}
```

**Setup Instructions:**
1. Sign up at twilio.com
2. Create a project and get Account SID
3. Verify a phone number for sending SMS
4. Enter credentials in the integration form

### WhatsApp Integration (Twilio)

```json
{
  "type": "whatsapp",
  "config": {
    "whatsapp_api_key": "your-twilio-account-sid",
    "whatsapp_number": "+1234567890",
    "events_config": { ... }
  }
}
```

**Setup Instructions:**
1. Follow Twilio WhatsApp setup
2. Get your WhatsApp Business Account
3. Configure a sandbox or connect your number
4. Enter Account SID and WhatsApp number

## API Endpoints

The frontend uses the following API endpoints (defined in `src/services/integrationAPI.ts`):

### Integrations CRUD
- `GET /api/integrations` - List all integrations
- `POST /api/integrations` - Create integration
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Delete integration

### Testing & Status
- `POST /api/integrations/:id/test` - Test integration connection
- `PATCH /api/integrations/:id/toggle` - Enable/disable integration

### API Keys
- `GET /api/integrations/:id/keys` - List API keys
- `POST /api/integrations/:id/keys` - Create API key
- `DELETE /api/integrations/:id/keys/:keyId` - Revoke API key

### Webhook Logs
- `GET /api/integrations/:id/logs` - Get webhook logs
- `POST /api/integrations/:id/logs/:logId/retry` - Retry failed webhook

### Platform-Specific
- `POST /api/integrations/:id/sms/send` - Send SMS report
- `POST /api/integrations/:id/whatsapp/send` - Send WhatsApp report
- `POST /api/integrations/:id/slack/verify` - Verify Slack webhook
- `POST /api/integrations/:id/teams/verify` - Verify Teams webhook

## Styling

Integrations use the dedicated stylesheet at `src/styles/integrations.css`.

**CSS Classes:**
- `.integrations-manager` - Main container
- `.integration-card` - Individual integration card
- `.modal-overlay` - Modal backdrop
- `.modal-card` - Modal dialog
- `.api-key-manager` - API key component
- `.webhook-logs` - Webhook log list

## Routing

The IntegrationsPage is available at `/integrations` route.

```tsx
// In App.tsx
import IntegrationsPage from "./pages/IntegrationsPage";

const router = createBrowserRouter([
  {
    path: "/integrations",
    element: <IntegrationsPage />,
  },
]);
```

## Type Definitions

See `src/types/integrations.ts` for complete TypeScript interface definitions:

```tsx
// Core types
interface Integration {
  id: number;
  name: string;
  type: IntegrationType;
  config: IntegrationConfig;
  is_active: boolean;
  error_message?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

type IntegrationType = "api" | "slack" | "sms" | "whatsapp" | "teams";

interface IntegrationConfig {
  slack_webhook_url?: string;
  teams_webhook_url?: string;
  sms_api_key?: string;
  sms_number?: string;
  whatsapp_api_key?: string;
  whatsapp_number?: string;
  events_config?: EventsConfig;
}

interface EventsConfig {
  on_report_created?: boolean;
  on_report_updated?: boolean;
  on_report_resolved?: boolean;
  on_comment_added?: boolean;
  on_status_changed?: boolean;
}

interface ApiKey {
  id: number;
  integration_id: number;
  key: string;
  name: string;
  rate_limit: number;
  created_at: string;
}

interface WebhookLog {
  id: number;
  integration_id: number;
  event_type: string;
  status: "sent" | "failed";
  request_payload: object;
  response_status?: number;
  response_body?: string;
  created_at: string;
}
```

## Backend Implementation (TODO)

These endpoints need to be implemented in the backend:

1. **Authentication**: All endpoints require authentication (Bearer token)
2. **Validation**: Input validation for webhook URLs and API credentials
3. **Storage**: Database schema for integrations, API keys, and logs
4. **Webhooks**: Logic to trigger integrations on report events
5. **Queue**: Background job queue for sending delayed webhooks
6. **Encryption**: Encrypt stored API keys and credentials

See backend documentation for implementation details.

## Security Considerations

1. **API Keys**: Never display full keys after creation - only show masked version
2. **Secrets**: Always use HTTPS for webhook URLs
3. **Rate Limiting**: Enforce rate limits per API key
4. **Audit Trail**: Log all webhook executions for debugging
5. **Validation**: Validate all user input before creating integrations
6. **Encryption**: Encrypt sensitive configuration data in database

## Error Handling

The system includes comprehensive error handling:

- **Connection Errors**: Detailed error messages in error_message field
- **Validation Errors**: Client-side validation with helpful hints
- **Network Errors**: Toast notifications for user feedback
- **Webhook Failures**: Detailed logs with retry capability

## Future Enhancements

1. **Integration Templates**: Pre-configured templates for popular services
2. **Bulk Operations**: Enable/disable multiple integrations at once
3. **Scheduling**: Schedule integration triggers for specific times
4. **Transformations**: Custom data transformations for webhooks
5. **Analytics**: Track integration usage and success rates
6. **Webhooks**: Incoming webhooks to create reports via integrations

## Troubleshooting

### Integration not working
1. Check if integration is enabled (active status)
2. Verify webhook URL/credentials are correct
3. Test the integration using the "Test" button
4. Check webhook logs for error details
5. Verify firewall/network allows outbound requests

### API Key issues
1. Copy key immediately after creation
2. Cannot retrieve key after closing dialog
3. Create new key if original is lost
4. Revoke unused keys regularly

### Webhook not triggering
1. Ensure correct events are selected in configuration
2. Verify backend is sending webhook events
3. Check webhook logs for execution status
4. Test integration connectivity

## Support

For issues or questions about the integrations system, refer to:
- `INTEGRATIONS_README.md` (this file)
- `src/types/integrations.ts` (type definitions)
- `src/services/integrationAPI.ts` (API methods)
- Component source files for implementation details
