# AI Meeting Summarizer — Master Testing Guide

This document provides complete instructions for verifying the AI Meeting Summarizer platform. It covers:
1. **Automated Test Suites**: Commands to execute all 254 unit and integration tests across Frontend, Backend, and AI Service.
2. **Step-by-Step Manual Testing Guide**: A complete walkthrough for you to test every feature, database connection, API, and responsive viewport on your own.

---

## 1. Automated Test Suite Execution

The application maintains a comprehensive automated testing matrix across all three tiers with **254 automated tests**.

### 1.1 Run All Tests via Single Script
To run every test suite across all three services in one command:

```powershell
# In PowerShell (Project Root):
pwsh -File .\scripts\run_all_tests.ps1
```

```bash
# In Bash (Linux / macOS):
./scripts/run_all_tests.sh
```

---

### 1.2 Frontend Automated Tests (React + TypeScript)
The frontend uses the native Node Test Runner to execute fast, isolated unit tests.

```powershell
cd "d:\Projects\AI Meeting Summarizer\frontend"

# Run unit tests:
npm run test:node

# Verify TypeScript compilation & production build:
npm run build
```

**Expected Result**:
- `61 passing` tests (file validation, audio/video extensions, 100MB limit, duration formatters, date formatters, error message mappers, markdown strippers, confirmation dialogs, auth storage).
- Production build succeeds in under 400ms with zero TypeScript errors.

---

### 1.3 Backend Automated Tests (Spring Boot + Java 21)
The backend uses JUnit 5, Mockito, and Spring Boot Test to verify business logic, security, and data integrity.

```powershell
cd "d:\Projects\AI Meeting Summarizer\backend"

# Run JUnit tests:
.\mvnw.cmd test
```

**Expected Result**:
- `Tests run: 115, Failures: 0, Errors: 0, Skipped: 0`
- `BUILD SUCCESS`
- Covers user registration, username generator collisions, BCrypt authentication, JWT creation and validation, meeting isolation scoping, concurrency locks, and JPA transactions.

---

### 1.4 AI Microservice Automated Tests (FastAPI + Python 3.13)
The AI service uses Pytest to verify media format detection, FFmpeg extraction pipelines, and Gemini API contract schemas.

```powershell
cd "d:\Projects\AI Meeting Summarizer\ai-service"

# Run Pytest:
.\.venv\Scripts\python -m pytest tests/
```

**Expected Result**:
- `78 passed, 3 skipped in ~0.35s`
- Covers audio/video format detection, FFmpeg command array injection prevention, timeout handling, mocked Gemini response schemas, and boundary contracts.

---

## 2. Live System Readiness Verification

Before testing through the browser, verify that all three services and the database are online and healthy:

