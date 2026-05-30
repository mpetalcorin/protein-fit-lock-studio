#!/usr/bin/env bash
set -e
cd frontend
npm install
npm run dev -- --host 0.0.0.0
