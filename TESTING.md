# AI Meeting Summarizer — Testing Documentation

This document describes the testing architecture, test suites, execution commands, mocking strategies, and security verification procedures across all three tiers of the AI Meeting Summarizer application:

1. **Backend** — Spring Boot (Java 21/26) + JUnit 5 + Mockito + Testcontainers + Awaitility
2. **AI Service** — FastAPI (Python 3.12) + Pytest + HTTPX TestClient + unittest.mock
3. **Frontend** — React (TypeScript + Vite) + Vitest + React Testing Library + v8 Coverage

---

## 1. Quick Start: Running Tests

### Run All Tests Across All Tiers
From the project root:

```powershell
# In PowerShell (Windows)
.\scripts\run_all_tests.ps1
```

Or run each tier individually:

### Backend Tests (Spring Boot)
```powershell
cd backend
.\mvnw.cmd test -DDB_PASSWORD=12345
```

### AI Service Tests (FastAPI)
```powershell
cd ai-service
.\.venv\Scripts\pytest -v --cov=app --cov-report=term-missing
```

### Frontend Tests (React)
```powershell
cd frontend
npm test
npm run test:coverage
npm run lint
npm run build
```

---

## 2. Backend Testing Architecture (`backend/`)

### 2.1 Frameworks & Tooling
- **Test Engine**: JUnit 5 (Jupiter)
- **Mocking**: Mockito 5 (`MockitoExtension`, `@Mock`, `@InjectMocks`)
- **Integration**: Spring Boot Test (`@SpringBootTest`, `@AutoConfigureMockMvc`, `@DataJpaTest`)
- **Database**: PostgreSQL Testcontainers (`org.testcontainers:postgresql:1.20.4`) with isolated `application-test.properties` fallback
- **Concurrency & Polling**: Awaitility (`org.awaitility:awaitility:4.3.0`)
- **Test Isolation**: Temporary upload directory dynamically configured under `target/test-temp/uploads` with auto-cleanup

### 2.2 Test Suite Breakdown

| Test Class | Category | Description |
|---|---|---|
| `MeetingServiceUnitTest` | Unit Test | Core business logic, status transitions, DTO transformations, 404 handling, defensive null guards, and client-side override protections. |
| `MeetingProcessingServiceTest` | State Machine & Pipeline | Verifies the sequential state machine (`UPLOADED` → `TRANSCRIBING` → `ANALYZING` → `SAVING` → `COMPLETED`), mid-processing failure transitions (`FAILED`), empty transcript handling, concurrent duplicate processing suppression, and deletion mid-processing. |
| `MeetingUploadValidationTest` | Upload & Input Validation | Audio/video extension validation (`.mp3`, `.wav`, `.m4a`, `.mp4`, `.mov`), empty file detection, title length constraints (1–200 characters), path traversal protection, and command injection filename sanitization. |
| `MeetingConcurrencyRaceTest` | Concurrency & Race Condition | Tests multi-threaded race conditions: concurrent process + delete, concurrent process + get, and duplicate trigger serialization using thread pools and countdown latches. |
| `MeetingRepositoryTest` | Repository / JPA | Tests `MeetingRepository` persistence against PostgreSQL, JSONB action items and key decisions serialization, reverse chronological ordering, and custom queries. |
| `MeetingControllerTest` | Controller / Web Layer | Tests HTTP contract, response codes (200, 201, 204, 400, 404, 413), multipart upload handling, and JSON serialization. |
| `MeetingProcessingIntegrationTest` | End-to-End Pipeline | Verifies complete asynchronous processing pipeline with mock AI service client. |

### 2.3 Running Specific Backend Tests
```powershell
# Run a specific test class
.\mvnw.cmd test -Dtest=MeetingServiceUnitTest -DDB_PASSWORD=12345

# Run state machine tests
.\mvnw.cmd test -Dtest=MeetingProcessingServiceTest -DDB_PASSWORD=12345

# Run concurrency tests
.\mvnw.cmd test -Dtest=MeetingConcurrencyRaceTest -DDB_PASSWORD=12345

# Run repository tests
.\mvnw.cmd test -Dtest=MeetingRepositoryTest -DDB_PASSWORD=12345
```

---

## 3. AI Service Testing Architecture (`ai-service/`)

