# AI Meeting Summarizer — Frontend

Modern, responsive web application for the **AI Meeting Summarizer** platform built with React 19, TypeScript, and Vite.

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
│   │   ├── common/             # Domain components (UploadCard, FileDropZone, UploadProgress, ProcessingStatus, ErrorBoundary)
│   │   ├── layout/             # Application layout (AppLayout, Sidebar, Header)
│   │   └── ui/                 # Atomic UI primitives (Button, Card, Badge, PageHeader, EmptyState, LoadingState, ErrorState)
│   ├── hooks/
│   │   └── useMeetingProcessing.ts # Polling hook monitoring real backend stages
│   ├── pages/                  # Page route views
│   │   ├── Home.tsx            # Hero, UploadCard, 4-step workflow guide
│   │   ├── Meetings.tsx        # My Meetings list / empty state
│   │   ├── MeetingDetails.tsx  # Dynamic route /meetings/:id with real-time processing timeline
│   │   ├── Settings.tsx        # System parameters & service configurations
│   │   └── NotFound.tsx        # 404 error page
│   ├── services/
│   │   └── api.ts              # Strongly typed REST client with XMLHttpRequest progress tracking
│   ├── types/
│   │   ├── api.ts              # API request & response types, ApiClientError
│   │   └── meeting.ts          # Meeting domain models & status enums
│   ├── utils/
│   │   ├── apiError.ts         # Friendly error messages for network/HTTP failures
│   │   ├── fileValidation.ts   # Audio file and meeting title validation
│   │   ├── formatFileSize.ts   # Human-readable file size formatter
│   │   └── processingStages.ts # Centralized stage definitions and helper predicates
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

## 3. Real-time Meeting Processing Experience (Phase 12)

After submitting an audio recording on the Home page:

1. **Immediate `202 Accepted`**: The backend returns HTTP `202` with the newly created meeting ID (`status = UPLOADED`).
2. **Instant Navigation**: The browser transitions immediately to `/meetings/:id`.
3. **Status Polling**: The custom hook `useMeetingProcessing` polls `GET /api/meetings/:id` every 2000 ms.
4. **Authentic Stages**: The UI displays the authentic backend stage progression:
   - `UPLOADED` — Upload received and queued.
   - `TRANSCRIBING` — Gemini 3.5 audio-to-text transcription.
   - `ANALYZING` — Gemini meeting analysis for summary, decisions, and action items.
   - `SAVING` — Persisting structured data to PostgreSQL.
   - `COMPLETED` — Meeting results ready!
5. **Terminal State Handling**: Polling stops immediately upon reaching `COMPLETED` or `FAILED`.
6. **Browser Refresh Support**: Refreshing `/meetings/:id` at any stage queries the current state and seamlessly resumes polling if still in-flight.

---

## 4. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL for the Spring Boot backend REST API | `http://localhost:8080/api` |

---

## 5. Security & Error Resilience (Phase 16)

- **Plain-text Rendering**: AI summary, transcript, decisions, and action items are rendered as pure React strings with zero `dangerouslySetInnerHTML` usage.
- **Error Boundary**: Top-level `ErrorBoundary` catches unexpected component render exceptions and presents a friendly recovery UI with a "Refresh" action without exposing stack traces.
- **Single-Submission Defense**: File upload button and form submissions are disabled while an upload is in-flight.
- **Safe Polling & Cleanup**: `useMeetingProcessing` cleans up active timer intervals on unmount, page transitions, and terminal states (`COMPLETED` or `FAILED`).
- **No Client Secrets**: No API keys, passwords, or cloud credentials are stored in or accessible to the browser client.

---

## 6. Development & Build Scripts

In the `frontend` directory:

```bash
# Install dependencies
npm install

# Start local development server (with HMR)
npm run dev

# Run TypeScript check and production build
npm run build

# Run unit tests
npm test

# Run linter
npm run lint

# Preview production build locally
npm run preview
```
