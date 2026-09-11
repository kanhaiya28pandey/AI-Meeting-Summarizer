import io
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app.main import app
from app.services.gemini_service import GeminiService
from app.services.ffmpeg_service import FFmpegService

@pytest.fixture
def client():
    """FastAPI TestClient instance with default base URL."""
    return TestClient(app)

@pytest.fixture
def mock_gemini_client(monkeypatch):
    """Mocks Google GenAI client inside GeminiService."""
    mock_client = MagicMock()
    # Mock models.generate_content
    mock_response = MagicMock()
    mock_response.text = '{"summary": "Test Summary", "key_decisions": ["Test Decision"], "action_items": [{"task": "Test Task", "owner": "Alice", "deadline": "Tomorrow"}]}'
    mock_client.models.generate_content.return_value = mock_response
    
    # Mock files.upload
    mock_file = MagicMock()
    mock_file.name = "files/test-audio-file-id"
    mock_file.uri = "https://generativelanguage.googleapis.com/v1beta/files/test-audio-file-id"
    mock_client.files.upload.return_value = mock_file
    mock_client.files.delete.return_value = None

    return mock_client

@pytest.fixture
def synthetic_mp3_bytes():
    """Returns minimal synthetic MP3 bytes with valid header."""
    # ID3v2 header: 'ID3', version 3.0, flags 0, length 10
    id3_header = b'ID3\x03\x00\x00\x00\x00\x00\x0a'
    padding = b'\x00' * 10
    # MPEG sync word: 0xFF, 0xFB (MPEG-1 Layer 3)
    mpeg_frame = b'\xff\xfb\x90\x64' + b'\x00' * 100
    return id3_header + padding + mpeg_frame

@pytest.fixture
def synthetic_mp4_bytes():
    """Returns minimal synthetic MP4 ftyp box header."""
    # 4 bytes size (24), 'ftyp', major brand 'isom', minor version 512, compatible brands 'isom', 'iso2', 'mp41'
    ftyp_box = b'\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2mp41'
    mdat_box = b'\x00\x00\x00\x20mdat' + b'\x00' * 24
    return ftyp_box + mdat_box
