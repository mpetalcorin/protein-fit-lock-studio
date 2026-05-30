#!/usr/bin/env bash
set -e

echo "Testing backend health endpoint..."
curl -s http://localhost:8000/health | python3 -m json.tool

echo ""
echo "Testing demo endpoint..."
curl -s http://localhost:8000/demo | python3 -m json.tool | head -80