### 3.1 Frameworks & Tooling
- **Test Framework**: Pytest 8.x
- **Coverage**: `pytest-cov` (configured with `--cov=app --cov-report=term-missing`)
- **API Client**: HTTPX `TestClient` (Starlette / FastAPI)
- **Mocking**: `unittest.mock` (`patch`, `MagicMock`, `AsyncMock`)
- **Configuration**: Isolated test environment variables in `pytest.ini` (`ENVIRONMENT=test`, `GEMINI_API_KEY=test-mock-key`)

### 3.2 Mocking Strategy & Live API Isolation
- **100% Mocked by Default**: All unit, API, schema, FFmpeg, and error-handling tests execute without calling the live Google Gemini API or consuming quotas.
- **Opt-In Live Tests**: Live Gemini tests are marked with `@pytest.mark.live_ai` and will automatically skip unless `RUN_LIVE_AI_TESTS=true` or `RUN_LIVE_GEMINI_TEST=true` is explicitly set with a valid `GEMINI_API_KEY`.

### 3.3 Test Suite Breakdown

| Directory / File | Category | Description |
|---|---|---|
| `tests/unit/test_gemini_config.py` | Unit Test | Configuration loading, missing API key exception (`GeminiConfigurationError`), and API key masking in string representations to prevent secret leakage. |
| `tests/unit/test_ffmpeg_unit.py` | Unit & Security | FFmpeg command array construction, validation of `shell=False` execution, Windows/NTFS command injection safety, timeout handling, and no-audio stream detection. |
| `tests/api/test_contract_schemas.py` | Contract & Schema | Pydantic schema validation for `TranscriptionResponse`, `MeetingAnalysisResponse`, `ActionItem`, and `ProcessResponse`. Tests strict adherence to null-safe types and ground truth rules. |
| `tests/test_analysis.py` | Integration & Edge Cases | Ground truth extraction: clean transcripts, meetings with no decisions, ambiguous owner meetings, informational meetings (null owner/deadline verification), malformed JSON handling, and Gemini rate limit retries. |
| `tests/test_transcription.py` | Transcription Flow | Audio transcription, video audio extraction pipeline, unsupported format rejection, and Gemini file upload mock lifecycle. |
| `tests/test_security.py` | Security & Hardening | Prompt injection resistance (guardrail instructions in prompt), path traversal defense, file size limits, and error sanitization. |

### 3.4 Running Specific AI Service Tests
```powershell
# Run unit tests only
pytest tests/unit/ -v

# Run schema contract tests
pytest tests/api/test_contract_schemas.py -v

# Run with full coverage report
pytest --cov=app --cov-report=term-missing

# Run live Gemini integration test (requires API key)
$env:GEMINI_API_KEY="your_gemini_api_key_here"
$env:RUN_LIVE_AI_TESTS="true"
pytest -m live_ai -v
```

---

## 4. Frontend Testing Architecture (`frontend/`)

### 4.1 Frameworks & Tooling
- **Test Runner**: Vitest 5.x with Node 20+
- **DOM Environment**: JSDOM with `@testing-library/jest-dom` matchers
- **Component Testing**: React Testing Library (`@testing-library/react`, `@testing-library/user-event`)
- **Coverage**: `@vitest/coverage-v8`
- **Routing**: `MemoryRouter` for route testing

### 4.2 Test Suite Breakdown

| Test File | Category | Description |
|---|---|---|
| `tests/components/CommonComponents.test.tsx` | Unit / UI Primitives | Tests `Button`, `Card`, `Badge`, `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`, `Sidebar`, and `Header` for proper rendering, variant classes, accessibility roles, and click interactions. |
| `tests/components/ErrorBoundary.test.tsx` | Error Resilience | Tests `ErrorBoundary` component: catches render errors, displays user-friendly recovery UI, hides raw stack traces, and provides a working retry button. |
| `tests/upload/UploadFlow.test.tsx` | Upload Integration | File selection, drag-and-drop validation, unsupported format rejection (PDF/EXE), duplicate submission suppression (button disabling), and user-friendly error banners. |
| `tests/polling/PollingFlow.test.tsx` | Async Polling & Timer | Verifies `useMeetingProcessing` hook with fake timers: polls at 2-second intervals, transitions through stages (`UPLOADED` → `TRANSCRIBING` → `ANALYZING` → `SAVING` → `COMPLETED`), stops polling on completion or failure, and cleans up timers on unmount. |
| `tests/meeting/MeetingDetails.test.tsx` | Results Display | Renders summary, key decisions, action items with owner/deadline, transcript, fallback text ("Not specified") for missing fields, and XSS safety verification. |
| `tests/history/MeetingHistory.test.tsx` | History Dashboard | Renders meeting list, navigates to meeting details, opens delete confirmation modal, verifies cancel action leaves meeting intact, and verifies confirmation calls delete API and updates list. |
| `tests/routing/AppRouting.test.tsx` | Navigation & Routing | Tests `Home` (`/`), `Settings` (`/settings`), and `NotFound` (`*`) route rendering and navigation. |
| `tests/api/apiClient.test.ts` | API Client | Tests `getMeetings`, `getMeetingById`, `deleteMeeting`, `uploadMeeting`, network failure handling, and HTTP error transformation into `ApiClientError`. |

