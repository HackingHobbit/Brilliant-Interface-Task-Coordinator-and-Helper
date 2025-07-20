#!/bin/bash

# Brilliant Interface Task Coordinator and Helper (B.I.T.C.H)
# Startup Script - Handles all services and opens browser

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3000
FRONTEND_PORT=5173
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
LM_STUDIO_URL="http://localhost:1234"

echo -e "${BLUE}🤖 Starting Brilliant Interface Task Coordinator and Helper${NC}"
echo -e "${BLUE}=================================================${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Killing existing $service_name processes...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        
        if check_port $port; then
            echo -e "${RED}❌ Failed to free port $port. Please manually kill processes and try again.${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Port $port freed successfully${NC}"
        fi
    fi
}

# Function to start LM Studio server
start_lm_studio() {
    local lms_path="/Users/josephbeaman/.cache/lm-studio/bin/lms"
    
    # Check if LMS CLI exists
    if [[ ! -f "$lms_path" ]]; then
        echo -e "${YELLOW}⚠️  LM Studio CLI not found at $lms_path${NC}"
        echo -e "${YELLOW}   Please install LM Studio or update the path in this script${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🚀 Starting LM Studio server...${NC}"
    
    # Start LM Studio server with CORS enabled (required for web app)
    "$lms_path" server start --port 1234 --cors --quiet &
    LMS_PID=$!
    
    # Wait for LM Studio to start
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for LM Studio server to start...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$LM_STUDIO_URL/v1/models" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ LM Studio server started successfully${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "\n${RED}❌ LM Studio server failed to start within $((max_attempts * 2)) seconds${NC}"
    return 1
}

# Function to check if LM Studio is running, and start it if not
check_and_start_lm_studio() {
    echo -e "${BLUE}🔍 Checking LM Studio connection...${NC}"
    if curl -s "$LM_STUDIO_URL/v1/models" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ LM Studio is already running and accessible${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  LM Studio not detected at $LM_STUDIO_URL${NC}"
        echo -e "${BLUE}🔄 Attempting to start LM Studio server...${NC}"
        
        if start_lm_studio; then
            echo -e "${GREEN}✅ LM Studio server started successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to start LM Studio server${NC}"
            echo -e "${YELLOW}   Please ensure:${NC}"
            echo -e "${YELLOW}   • LM Studio is installed${NC}"
            echo -e "${YELLOW}   • A model is loaded (currently expecting: llama-3-8b-lexi-uncensored)${NC}"
            echo -e "${YELLOW}   • No firewall is blocking port 1234${NC}"
            echo -e "${YELLOW}   The application will start but AI features won't work${NC}"
            return 1
        fi
    fi
}

# Function to wait for service to start
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service_name to start on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✅ $service_name started successfully${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "\n${RED}❌ $service_name failed to start within $max_attempts seconds${NC}"
    return 1
}

# Function to open browser (cross-platform)
open_browser() {
    local url=$1
    echo -e "${BLUE}🌐 Opening browser to $url${NC}"
    
    # Detect OS and open browser accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "$url" 2>/dev/null || sensible-browser "$url" 2>/dev/null || true
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start "$url"
    else
        echo -e "${YELLOW}⚠️  Could not detect OS. Please manually open: $url${NC}"
    fi
}

# Main startup sequence
main() {
    echo -e "${BLUE}🔧 Preparing services...${NC}"
    
    # Check and kill existing processes
    kill_port $BACKEND_PORT "backend"
    kill_port $FRONTEND_PORT "frontend"
    
    # Check and start LM Studio if needed
    check_and_start_lm_studio || true
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "core" ]]; then
        echo -e "${RED}❌ Please run this script from the brilliant-interface root directory${NC}"
        exit 1
    fi
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        echo -e "${BLUE}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    # Start backend
    echo -e "${BLUE}🚀 Starting backend server...${NC}"
    cd core/backend

    # Start backend with logs output to terminal
    npm start &
    BACKEND_PID=$!
    cd ../..
    
    # Wait for backend to start
    if ! wait_for_service $BACKEND_PORT "Backend"; then
        echo -e "${RED}💥 Backend failed to start! Check the backend logs for errors.${NC}"
        echo -e "${YELLOW}📋 Backend log: core/backend/backend.log${NC}"
        echo -e "${YELLOW}💡 Try running 'cd core/backend && npm start' manually to see error details${NC}"
        if [ -f "core/backend/backend.log" ]; then
            echo -e "${YELLOW}📄 Last few lines of backend log:${NC}"
            tail -5 core/backend/backend.log
        fi
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Start frontend
    echo -e "${BLUE}🎨 Starting frontend application...${NC}"
    cd core/frontend
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend to start
    if ! wait_for_service $FRONTEND_PORT "Frontend"; then
        echo -e "${RED}💥 Frontend failed to start! This might be due to:${NC}"
        echo -e "${YELLOW}   • Port $FRONTEND_PORT already in use${NC}"
        echo -e "${YELLOW}   • Node.js/npm issues${NC}"
        echo -e "${YELLOW}   • Missing dependencies${NC}"
        echo -e "${YELLOW}💡 Try running 'cd core/frontend && npm run dev' manually to see error details${NC}"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Give services a moment to fully initialize
    sleep 3
    
    # Open browser
    open_browser "$FRONTEND_URL"
    
    echo -e "${GREEN}🎉 Brilliant Interface is now running!${NC}"
    echo -e "${GREEN}   Frontend: $FRONTEND_URL${NC}"
    echo -e "${GREEN}   Backend:  http://localhost:$BACKEND_PORT${NC}"
    echo -e "${BLUE}📝 Press Ctrl+C to stop all services${NC}"
    
    # Set up cleanup on exit
    trap 'echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"; kill $BACKEND_PID $FRONTEND_PID ${LMS_PID:-} 2>/dev/null || true; exit 0' INT TERM
    
    # Keep script running and monitor services
    echo -e "${BLUE}🔄 Monitoring services... Press Ctrl+C to stop${NC}"
    wait
}

# Run main function
main "$@"
