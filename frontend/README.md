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
│   │   ├── common/             # Common domain components (UploadCard, FileDropZone, UploadProgress, ErrorBoundary)
│   │   ├── layout/             # Application layout (AppLayout, Sidebar, Header)
│   │   └── ui/                 # Atomic UI primitives (Button, Card, Badge, PageHeader, EmptyState, LoadingState, ErrorState)
│   ├── pages/                  # Page route views
│   │   ├── Home.tsx            # Hero, UploadCard, 4-step workflow guide
│   │   ├── Meetings.tsx        # My Meetings list / empty state
│   │   ├── MeetingDetails.tsx  # Dynamic route /meetings/:id
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
│   │   └── formatFileSize.ts   # Human-readable file size formatter
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

## 3. Uploading a Meeting

The application provides a real upload workflow on the Home page:

- **Supported Formats:** `MP3`, `WAV`, `M4A`
- **Maximum File Size:** 100 MB (`MAX_AUDIO_FILE_SIZE_BYTES = 100 * 1024 * 1024`)
- **Title Requirements:** Required, 1–200 characters (trimmed)
- **Drag & Drop:** Fully accessible drag-and-drop zone with keyboard navigation and click-to-browse file selection.
- **Upload Progress:** Genuine browser-to-server progress tracking via native `XMLHttpRequest.upload.onprogress`.

> [!NOTE]
> In the Phase 9 backend MVP, `POST /api/meetings/upload` processes audio synchronously (running Gemini transcription, Gemini intelligence analysis, and PostgreSQL persistence before returning `201 Created`). While the server completes processing, the UI displays a clear processing notice until the created `Meeting` response arrives, then smoothly navigates to `/meetings/:id`. Detailed step-by-step processing-state visualization will be added in Phase 12.

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

## 5. Development & Build Scripts

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
