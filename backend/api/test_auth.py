"""
ShiftFit Authentication Tests — Mocked Supabase

Uses pytest fixtures with automatic cleanup. Mocks Supabase Auth responses.
For REAL testing, use frontend forms or curl against running server.
"""

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient


class MockUser:
    def __init__(self, id="test-user-123", email="test@example.com"):
        self.id = id
        self.email = email

class MockSession:
    def __init__(self, access_token="mock-jwt-token-123"):
        self.access_token = access_token

class MockAuthResponse:
    def __init__(self, user=None, session=None):
        self.user = user
        self.session = session


@pytest.fixture
def mock_supabase():
    with patch('api.auth.supabase') as mock:
        yield mock

@pytest.fixture
def client():
    from api.index import app
    return TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_overrides():
    from api.index import app
    yield
    app.dependency_overrides.clear()


# ── Signup ───────────────────────────────────────────────────────────────────

def test_signup_success(client, mock_supabase):
    mock_supabase.auth.sign_up.return_value = MockAuthResponse(user=MockUser(), session=None)
    response = client.post("/api/auth/signup", json={"email": "new@example.com", "password": "secure123"})
    assert response.status_code == 201
    data = response.json()
    assert "successful" in data["message"].lower()
    assert data["user_id"] == "test-user-123"

def test_signup_generic_failure(client, mock_supabase):
    mock_supabase.auth.sign_up.side_effect = Exception("User already registered")
    response = client.post("/api/auth/signup", json={"email": "existing@example.com", "password": "secure123"})
    assert response.status_code == 400
    assert "failed" in response.json()["detail"].lower()

def test_signup_weak_password(client, mock_supabase):
    mock_supabase.auth.sign_up.side_effect = Exception("Password should be at least 6 characters")
    response = client.post("/api/auth/signup", json={"email": "test@example.com", "password": "123"})
    assert response.status_code == 400
    assert "6 characters" in response.json()["detail"].lower()

def test_signup_missing_fields(client, mock_supabase):
    response = client.post("/api/auth/signup", json={"email": "test@example.com"})
    assert response.status_code == 422


# ── Login ────────────────────────────────────────────────────────────────────

def test_login_success(client, mock_supabase):
    mock_supabase.auth.sign_in_with_password.return_value = MockAuthResponse(
        user=MockUser(), session=MockSession()
    )
    response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "correct123"})
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "mock-jwt-token-123"
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client, mock_supabase):
    mock_supabase.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")
    response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "wrong"})
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()

def test_login_unconfirmed_email(client, mock_supabase):
    mock_supabase.auth.sign_in_with_password.side_effect = Exception("Email not confirmed")
    response = client.post("/api/auth/login", json={"email": "test@example.com", "password": "correct"})
    assert response.status_code == 401
    assert "confirm" in response.json()["detail"].lower()


# ── Token verification ───────────────────────────────────────────────────────

def test_me_valid_token(client, mock_supabase):
    mock_supabase.auth.get_user.return_value = Mock(user=MockUser())
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer valid-token"})
    assert response.status_code == 200
    assert response.json()["user_id"] == "test-user-123"

def test_me_no_token(client, mock_supabase):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_me_expired_token(client, mock_supabase):
    mock_supabase.auth.get_user.side_effect = Exception("Token has expired")
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer expired"})
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


# ── Protected endpoints ──────────────────────────────────────────────────────

SHIFT_PAYLOAD = {"employer": "Cafe", "date": "2026-10-16", "startTime": "09:00", "endTime": "17:00"}

def test_check_shift_requires_auth(client):
    response = client.post("/api/check-shift", json=SHIFT_PAYLOAD)
    assert response.status_code == 401

def test_check_shift_with_auth(client, mock_supabase):
    from api.index import app, get_db
    from api.auth import get_current_user
    from unittest.mock import MagicMock
    
    # Mock database for check-shift
    with patch('api.index.get_db') as mock_get_db:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.__enter__ = Mock(return_value=mock_conn)
        mock_conn.__exit__ = Mock(return_value=False)
        mock_conn.cursor.return_value.__enter__ = Mock(return_value=mock_cursor)
        mock_conn.cursor.return_value.__exit__ = Mock(return_value=False)
        mock_get_db.return_value = mock_conn
        mock_cursor.fetchall.return_value = []
        
        app.dependency_overrides[get_current_user] = lambda: {"user_id": "test-123", "email": "test@example.com"}
        response = client.post("/api/check-shift", json=SHIFT_PAYLOAD)
        assert response.status_code == 200
        assert response.json()["verdict"] == "Good Fit"

def test_health_public(client):
    response = client.get("/api/health")
    assert response.status_code == 200