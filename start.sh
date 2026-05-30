
#!/usr/bin/env bash

set -e

echo "Creating Python virtual environment..."

cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install --upgrade pip

pip install -r requirements.txt

echo "Starting backend on http://localhost:8000"

uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

BACKEND_PID=$!

cd ../frontend

echo "Installing frontend dependencies..."

npm install

echo "Starting frontend on http://localhost:5173"

npm run dev

kill $BACKEND_PID

