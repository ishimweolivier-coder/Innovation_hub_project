# Innovation Hub Rwanda

AI-Powered Platform for Startup-Investor Connection Management.

## Tech Stack

- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Entrepreneur | jean@startup.rw | demo123 |
| Investor | sarah@invest.rw | demo123 |
| Admin | admin@innovationhub.rw | demo123 |

Click any demo account on the login page to auto-fill credentials.

## Pages

### Public
- Landing page with hero, features, ecosystem stats, opportunities, events
- Login (role selector: entrepreneur / investor / admin)
- Register (separate flows for entrepreneurs and investors)
- Forgot password

### Entrepreneur Dashboard
- Overview with stats, AI evaluation, notifications
- Submit startup application (multi-step form)
- Application status with 7-stage progress tracker
- Funding opportunities
- Growth tracking with charts
- News & events

### Investor Dashboard
- Overview with featured startups
- Browse startups with search and filters
- Startup detail with AI reports and express interest
- Funded startups tracking
- News & events

### Admin Dashboard
- Platform analytics with charts
- Review and approve/reject applications
- Manage users and investors
- Manage opportunities
- Publish announcements
- Generate reports

## Project Structure

```
src/
├── components/
│   ├── layout/       # Navbar, Footer, DashboardLayout
│   └── shared/       # StatsCard, Badges, Notifications
├── context/          # AuthContext
├── data/             # Mock data
└── pages/
    ├── auth/         # Login, Register, ForgotPassword
    ├── entrepreneur/ # Entrepreneur portal pages
    ├── investor/     # Investor portal pages
    └── admin/        # Admin portal pages
```
