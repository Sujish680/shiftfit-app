"""ShiftFit API Tests — decision-logic function tests + health.
Run: cd backend && python -m pytest api/test_api.py -v"""

import pytest
from fastapi.testclient import TestClient
from api.index import app, check_shift, ProposedShift
from api.auth import get_current_user

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = lambda: {"user_id": "test-user", "email": "test@example.com"}
    yield
    app.dependency_overrides.clear()

FRI = "2026-10-16"
DASH = "\u2013"

def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

# ── Decision logic function tests (no DB needed) ─────────────────────────────

def test_1_good_fit():
    from api.index import ClassInfo, Assessment, StudyBlock, WorkShift
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="09:00", endTime="17:00")
    result = check_shift(proposed, [], [], [], [])
    assert result.verdict == "Good Fit"
    assert "No scheduled class overlaps this shift" in result.explanations

def test_2_conflict_with_class():
    from api.index import ClassInfo
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="09:00", endTime="13:00")
    classes = [ClassInfo(name="Business 101", day="Friday", startTime="10:00", endTime="12:00")]
    result = check_shift(proposed, classes, [], [], [])
    assert result.verdict == "Conflict"
    assert "Business 101" in result.explanations[0]

def test_3_conflict_with_work_shift():
    from api.index import WorkShift
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="09:00", endTime="17:00")
    ws = [WorkShift(employer="Library", date=FRI, startTime="08:00", endTime="12:00")]
    result = check_shift(proposed, [], [], [], ws)
    assert result.verdict == "Conflict"
    assert any("Library" in e for e in result.explanations)

def test_4_tight_fit_assessment():
    from api.index import Assessment
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="09:00", endTime="17:00")
    a = [Assessment(name="Individual Assignment", dueDate=FRI)]
    result = check_shift(proposed, [], a, [], [])
    assert result.verdict == "Tight Fit"
    assert any("Individual Assignment" in e for e in result.explanations)

def test_5_tight_fit_study_block():
    from api.index import StudyBlock
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="09:00", endTime="13:00")
    sb = [StudyBlock(day="Friday", startTime="10:00", endTime="14:00")]
    result = check_shift(proposed, [], [], sb, [])
    assert result.verdict == "Tight Fit"
    assert any("study time" in e for e in result.explanations)

def test_6_conflict_precedence():
    from api.index import ClassInfo, Assessment
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="09:00", endTime="13:00")
    classes = [ClassInfo(name="Business 101", day="Friday", startTime="10:00", endTime="12:00")]
    assessments = [Assessment(name="Group Report", dueDate=FRI)]
    result = check_shift(proposed, classes, assessments, [], [])
    assert result.verdict == "Conflict"
    assert any("Group Report" in e for e in result.explanations)

def test_7_back_to_back_no_overlap():
    from api.index import ClassInfo
    proposed = ProposedShift(employer="Cafe", date=FRI, startTime="12:00", endTime="17:00")
    classes = [ClassInfo(name="Business 101", day="Friday", startTime="09:00", endTime="12:00")]
    result = check_shift(proposed, classes, [], [], [])
    assert result.verdict == "Good Fit"