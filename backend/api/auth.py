"""
ShiftFit Authentication Module

Endpoints:
  POST /api/auth/signup  — Create new user account
  POST /api/auth/login   — Authenticate and get access token
  GET  /api/auth/me      — Get current authenticated user (protected)

Uses Supabase Auth for user management. Tokens verified server-side.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/ directory BEFORE reading env vars
# Uses absolute path to work regardless of working directory
_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from supabase import create_client, Client

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Load Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in backend/.env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Pydantic models ──────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    message: str
    user_id: str = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str

class UserResponse(BaseModel):
    user_id: str
    email: str


# ── Dependency: Get current user from Bearer token ───────────────────────────

async def get_current_user(authorization: str = Header(None)):
    """
    Verify access token and return user dict.
    Raises 401 for any authentication failure.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.split(" ", 1)[1].strip()
    
    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")
    
    try:
        response = supabase.auth.get_user(token)
        
        if response and response.user:
            return {"user_id": response.user.id, "email": response.user.email}
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "expired" in error_msg or "invalid" in error_msg or "jwt" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        else:
            raise HTTPException(status_code=500, detail="Authentication service error")


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(request: SignupRequest):
    """
    Create a new user account.
    Returns success message and user_id.
    Email confirmation may be required based on Supabase settings.
    """
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if response.user:
            return AuthResponse(
                message="Signup successful. Please check your email to confirm your account.",
                user_id=response.user.id
            )
        else:
            raise HTTPException(status_code=400, detail="Signup failed. Please try again.")
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        
        if "password" in error_msg and ("6" in error_msg or "short" in error_msg or "length" in error_msg):
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        elif "valid email" in error_msg or "invalid email" in error_msg:
            raise HTTPException(status_code=422, detail="Invalid email format")
        else:
            # Generic message - don't expose whether email exists
            raise HTTPException(status_code=400, detail="Signup failed. Please try again.")


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return access token.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if response.session and response.user:
            return LoginResponse(
                access_token=response.session.access_token,
                token_type="bearer",
                user_id=response.user.id
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        
        if "email not confirmed" in error_msg or "not confirmed" in error_msg:
            raise HTTPException(status_code=401, detail="Please confirm your email before logging in")
        elif "invalid login" in error_msg or "invalid credentials" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Requires valid Bearer token.
    """
    return UserResponse(user_id=user["user_id"], email=user["email"])