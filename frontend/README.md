# AI Meeting Summarizer — Frontend

Modern, responsive web application foundation for the **AI Meeting Summarizer** platform built with React, TypeScript, and Vite.

---

## 1. Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Design System:** SaaS Dashboard (Dark navy sidebar, light canvas workspace, purple/indigo accents, responsive grid, accessible semantic controls)

---

## 2. Project Structure

```text
frontend/
├── public/
│   ├── favicon.svg             # Application microphone / waveform icon
│   └── ...
├── src/
│   ├── assets/                 # Static media and graphics
│   ├── components/
│   │   ├── common/             # Common domain components (UploadCard, ErrorBoundary)
│   │   ├── layout/             # Application layout (AppLayout, Sidebar, Header)
│   │   └── ui/                 # Atomic UI primitives (Button, Card, Badge, PageHeader, EmptyState, LoadingState, ErrorState)
│   ├── pages/                  # Page route views
│   │   ├── Home.tsx            # Hero, upload placeholder, 4-step workflow guide
│   │   ├── Meetings.tsx        # My Meetings list / empty state
│   │   ├── MeetingDetails.tsx  # Dynamic route /meetings/:id
│   │   ├── Settings.tsx        # System parameters & service configurations
│   │   └── NotFound.tsx        # 404 error page
│   ├── services/
│   │   └── api.ts              # Strongly typed REST client foundation for Spring Boot
│   ├── types/
│   │   ├── api.ts              # API request & response types
│   │   └── meeting.ts          # Meeting domain models & status enums
│   ├── App.css
│   ├── App.tsx                 # Root router definition
│   ├── index.css               # Global CSS variables, reset, and typography
│   └── main.tsx                # React DOM entry point
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for the Spring Boot backend REST API | `http://localhost:8080/api` |

---

## 4. Development & Build Scripts

In the `frontend` directory:

```bash
# Install dependencies
npm install

# Start local development server (with HMR)
npm run dev

# Run TypeScript check and production build
npm run build

# Run linter
npm run lint

# Preview production build locally
npm run preview
```

---

## 5. Phase 10 Scope Note

Phase 10 establishes the pure React frontend foundation:
- Application layout, navigation, and routing
- Reusable UI component library and empty/loading/error states
- Centralized, strongly-typed API client service
- **No live API calls** are executed on pages during Phase 10
- **No live file uploads** are handled during Phase 10 (placeholder UI only)
- Full upload workflows and backend orchestration will be wired in Phase 11.
