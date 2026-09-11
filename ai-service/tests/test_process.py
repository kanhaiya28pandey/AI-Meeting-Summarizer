import uuid
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_process_meeting_success():
    meeting_id = str(uuid.uuid4())
    response = client.post(
        "/api/v1/process",
        json={"meetingId": meeting_id}
    )
    assert response.status_code == 202
    data = response.json()
    assert data["success"] is True
    assert data["meetingId"] == meeting_id
    assert data["service"] == "AI Meeting Summarizer AI Service"
    assert data["message"] == "Meeting processing request accepted"


def test_process_meeting_invalid_uuid():
    response = client.post(
        "/api/v1/process",
        json={"meetingId": "not-a-valid-uuid"}
    )
    assert response.status_code == 422


def test_process_meeting_missing_meeting_id():
    response = client.post(
        "/api/v1/process",
        json={}
    )
    assert response.status_code == 422
