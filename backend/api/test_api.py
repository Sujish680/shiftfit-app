"""ShiftFit API Tests — 7 golden-master scenarios + validation + parity.
Run: cd backend && python -m pytest api/test_api.py -v"""

import pytest
from fastapi.testclient import TestClient
from api.index import app, check_shift, ProposedShift

client = TestClient(app)
FRI = "2026-10-16"
DASH = "\u2013"
E = {"classes": [], "assessments": [], "studyBlocks": [], "workShifts": []}

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_invalid_request():
    assert client.post("/api/check-shift", json={}).status_code == 422

def test_1_good_fit():
    p = {"employer": "Cafe", "date": FRI, "startTime": "09:00", "endTime": "17:00"}
    d = client.post("/api/check-shift", json={"proposed": p, **E}).json()
    assert d["verdict"] == "Good Fit"
    assert "No scheduled class overlaps this shift" in d["explanations"]

def test_2_conflict_with_class():
    p = {"employer": "Cafe", "date": FRI, "startTime": "09:00", "endTime": "13:00"}
    classes = [{"name": "Business 101", "day": "Friday", "startTime": "10:00", "endTime": "12:00"}]
    d = client.post("/api/check-shift", json={"proposed": p, "classes": classes, "assessments": [], "studyBlocks": [], "workShifts": []}).json()
    assert d["verdict"] == "Conflict"
    assert "Business 101" in d["explanations"][0]

def test_3_conflict_with_work_shift():
    p = {"employer": "Cafe", "date": FRI, "startTime": "09:00", "endTime": "17:00"}
    ws = [{"employer": "Library", "date": FRI, "startTime": "08:00", "endTime": "12:00"}]
    d = client.post("/api/check-shift", json={"proposed": p, "classes": [], "assessments": [], "studyBlocks": [], "workShifts": ws}).json()
    assert d["verdict"] == "Conflict"
    assert any("Library" in e for e in d["explanations"])

def test_4_tight_fit_assessment():
    p = {"employer": "Cafe", "date": FRI, "startTime": "09:00", "endTime": "17:00"}
    a = [{"name": "Individual Assignment", "dueDate": FRI}]
    d = client.post("/api/check-shift", json={"proposed": p, "classes": [], "assessments": a, "studyBlocks": [], "workShifts": []}).json()
    assert d["verdict"] == "Tight Fit"
    assert any("Individual Assignment" in e for e in d["explanations"])

def test_5_tight_fit_study_block():
    p = {"employer": "Cafe", "date": FRI, "startTime": "09:00", "endTime": "13:00"}
    sb = [{"day": "Friday", "startTime": "10:00", "endTime": "14:00"}]
    d = client.post("/api/check-shift", json={"proposed": p, "classes": [], "assessments": [], "studyBlocks": sb, "workShifts": []}).json()
    assert d["verdict"] == "Tight Fit"
    assert any("study time" in e for e in d["explanations"])

def test_6_conflict_precedence():
    p = {"employer": "Cafe", "date": FRI, "startTime": "09:00", "endTime": "13:00"}
    classes = [{"name": "Business 101", "day": "Friday", "startTime": "10:00", "endTime": "12:00"}]
    assessments = [{"name": "Group Report", "dueDate": FRI}]
    d = client.post("/api/check-shift", json={"proposed": p, "classes": classes, "assessments": assessments, "studyBlocks": [], "workShifts": []}).json()
    assert d["verdict"] == "Conflict"
    assert any("Group Report" in e for e in d["explanations"])

def test_7_back_to_back_no_overlap():
    p = {"employer": "Cafe", "date": FRI, "startTime": "12:00", "endTime": "17:00"}
    classes = [{"name": "Business 101", "day": "Friday", "startTime": "09:00", "endTime": "12:00"}]
    d = client.post("/api/check-shift", json={"proposed": p, "classes": classes, "assessments": [], "studyBlocks": [], "workShifts": []}).json()
    assert d["verdict"] == "Good Fit"

def test_parity_all_scenarios():
    from api.index import ClassInfo, Assessment, StudyBlock, WorkShift
    scenarios = [
        ({"employer":"Cafe","date":FRI,"startTime":"09:00","endTime":"17:00"}, [], [], [], [], "Good Fit"),
        ({"employer":"Cafe","date":FRI,"startTime":"09:00","endTime":"13:00"}, [{"name":"B101","day":"Friday","startTime":"10:00","endTime":"12:00"}], [], [], [], "Conflict"),
        ({"employer":"Cafe","date":FRI,"startTime":"09:00","endTime":"17:00"}, [], [], [], [{"employer":"Lib","date":FRI,"startTime":"08:00","endTime":"12:00"}], "Conflict"),
        ({"employer":"Cafe","date":FRI,"startTime":"09:00","endTime":"17:00"}, [], [{"name":"A1","dueDate":FRI}], [], [], "Tight Fit"),
        ({"employer":"Cafe","date":FRI,"startTime":"09:00","endTime":"13:00"}, [], [], [{"day":"Friday","startTime":"10:00","endTime":"14:00"}], [], "Tight Fit"),
        ({"employer":"Cafe","date":FRI,"startTime":"09:00","endTime":"13:00"}, [{"name":"B101","day":"Friday","startTime":"10:00","endTime":"12:00"}], [{"name":"R1","dueDate":FRI}], [], [], "Conflict"),
        ({"employer":"Cafe","date":FRI,"startTime":"12:00","endTime":"17:00"}, [{"name":"B101","day":"Friday","startTime":"09:00","endTime":"12:00"}], [], [], [], "Good Fit"),
    ]
    for proposed, classes, assessments, sb, ws, expected in scenarios:
        result = check_shift(
            ProposedShift(**proposed),
            [ClassInfo(**c) for c in classes],
            [Assessment(**a) for a in assessments],
            [StudyBlock(**b) for b in sb],
            [WorkShift(**w) for w in ws],
        )
        assert result.verdict == expected
        assert len(result.explanations) >= 2