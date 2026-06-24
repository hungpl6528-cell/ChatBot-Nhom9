"""
Start script
"""
import subprocess
import sys
import os
import time

def run():
    print("Starting services...")
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    
    # Run uvicorn
    try:
        print("Starting Backend on port 8000...")
        subprocess.run([sys.executable, "-m", "uvicorn", "app.api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"], cwd=backend_dir)
    except KeyboardInterrupt:
        print("Shutting down...")

if __name__ == "__main__":
    run()