### 4.3 Running Specific Frontend Tests
```powershell
# Run all tests once
npm test

# Run tests in watch mode
npx vitest

# Run with code coverage
npm run test:coverage

# Run lint checks
npm run lint

# Verify production build
npm run build
```

---

## 5. Security & Reliability Test Matrix

| Threat / Risk | Mitigating Layer | Test Verification |
|---|---|---|
| **Path Traversal (`../../evil.sh`)** | Backend & AI Service | `MeetingUploadValidationTest`, `test_security.py` |
| **Command Injection (`meeting; rm -rf /`)** | AI Service (FFmpeg) | `test_ffmpeg_unit.py` (verifies `shell=False` and array passing) |
| **Prompt Injection (`Ignore previous instructions...`)** | AI Service (Gemini prompt) | `test_security.py`, `test_analysis.py` |
| **XSS via Adversarial Transcripts (`<script>alert()</script>`)** | Frontend (React JSX) | `MeetingDetails.test.tsx` (verifies scripts are not executed and text is escaped) |
| **Excessive File Size (>100 MB)** | Backend & Frontend | `MeetingUploadValidationTest`, `UploadFlow.test.tsx` |
| **Race Conditions / Duplicate Triggering** | Backend (Atomic state guard) | `MeetingConcurrencyRaceTest`, `MeetingProcessingServiceTest` |
| **Secret Leakage (Gemini API Key)** | AI Service (`GeminiConfig`) | `test_gemini_config.py` (checks `__repr__` and `__str__` masking) |
| **Missing Action Item Metadata** | Frontend & AI Service | `ActionItems.tsx`, `MeetingDetails.test.tsx` (renders "Not specified") |

---

## 6. Contract Testing & Schema Alignment

The backend and AI service communicate via HTTP JSON payloads. Both sides enforce matching schemas:

```
FastAPI Pydantic Model                Spring Boot DTO
----------------------                ---------------
TranscriptionResponse         <===>   TranscriptionResponseDTO
  - transcript: str                     - transcript: String

MeetingAnalysisResponse       <===>   AnalysisResponseDTO
  - summary: str                        - summary: String
  - key_decisions: list[str]            - keyDecisions: List<String>
  - action_items: list[ActionItem]      - actionItems: List<ActionItemDTO>
      - task: str                           - task: String
      - owner: Optional[str]                - owner: String (nullable)
      - deadline: Optional[str]             - deadline: String (nullable)

ProcessResponse               <===>   Combined Response
  - transcription + analysis            - saved to Meeting entity
```

Both `test_contract_schemas.py` (FastAPI) and `MeetingProcessingServiceTest.java` (Spring Boot) validate deserialization and serialization compatibility.

---

## 7. Known Environment Considerations

1. **Java 26 Preview Features**: JaCoCo version 0.8.12 does not currently support instrumenting Java 26 preview classfiles (bytecode version 70). Unit test coverage is measured by JUnit 5 / Surefire execution reports.
2. **Docker / Testcontainers**: Testcontainers requires Docker Desktop running if dynamic PostgreSQL containers are spun up; the test suite includes automatic fallbacks to the configured test database when Docker is absent.
3. **Opt-in Live AI Tests**: Real Gemini tests are intentionally excluded from normal CI/local test runs to prevent flakiness and quota consumption. Run them explicitly with `RUN_LIVE_AI_TESTS=true`.