| Component | Target URL | Expected Response |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | HTTP `200 OK` (Loads the application shell) |
| **Backend API Health** | [http://localhost:8080/api/health](http://localhost:8080/api/health) | `{"status":"UP","timestamp":"..."}` |
| **Database Readiness** | [http://localhost:8080/api/health/readiness](http://localhost:8080/api/health/readiness) | `{"status":"UP","database":"CONNECTED"}` |
| **AI Service Health** | [http://localhost:8000/api/health](http://localhost:8000/api/health) | `{"status":"healthy","storage":"ready"}` |
| **PostgreSQL Database**| `localhost:5432` | Connected & active |

---

## 3. Step-by-Step Manual User Testing Walkthrough

Follow these 9 testing phases to test every workflow on your own:

### Phase 1: User Registration & Auto-Generated Username
1. Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.
2. Click **Create Account** in the top right header (or click the bottom link on the Login screen).
3. Fill in the registration form:
   - **Full Name**: Enter a name (e.g. `Jordan Smith`).
   - **Email Address**: Enter a unique email (e.g. `jordan.smith@example.com`).
   - **Country Code**: Select or type your country code (e.g. `+91` or `+1`).
   - **Mobile Number**: Enter any 10-digit number (e.g. `9876543210`).
   - **Password**: Enter at least 8 characters (e.g. `Secret123!`).
   - **Confirm Password**: Re-enter the same password.
4. Click **Create Account**.
5. **Expected Result**:
   - Registration succeeds without requiring page refresh.
   - You are automatically authenticated and redirected to the Home workspace.
   - The top header displays your initials and full name.
   - A unique username has been automatically generated (e.g. `@jordan_s`).

---

### Phase 2: Dual-Identifier Sign In (Email vs @username)
1. Click your name or avatar in the header and click **Sign Out**.
2. Notice you are redirected to the Home page.
3. Click **Sign In** in the top header.
4. **Test 1 — Login with @username**:
   - In the "Email Address or @username" field, type your auto-generated username (e.g. `@jordan_s` or `jordan_s`).
   - Enter your password.
   - Click **Sign In**.
   - **Expected Result**: You are successfully logged in.
5. Sign out again and **Test 2 — Login with Email**:
   - Type your registered email address (e.g. `jordan.smith@example.com`).
   - Enter your password.
   - Click **Sign In**.
   - **Expected Result**: You are successfully logged in.

---

### Phase 3: Meeting Upload & Real-Time Processing (Audio & Video)
1. Navigate to **Home** (`/`).
2. Drag and drop any supported test file into the dropzone (or click to browse):
   - **Audio formats**: `.mp3`, `.wav`, `.m4a`.
   - **Video formats**: `.mp4`, `.mov`.
3. Notice the selected file card appears displaying:
   - File icon (Audio in violet, Video in blue).
   - Filename and formatted size (e.g. `4.2 MB`).
   - Type pill (`Audio` or `Video`).
   - Green "Ready to upload" status.
4. The **Meeting Title** field automatically populates with the clean file name. You can edit it if desired.
5. Click **Analyze Meeting**.
6. **Expected Result**:
   - Button shows "Uploading..." with an animated spinner.
   - As soon as the upload finishes, you are redirected to `/meetings/{meeting-id}`.
   - The Real-Time Progress Tracker displays the 5 stages:
     `1. Uploading` (Done) $\rightarrow$ `2. Transcribing` (Pulsing) $\rightarrow$ `3. Analyzing` $\rightarrow$ `4. Saving` $\rightarrow$ `5. Completed`.
   - When finished, the results view renders smoothly.

---

### Phase 4: Meeting Intelligence Review
On the completed meeting screen (`/meetings/{id}`), verify the 4 structured intelligence sections:
1. **Meeting Header**:
   - Full meeting title.
   - Status badge (`Ready`).
   - Metadata chips: original filename, format pill (`MP3`/`MP4`), duration (`mm:ss`), and recording date.
2. **Executive Summary Card**:
   - Displays clean, synthesized prose without raw markdown hashtags or asterisks.
   - Click the **Copy** button in the card header $\rightarrow$ verify the toast notification "Summary copied to clipboard" appears.
3. **Key Decisions & Action Items Grid**:
   - **Key Decisions**: Verified list of agreed points.
   - **Action Items**: Checklist format with assigned owner and due date pills (or "Unassigned" if not specified in speech).
4. **Transcript Section**:
   - Toggle between **Person-by-Person** view and **Raw Text** view.
   - In Person-by-Person view, verify distinct speaker avatars with custom color palettes and timestamps.
   - Click **Copy All** $\rightarrow$ verify full transcript copies to clipboard.

---

### Phase 5: One-Click Document Export (Markdown & PDF)
1. In the top action bar of any completed meeting:
2. **Export to Markdown**:
   - Click **Export Markdown**.
   - **Expected Result**: A clean `.md` file is automatically downloaded (e.g. `Team_Sync_Summary.md`).
   - Open the downloaded file in any text editor or markdown viewer $\rightarrow$ verify it contains title, metadata, executive summary, decisions, action checklist, and full transcript.
3. **Export to PDF**:
   - Click **Export PDF**.
   - **Expected Result**: The browser's native print/save dialog opens immediately.
   - In the print preview:
     - All navigation chrome, sidebar, and buttons are hidden automatically.
     - Document is formatted as a crisp executive briefing report.
     - Select "Save as PDF" to save the file.

---

### Phase 6: History Dashboard, Search & Filtering (`/meetings`)
1. Click **My Meetings** in the sidebar navigation.
2. Verify all meetings owned by your account appear as modern cards.
3. Verify each card displays:
   - Formatted title and status badge.
   - Format pill (`MP4` / `WAV` / `MP3`).
   - Clean Executive Briefing preview without raw markdown symbols.
   - `View Meeting` and `Delete` buttons.
4. **Test Real-Time Search**:
   - Type a keyword from one of your meeting summaries or titles into the search box.
   - Verify non-matching cards instantly filter out.
   - Clear the search box $\rightarrow$ all meetings reappear.
5. **Test Date & Status Presets**:
   - Select `Today` or `Past 7 Days` in the date filter.
   - Select `Completed` in the status filter.
   - Verify the filter summary badge shows `Showing X of Y meetings`.
   - Click **Reset Filters** $\rightarrow$ all filters reset to defaults.

---

### Phase 7: Profile & Security Management in Settings (`/settings`)
1. Click **Settings** in the sidebar navigation.
2. Notice the top Executive User Banner with your name, initials, `@username`, and Verified badge.
3. Notice the 3 Segmented Navigation Tabs:
   - **System & Preferences**: Displays technical specs, supported media formats, and limits.
   - **Personal Profile**:
     - Edit your Full Name or Mobile Number.
     - Click **Save Changes**.
     - Verify the success alert appears and the header updates immediately.
   - **Security & Password**:
     - Test changing your password by entering your current password and a new password (min 8 chars).
     - Click **Update Password** $\rightarrow$ verify confirmation message appears.

---

### Phase 8: Multi-Device Responsive UI Testing
Open Google Chrome or Microsoft Edge DevTools (`F12`), toggle the **Device Toolbar** (`Ctrl+Shift+M` or `Cmd+Option+M`), and test the following device profiles:

1. **Samsung Galaxy S20 / S21 (360px × 740px)**:
   - Verify no horizontal scrollbar exists on any page (`overflow-x: hidden`).
   - Sidebar collapses into a mobile drawer; tap the hamburger menu icon $\rightarrow$ sidebar slides in with dark overlay.
   - On the Home page, the format pill (`MP3 • WAV • M4A • MP4 • MOV`) wraps cleanly inside the card.
   - On the My Meetings page, meeting cards stack in a single column without clipping.
   - On the Meeting Details page, the top action buttons (`Export Markdown`, `Export PDF`, `New Upload`) wrap into an equal-width grid.
2. **Apple iPhone 14 Pro / 15 (393px × 852px)**:
   - Verify touch targets for all buttons and inputs are comfortable.
   - Check the Login and Signup pages: cards render as single-column layouts with scrolling enabled and no clipped fields.
3. **Apple iPad Air / Pro (820px × 1180px)**:
   - Verify the sidebar converts into the mobile drawer (breakpoint at `1024px`), giving the main content the full width of the screen.
   - Feature boxes on the Home page organize into a neat 2-column grid.
4. **Laptop / Desktop (1280px to 1920px)**:
   - Sidebar stays pinned on the left (`260px`).
   - Main content is centered with comfortable bounds (`1040px` / `1200px`).

---

### Phase 9: Error Handling & Security Boundary Testing
1. **Invalid File Format**:
   - Try dropping an unsupported file (e.g. `.pdf`, `.zip`, `.txt`) into the Home dropzone.
   - Verify an instant error appears: *"Unsupported file type. Please upload MP3, WAV, M4A, MP4, or MOV files."*
2. **File Size Limit (>100 MB)**:
   - Try selecting a file exceeding 100 MB.
   - Verify it is rejected immediately before any network transmission occurs.
3. **Empty / Invalid Login**:
   - On the login page, enter a non-existent email or wrong password.
   - Verify a user-friendly error banner appears without raw stack traces.
4. **Meeting Deletion**:
   - On My Meetings, click **Delete** on any card.
   - Verify a modal asks for confirmation (`Delete Meeting? This action cannot be undone.`).
   - Click **Cancel** $\rightarrow$ card is untouched.
   - Click **Delete Meeting** $\rightarrow$ card is removed and a confirmation toast appears.

---

## 4. Test Summary Checklist

Use this quick checklist to track your test results:

- [ ] `npm run test:node` (61/61 passing)
- [ ] `npm run build` (Clean Vite bundle, 0 errors)
- [ ] `mvnw.cmd test` (115/115 passing)
- [ ] `python -m pytest tests/` (78/78 passing)
- [ ] User Registration with auto-generated `@username`
- [ ] Dual-identifier Sign-in (Email vs `@username`)
- [ ] Audio upload & transcription
- [ ] Video upload & FFmpeg audio extraction
- [ ] Real-time processing progress tracker
- [ ] Executive summary copy to clipboard
- [ ] One-click Export to Markdown (`.md`)
- [ ] One-click Export to PDF (Print layout)
- [ ] Search & date/status filtering on My Meetings
- [ ] Settings tab switching & profile update
- [ ] Responsive drawer on iPad / tablet (< 1024px)
- [ ] Responsive single-column layout on mobile (< 640px)
