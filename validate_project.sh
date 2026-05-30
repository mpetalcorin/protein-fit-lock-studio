#!/usr/bin/env bash
set -e

echo "Checking backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pytest -q
cd ..

echo ""
echo "Checking frontend..."
cd frontend
npm install
npm run build
cd ..

echo ""
echo "All validation checks passed."
