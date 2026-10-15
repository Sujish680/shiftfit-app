"""
ShiftFit FastAPI Backend — api/index.py

Endpoints:
  GET  /api/health         — service health check
  POST /api/check-shift    — shift-fit decision logic (PROTECTED, uses DB data)
  /api/auth/*              — authentication endpoints (in auth.py)
  /api/*                   — CRUD endpoints (in crud.py)

Decision logic is a verbatim port from js/check.js (Assessment 2).
All rules, precedence, explanation strings and summaries are preserved.
"""

from datetime import date as Date
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.auth import router as auth_router, get_current_user
from api.crud import router as crud_router, get_db, serialize_record


# ── Pydantic models ──────────────────────────────────────────────────────────

class ProposedShift(BaseModel):
    employer: str
    date: str
    startTime: str
    endTime: str

class ClassInfo(BaseModel):
    name: str
    day: str
    startTime: str
    endTime: str

class Assessment(BaseModel):
    name: str
    dueDate: str

class StudyBlock(BaseModel):
    day: str
    startTime: str
    endTime: str

class WorkShift(BaseModel):
    employer: str
    date: str
    startTime: str
    endTime: str

class ShiftCheckRequest(BaseModel):
    proposed: ProposedShift
    classes: List[ClassInfo] = []
    assessments: List[Assessment] = []
    studyBlocks: List[StudyBlock] = []
    workShifts: List[WorkShift] = []

class ShiftCheckResponse(BaseModel):
    verdict: str
    summary: str
    explanations: List[str]


# ── Decision logic — verbatim port from js/check.js ──────────────────────────

DASH = "\u2013"

def time_to_minutes(time_str: str) -> int:
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])

def get_day_of_week(date_str: str) -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[Date.fromisoformat(date_str).weekday()]

def times_overlap(start1: int, end1: int, start2: int, end2: int) -> bool:
    return start1 < end2 and end1 > start2

def check_shift(proposed, classes, assessments, study_blocks, work_shifts):
    explanations = []
    has_conflict = False
    has_tight_fit = False
    proposed_day = get_day_of_week(proposed.date)
    proposed_start = time_to_minutes(proposed.startTime)
    proposed_end = time_to_minutes(proposed.endTime)

    # CHECK 1: Class conflicts
    class_conflict = False
    for cls in classes:
        if cls.day == proposed_day:
            if times_overlap(proposed_start, proposed_end,
                             time_to_minutes(cls.startTime), time_to_minutes(cls.endTime)):
                class_conflict = True
                has_conflict = True
                explanations.append(
                    f"Your class '{cls.name}' overlaps this shift "
                    f"({cls.day} {cls.startTime}{DASH}{cls.endTime})")
    if not class_conflict:
        explanations.append("No scheduled class overlaps this shift")

    # CHECK 2: Existing work shift conflicts
    work_conflict = False
    for shift in work_shifts:
        if shift.date == proposed.date:
            if times_overlap(proposed_start, proposed_end,
                             time_to_minutes(shift.startTime), time_to_minutes(shift.endTime)):
                work_conflict = True
                has_conflict = True
                explanations.append(
                    f"Your existing shift at '{shift.employer}' overlaps this shift "
                    f"({shift.startTime}{DASH}{shift.endTime})")
    if not work_conflict:
        explanations.append("No existing work shift overlaps this shift")

    # CHECK 3: Assessment deadline same day
    same_day_assessment = False
    for a in assessments:
        if a.dueDate == proposed.date:
            same_day_assessment = True
            has_tight_fit = True
            explanations.append(f"{a.name} is due on {proposed_day}")
    if same_day_assessment:
        explanations.append("Weekly work hours will increase; an assessment is due the same day")

    # CHECK 4: Study block affected
    for block in study_blocks:
        if block.day == proposed_day:
            if times_overlap(proposed_start, proposed_end,
                             time_to_minutes(block.startTime), time_to_minutes(block.endTime)):
                has_tight_fit = True
                explanations.append(f"Your planned study time on {proposed_day} would be reduced")

    # Verdict (Conflict > Tight Fit > Good Fit)
    if has_conflict:
        verdict = "Conflict"
        summary = "This shift has direct time conflicts with your commitments."
    elif has_tight_fit:
        verdict = "Tight Fit"
        summary = "This shift may affect your study or assessment deadlines."
    else:
        verdict = "Good Fit"
        summary = "This shift does not overlap any of your scheduled commitments."

    return ShiftCheckResponse(verdict=verdict, summary=summary, explanations=explanations)


# ── FastAPI application ──────────────────────────────────────────────────────

app = FastAPI(title="ShiftFit API", version="0.1.0")

# CORS - allow local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth and CRUD routers
app.include_router(auth_router)
app.include_router(crud_router)

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "ShiftFit API is running"}

@app.post("/api/check-shift", response_model=ShiftCheckResponse)
async def api_check_shift(
    proposed: ProposedShift,
    user: dict = Depends(get_current_user)
):
    """
    Check shift fit against the authenticated user's SAVED commitments.
    
    Fetches the user's classes, assessments, study blocks and work shifts
    from the database. Does NOT trust arbitrary data from the request body.
    """
    try:
        # Fetch user's saved data from database
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT name, day, start_time, end_time FROM classes WHERE user_id = %s", (user["user_id"],))
                classes_data = cur.fetchall()
                
                cur.execute("SELECT name, due_date FROM assessments WHERE user_id = %s", (user["user_id"],))
                assessments_data = cur.fetchall()
                
                cur.execute("SELECT day, start_time, end_time FROM study_blocks WHERE user_id = %s", (user["user_id"],))
                study_blocks_data = cur.fetchall()
                
                cur.execute("SELECT employer, date, start_time, end_time FROM work_shifts WHERE user_id = %s", (user["user_id"],))
                work_shifts_data = cur.fetchall()
        
        # Convert to Pydantic models for check_shift function
        classes = [ClassInfo(name=str(r['name']), day=str(r['day']), 
                            startTime=str(r['start_time'])[:5], endTime=str(r['end_time'])[:5]) 
                  for r in classes_data]
        assessments = [Assessment(name=str(r['name']), dueDate=str(r['due_date'])) 
                      for r in assessments_data]
        study_blocks = [StudyBlock(day=str(r['day']), 
                                  startTime=str(r['start_time'])[:5], endTime=str(r['end_time'])[:5]) 
                       for r in study_blocks_data]
        work_shifts = [WorkShift(employer=str(r['employer']), date=str(r['date']),
                                startTime=str(r['start_time'])[:5], endTime=str(r['end_time'])[:5]) 
                      for r in work_shifts_data]
        
        # Run decision logic with user's saved data
        return check_shift(
            proposed=proposed,
            classes=classes,
            assessments=assessments,
            study_blocks=study_blocks,
            work_shifts=work_shifts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to check shift")