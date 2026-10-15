"""
Vercel Python serverless entry point.
Imports the FastAPI application from the backend package.
"""

import sys
from pathlib import Path

# Add project root to Python path so backend/ is importable
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the FastAPI app (backend.api.index exposes `app`)
from backend.api.index import app