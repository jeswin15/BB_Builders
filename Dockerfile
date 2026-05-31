# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend source
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI backend
FROM python:3.11-slim AS backend
WORKDIR /app

# Copy the backend requirements and install them
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source
COPY backend/ ./backend/

# Copy the built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose port (Render sets PORT environment variable, defaults to 8000 here)
ENV PORT=8000
EXPOSE 8000

# Set the working directory to backend so uvicorn can find main.py
WORKDIR /app/backend

# Command to run the application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
