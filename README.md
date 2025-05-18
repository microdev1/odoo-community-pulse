# Community Pulse

A location-aware platform designed to facilitate interaction, visibility, and participation within defined geographic communities.

## Features
- Users can post and browse events. Supported category Garage Sales, Sports, Matches (local cricket, football, tennis, etc.), Community Classes (yoga sessions, art classes, educational workshops), Volunteer Opportunities (clean-up drives donation camps), Exhibitions, Small Festivals or Celebrations. - --- Also, the user can edit and delete his/her event.
- Users can mark their interest in attending an event without needing to fill out lengthy forms (only take name, email, phone, and number of people coming with you).
- Notifications (through Email, SMS, or WhatsApp):
    1. Reminder 1 day before the event.
    2. Live updates if the event changes (e.g., location change or cancellation).

## Admin Role
- View, approve, or reject submitted events.
- Flag inappropriate content and remove if needed.
- View event history by user.
- Assign "Verified Organizer" status.
- Ban users if needed.

## Getting Started

### Prerequisites
- Node.js v18+ and npm/pnpm
- MongoDB database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/community-pulse.git
   cd community-pulse
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following variables (see `.env.example` for a template):
   ```
   DATABASE_URL="your-mongodb-connection-string"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="user@example.com"
   EMAIL_SERVER_PASSWORD="password"
   EMAIL_FROM="no-reply@communitypulse.com"
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="+1234567890"
   WHATSAPP_BUSINESS_ID="your-whatsapp-business-id"
   WHATSAPP_API_TOKEN="your-whatsapp-api-token"
   WHATSAPP_PHONE_NUMBER_ID="your-whatsapp-phone-number-id"
   NOTIFICATION_SECRET_TOKEN="your-secret-token"
   ```

4. Generate Prisma client and push schema to database
   ```bash
   pnpm exec prisma generate
   pnpm exec prisma db push
   ```

5. Run the development server
   ```bash
   pnpm run dev
   ```

6. Start the notification scheduler in a separate terminal
   ```bash
   pnpm run scheduler
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Creating an Admin User

1. First, register a new user through the application
2. Connect to your database and update the user to have admin privileges:
   ```js
   db.User.updateOne(
     { email: "admin@example.com" },
     { $set: { isAdmin: true } }
   )
   ```

## Project Structure

- `src/app` - Next.js App Router pages and API routes
- `src/components` - Reusable React components
- `src/lib` - Utility functions and shared code
- `scripts` - Scripts for background jobs like notifications
- `prisma` - Database schema and migrations

## Background Jobs

The project uses a scheduler script (`scripts/scheduler.js`) to handle:
- Daily reminder creation for events happening the next day
- Processing and sending of email/SMS/WhatsApp notifications

To run the scheduler manually:
```bash
pnpm run scheduler
```

For production, consider using a more robust solution like cron jobs or a dedicated service like AWS Lambda.