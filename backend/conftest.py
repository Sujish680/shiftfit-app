"""
conftest.py — pytest configuration for ShiftFit backend tests.
Mocks environment variables so tests can run without real Supabase credentials.
"""

import os

# Set mock environment variables before any imports
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_PUBLISHABLE_KEY"] = "test-anon-key-12345"
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test"