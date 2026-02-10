# IREPORTER App

## Description
IREPORTER is a web application that allows users to report corruption and public issues.  
Users can create **red-flag** or **intervention records**, add geolocation, and track the status of their reports.  
Admins can update the status of these records, ensuring accountability and transparency.

---

## Features

### User Features
1. Users can create a **red-flag record** (an incident linked to corruption).  
2. Users can create **intervention records** (requests for government agencies to intervene, e.g., repair bad roads, collapsed bridges, flooding, etc.).  
3. Users can **edit** their red-flag or intervention records.  
4. Users can **delete** their red-flag or intervention records.  
5. Users can **add geolocation** (latitude and longitude coordinates) to their red-flag or intervention records.  
6. Users can **change the geolocation** attached to their red-flag or intervention records. 
7.  Once the status of the report has been changed the admin then the  user can nolonger edit  anything . 

### Admin Features
1. Admin can change the **status of a record** to:
   - `Under Investigation`
   - `Rejected` (for false claims)
   - `Resolved` (once the claim has been investigated and addressed)
   And also the Admin can change the status of the Admin only when  the status is  still in draft form

### Optional Features
1. Users receive **real-time SMS notifications** when Admin changes the status of their record.
2. It has been implemnted that a  user gets a real email notification when the status of the report has been changed .
3. The local email notification also with in the system also works .

### Integration Features (NEW)
1. **Multi-Platform Integrations**: Connect iReporter with external services (Slack, Teams, SMS, WhatsApp, REST APIs)
2. **Automated Report Distribution**: Automatically notify external platforms when reports are created, updated, or resolved
3. **API Key Management**: Generate and manage API keys for secure integration access
4. **Webhook Logging**: Complete audit trail of all webhook executions
5. **Event-Based Triggers**: Configure which report events trigger external notifications
6. **Connection Testing**: Verify integration connectivity before enabling
7. **Error Handling & Retry**: Automatic retry mechanism for failed webhooks

### Rules / Restrictions
1. A user can only **change the geolocation** of a record if its status is **not yet marked** as `Under Investigation`, `Rejected`, or `Resolved`.  
2. A user can only **edit or delete** a record if its status is **not yet marked** as `Under Investigation`, `Rejected`, or `Resolved`.  
3. **Only the user who created a record** can delete it.

There are three kinds of states of Reports :
 1.  Drafted
 2. Resolved.
 3. Under-investigation.

---

## Project Structure
 Frontend used React of TypeScript also for backend you must also type npm run dev.
 Backend used mysql  starting it you need to  type npm run dev

## Using Integrations

Navigate to `/integrations` to access the Integrations Manager where you can:

1. **Add New Integration**: Click "Add Integration" to create a new connection with supported services:
   - REST API (custom webhooks)
   - Slack
   - Microsoft Teams
   - SMS (Twilio)
   - WhatsApp (Twilio)

2. **Configure Events**: Select which report events should trigger the integration:
   - Report Created
   - Report Updated
   - Report Resolved
   - Comment Added
   - Status Changed

3. **Manage API Keys**: Generate secure API keys for REST API integrations with rate limiting

4. **Test Connections**: Verify that your integration credentials are correct before enabling

5. **View Logs**: Monitor webhook execution logs and retry failed deliveries

For detailed setup instructions for each integration type, see [INTEGRATIONS_README.md](./INTEGRATIONS_README.md)



