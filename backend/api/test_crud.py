"""
ShiftFit CRUD Tests — Mocked database for CI/CD
Run: cd backend && python -m pytest api/test_crud.py -v
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from api.index import app
from api.auth import get_current_user

TEST_USER = {"user_id": "test-user-123", "email": "test@example.com"}

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_db():
    with patch('api.crud.get_db') as mock_get_db:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.__enter__ = Mock(return_value=mock_conn)
        mock_conn.__exit__ = Mock(return_value=False)
        mock_conn.cursor.return_value.__enter__ = Mock(return_value=mock_cursor)
        mock_conn.cursor.return_value.__exit__ = Mock(return_value=False)
        mock_get_db.return_value = mock_conn
        yield mock_cursor


# ── Classes ──────────────────────────────────────────────────────────────────

def test_get_classes_empty(client, mock_db):
    mock_db.fetchall.return_value = []
    assert client.get("/api/classes").status_code == 200

def test_create_class(client, mock_db):
    mock_db.fetchone.return_value = {"id": "c1", "name": "Math", "day": "Monday", "start_time": "09:00:00", "end_time": "10:00:00"}
    r = client.post("/api/classes", json={"name": "Math", "day": "Monday", "startTime": "09:00", "endTime": "10:00"})
    assert r.status_code == 201
    assert r.json()["name"] == "Math"

def test_create_class_invalid_day(client, mock_db):
    assert client.post("/api/classes", json={"name": "Math", "day": "Funday", "startTime": "09:00", "endTime": "10:00"}).status_code == 422

def test_delete_class(client, mock_db):
    mock_db.fetchone.return_value = {"id": "550e8400-e29b-41d4-a716-446655440000"}
    assert client.delete("/api/classes/550e8400-e29b-41d4-a716-446655440000").status_code == 200

def test_delete_class_not_found(client, mock_db):
    mock_db.fetchone.return_value = None
    assert client.delete("/api/classes/550e8400-e29b-41d4-a716-446655440001").status_code == 404


# ── Assessments ──────────────────────────────────────────────────────────────

def test_get_assessments(client, mock_db):
    mock_db.fetchall.return_value = []
    assert client.get("/api/assessments").status_code == 200

def test_create_assessment(client, mock_db):
    mock_db.fetchone.return_value = {"id": "a1", "name": "HW", "due_date": "2026-10-20"}
    assert client.post("/api/assessments", json={"name": "HW", "dueDate": "2026-10-20"}).status_code == 201

def test_create_assessment_invalid_date(client, mock_db):
    assert client.post("/api/assessments", json={"name": "HW", "dueDate": "bad"}).status_code == 422


# ── Study Blocks ─────────────────────────────────────────────────────────────

def test_get_study_blocks(client, mock_db):
    mock_db.fetchall.return_value = []
    assert client.get("/api/study-blocks").status_code == 200

def test_create_study_block(client, mock_db):
    mock_db.fetchone.return_value = {"id": "s1", "day": "Tuesday", "start_time": "14:00:00", "end_time": "16:00:00"}
    assert client.post("/api/study-blocks", json={"day": "Tuesday", "startTime": "14:00", "endTime": "16:00"}).status_code == 201

def test_create_study_block_invalid_time(client, mock_db):
    assert client.post("/api/study-blocks", json={"day": "Tuesday", "startTime": "25:00", "endTime": "16:00"}).status_code == 422


# ── Work Shifts ──────────────────────────────────────────────────────────────

def test_get_work_shifts(client, mock_db):
    mock_db.fetchall.return_value = []
    assert client.get("/api/work-shifts").status_code == 200

def test_create_work_shift(client, mock_db):
    mock_db.fetchone.return_value = {"id": "w1", "employer": "Cafe", "date": "2026-10-20", "start_time": "09:00:00", "end_time": "17:00:00"}
    assert client.post("/api/work-shifts", json={"employer": "Cafe", "date": "2026-10-20", "startTime": "09:00", "endTime": "17:00"}).status_code == 201

def test_create_work_shift_empty_employer(client, mock_db):
    assert client.post("/api/work-shifts", json={"employer": "", "date": "2026-10-20", "startTime": "09:00", "endTime": "17:00"}).status_code == 422


# ── Auth ─────────────────────────────────────────────────────────────────────

def test_crud_requires_auth(client):
    app.dependency_overrides.clear()
    for method, ep in [("GET","/api/classes"),("POST","/api/classes"),("GET","/api/assessments"),
                       ("POST","/api/assessments"),("GET","/api/study-blocks"),("POST","/api/study-blocks"),
                       ("GET","/api/work-shifts"),("POST","/api/work-shifts")]:
        assert getattr(client, method.lower())(ep).status_code == 401


# ── Check-shift ──────────────────────────────────────────────────────────────

def test_check_shift_with_db_data(client):
    """Check-shift should fetch user's saved data from database."""
    with patch('api.index.get_db') as mock_get_db:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.__enter__ = Mock(return_value=mock_conn)
        mock_conn.__exit__ = Mock(return_value=False)
        mock_conn.cursor.return_value.__enter__ = Mock(return_value=mock_cursor)
        mock_conn.cursor.return_value.__exit__ = Mock(return_value=False)
        mock_get_db.return_value = mock_conn
        mock_cursor.fetchall.side_effect = [
            [{"name": "Math", "day": "Friday", "start_time": "10:00:00", "end_time": "12:00:00"}],
            [], [], []
        ]
        r = client.post("/api/check-shift", json={"employer": "Cafe", "date": "2026-10-16", "startTime": "09:00", "endTime": "13:00"})
        assert r.status_code == 200
        assert r.json()["verdict"] == "Conflict"

def test_check_shift_empty_db(client):
    """Check-shift with empty database returns Good Fit."""
    with patch('api.index.get_db') as mock_get_db:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.__enter__ = Mock(return_value=mock_conn)
        mock_conn.__exit__ = Mock(return_value=False)
        mock_conn.cursor.return_value.__enter__ = Mock(return_value=mock_cursor)
        mock_conn.cursor.return_value.__exit__ = Mock(return_value=False)
        mock_get_db.return_value = mock_conn
        mock_cursor.fetchall.side_effect = [[], [], [], []]
        r = client.post("/api/check-shift", json={"employer": "Cafe", "date": "2026-10-16", "startTime": "09:00", "endTime": "17:00"})
        assert r.status_code == 200
        assert r.json()["verdict"] == "Good Fit"