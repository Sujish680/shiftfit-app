"""
ShiftFit CRUD Module — Full Create/Read/Update/Delete for all four tables.
All endpoints require verified Supabase Auth bearer token.
User_id derived exclusively from verified token. Every query includes WHERE user_id = %s.
"""

import os
import re
from pathlib import Path
from datetime import date, time
from typing import Optional
from uuid import UUID

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from .auth import get_current_user

_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be set in backend/.env")

router = APIRouter(prefix="/api", tags=["crud"])

def get_db():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)

def validate_uuid(uuid_str: str) -> str:
    try:
        UUID(uuid_str)
        return uuid_str
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

def serialize_record(record: dict) -> dict:
    if record is None:
        return None
    result = {}
    for key, value in record.items():
        if isinstance(value, UUID):
            result[key] = str(value)
        elif isinstance(value, (date, time)):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


# ── Pydantic models ──────────────────────────────────────────────────────────

class ClassCreate(BaseModel):
    name: str
    day: str
    startTime: str
    endTime: str

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @field_validator('day')
    @classmethod
    def valid_day(cls, v):
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if v not in valid_days:
            raise ValueError(f'Day must be one of: {", ".join(valid_days)}')
        return v

    @field_validator('startTime', 'endTime')
    @classmethod
    def valid_time(cls, v):
        if not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', v):
            raise ValueError('Time must be in HH:MM format (00:00-23:59)')
        return v

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    day: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None

    @field_validator('day')
    @classmethod
    def valid_day(cls, v):
        if v is not None:
            valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            if v not in valid_days:
                raise ValueError(f'Day must be one of: {", ".join(valid_days)}')
        return v

    @field_validator('startTime', 'endTime')
    @classmethod
    def valid_time(cls, v):
        if v is not None:
            if not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', v):
                raise ValueError('Time must be in HH:MM format (00:00-23:59)')
        return v

