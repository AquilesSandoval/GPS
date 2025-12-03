#!/bin/bash

# Start backend in the background
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Give backend a moment to start
sleep 2

# Start frontend
cd frontend
npm run dev