class AssessmentCreate(BaseModel):
    name: str
    dueDate: str

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @field_validator('dueDate')
    @classmethod
    def valid_date(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

class AssessmentUpdate(BaseModel):
    name: Optional[str] = None
    dueDate: Optional[str] = None

    @field_validator('dueDate')
    @classmethod
    def valid_date(cls, v):
        if v is not None:
            try:
                date.fromisoformat(v)
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v

class StudyBlockCreate(BaseModel):
    day: str
    startTime: str
    endTime: str

    @field_validator('day')
    @classmethod
    def valid_day(cls, v):
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if v not in valid_days:
            raise ValueError(f'Day must be one of: {", ".join(valid_days)}')
        return v

    @field_validator('startTime', 'endTime')
    @classmethod
    def valid_time(cls, v):
        if not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', v):
            raise ValueError('Time must be in HH:MM format (00:00-23:59)')
        return v

class StudyBlockUpdate(BaseModel):
    day: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None

    @field_validator('day')
    @classmethod
    def valid_day(cls, v):
        if v is not None:
            valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            if v not in valid_days:
                raise ValueError(f'Day must be one of: {", ".join(valid_days)}')
        return v

    @field_validator('startTime', 'endTime')
    @classmethod
    def valid_time(cls, v):
        if v is not None:
            if not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', v):
                raise ValueError('Time must be in HH:MM format (00:00-23:59)')
        return v

class WorkShiftCreate(BaseModel):
    employer: str
    date: str
    startTime: str
    endTime: str

    @field_validator('employer')
    @classmethod
    def employer_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Employer cannot be empty')
        return v.strip()

    @field_validator('date')
    @classmethod
    def valid_date(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('startTime', 'endTime')
    @classmethod
    def valid_time(cls, v):
        if not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', v):
            raise ValueError('Time must be in HH:MM format (00:00-23:59)')
        return v

class WorkShiftUpdate(BaseModel):
    employer: Optional[str] = None
    date: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None

    @field_validator('date')
    @classmethod
    def valid_date(cls, v):
        if v is not None:
            try:
                date.fromisoformat(v)
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('startTime', 'endTime')
    @classmethod
    def valid_time(cls, v):
        if v is not None:
            if not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', v):
                raise ValueError('Time must be in HH:MM format (00:00-23:59)')
        return v

# ══════════════════════════════════════════════════════════════════════════════
# CLASSES endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/classes")
async def get_classes(user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, day, start_time, end_time FROM classes WHERE user_id = %s ORDER BY created_at",
                    (user["user_id"],)
                )
                return [serialize_record(row) for row in cur.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch classes")

@router.post("/classes", status_code=201)
async def create_class(request: ClassCreate, user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO classes (user_id, name, day, start_time, end_time)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING id, name, day, start_time, end_time""",
                    (user["user_id"], request.name, request.day, request.startTime, request.endTime)
                )
                conn.commit()
                return serialize_record(cur.fetchone())
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create class")

@router.put("/classes/{class_id}")
async def update_class(class_id: str, request: ClassUpdate, user: dict = Depends(get_current_user)):
    class_id = validate_uuid(class_id)
    updates, params = [], []
    if request.name is not None:
        updates.append("name = %s"); params.append(request.name)
    if request.day is not None:
        updates.append("day = %s"); params.append(request.day)
    if request.startTime is not None:
        updates.append("start_time = %s"); params.append(request.startTime)
    if request.endTime is not None:
        updates.append("end_time = %s"); params.append(request.endTime)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.extend([class_id, user["user_id"]])
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE classes SET {', '.join(updates)} WHERE id = %s AND user_id = %s RETURNING id, name, day, start_time, end_time",
                    params
                )
                updated = cur.fetchone()
                if not updated:
                    raise HTTPException(status_code=404, detail="Class not found")
                conn.commit()
                return serialize_record(updated)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update class")

@router.delete("/classes/{class_id}")
async def delete_class(class_id: str, user: dict = Depends(get_current_user)):
    class_id = validate_uuid(class_id)
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM classes WHERE id = %s AND user_id = %s RETURNING id", (class_id, user["user_id"]))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Class not found")
                conn.commit()
                return {"message": "Deleted"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete class")

# ══════════════════════════════════════════════════════════════════════════════
# ASSESSMENTS endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/assessments")
async def get_assessments(user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, due_date FROM assessments WHERE user_id = %s ORDER BY created_at", (user["user_id"],))
                return [serialize_record(row) for row in cur.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch assessments")

@router.post("/assessments", status_code=201)
async def create_assessment(request: AssessmentCreate, user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO assessments (user_id, name, due_date) VALUES (%s, %s, %s) RETURNING id, name, due_date",
                    (user["user_id"], request.name, request.dueDate))
                conn.commit()
                return serialize_record(cur.fetchone())
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create assessment")

@router.put("/assessments/{assessment_id}")
async def update_assessment(assessment_id: str, request: AssessmentUpdate, user: dict = Depends(get_current_user)):
    assessment_id = validate_uuid(assessment_id)
    updates, params = [], []
    if request.name is not None:
        updates.append("name = %s"); params.append(request.name)
    if request.dueDate is not None:
        updates.append("due_date = %s"); params.append(request.dueDate)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.extend([assessment_id, user["user_id"]])
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE assessments SET {', '.join(updates)} WHERE id = %s AND user_id = %s RETURNING id, name, due_date", params)
                updated = cur.fetchone()
                if not updated:
                    raise HTTPException(status_code=404, detail="Assessment not found")
                conn.commit()
                return serialize_record(updated)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update assessment")

@router.delete("/assessments/{assessment_id}")
async def delete_assessment(assessment_id: str, user: dict = Depends(get_current_user)):
    assessment_id = validate_uuid(assessment_id)
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM assessments WHERE id = %s AND user_id = %s RETURNING id", (assessment_id, user["user_id"]))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Assessment not found")
                conn.commit()
                return {"message": "Deleted"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete assessment")

# ══════════════════════════════════════════════════════════════════════════════
# STUDY_BLOCKS endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/study-blocks")
async def get_study_blocks(user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, day, start_time, end_time FROM study_blocks WHERE user_id = %s ORDER BY created_at", (user["user_id"],))
                return [serialize_record(row) for row in cur.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch study blocks")

@router.post("/study-blocks", status_code=201)
async def create_study_block(request: StudyBlockCreate, user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO study_blocks (user_id, day, start_time, end_time) VALUES (%s, %s, %s, %s) RETURNING id, day, start_time, end_time",
                    (user["user_id"], request.day, request.startTime, request.endTime))
                conn.commit()
                return serialize_record(cur.fetchone())
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create study block")

@router.put("/study-blocks/{block_id}")
async def update_study_block(block_id: str, request: StudyBlockUpdate, user: dict = Depends(get_current_user)):
    block_id = validate_uuid(block_id)
    updates, params = [], []
    if request.day is not None:
        updates.append("day = %s"); params.append(request.day)
    if request.startTime is not None:
        updates.append("start_time = %s"); params.append(request.startTime)
    if request.endTime is not None:
        updates.append("end_time = %s"); params.append(request.endTime)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.extend([block_id, user["user_id"]])
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE study_blocks SET {', '.join(updates)} WHERE id = %s AND user_id = %s RETURNING id, day, start_time, end_time", params)
                updated = cur.fetchone()
                if not updated:
                    raise HTTPException(status_code=404, detail="Study block not found")
                conn.commit()
                return serialize_record(updated)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update study block")

@router.delete("/study-blocks/{block_id}")
async def delete_study_block(block_id: str, user: dict = Depends(get_current_user)):
    block_id = validate_uuid(block_id)
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM study_blocks WHERE id = %s AND user_id = %s RETURNING id", (block_id, user["user_id"]))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Study block not found")
                conn.commit()
                return {"message": "Deleted"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete study block")

# ══════════════════════════════════════════════════════════════════════════════
# WORK_SHIFTS endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/work-shifts")
async def get_work_shifts(user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, employer, date, start_time, end_time FROM work_shifts WHERE user_id = %s ORDER BY created_at", (user["user_id"],))
                return [serialize_record(row) for row in cur.fetchall()]
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch work shifts")

@router.post("/work-shifts", status_code=201)
async def create_work_shift(request: WorkShiftCreate, user: dict = Depends(get_current_user)):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO work_shifts (user_id, employer, date, start_time, end_time) VALUES (%s, %s, %s, %s, %s) RETURNING id, employer, date, start_time, end_time",
                    (user["user_id"], request.employer, request.date, request.startTime, request.endTime))
                conn.commit()
                return serialize_record(cur.fetchone())
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create work shift")

@router.put("/work-shifts/{shift_id}")
async def update_work_shift(shift_id: str, request: WorkShiftUpdate, user: dict = Depends(get_current_user)):
    shift_id = validate_uuid(shift_id)
    updates, params = [], []
    if request.employer is not None:
        updates.append("employer = %s"); params.append(request.employer)
    if request.date is not None:
        updates.append("date = %s"); params.append(request.date)
    if request.startTime is not None:
        updates.append("start_time = %s"); params.append(request.startTime)
    if request.endTime is not None:
        updates.append("end_time = %s"); params.append(request.endTime)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    params.extend([shift_id, user["user_id"]])
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE work_shifts SET {', '.join(updates)} WHERE id = %s AND user_id = %s RETURNING id, employer, date, start_time, end_time", params)
                updated = cur.fetchone()
                if not updated:
                    raise HTTPException(status_code=404, detail="Work shift not found")
                conn.commit()
                return serialize_record(updated)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update work shift")

@router.delete("/work-shifts/{shift_id}")
async def delete_work_shift(shift_id: str, user: dict = Depends(get_current_user)):
    shift_id = validate_uuid(shift_id)
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM work_shifts WHERE id = %s AND user_id = %s RETURNING id", (shift_id, user["user_id"]))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Work shift not found")
                conn.commit()
                return {"message": "Deleted"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete work shift")
        raise HTTPException(status_code=500, detail="Failed to delete study block")