#!/bin/bash

# 🛑 Stop Script for Brilliant Interface Task Coordinator and Helper
# This script cleanly shuts down all running services

echo "🛑 Stopping Brilliant Interface Task Coordinator and Helper"
echo "================================================="

# Function to kill processes by name
kill_process() {
    local process_name="$1"
    local description="$2"
    
    echo "🔍 Checking for $description..."
    
    # Find and kill processes
    pids=$(pgrep -f "$process_name" 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "⚠️  Found $description processes: $pids"
        echo "🔪 Terminating $description..."
        
        # Try graceful termination first
        kill $pids 2>/dev/null
        sleep 2
        
        # Check if processes are still running
        remaining_pids=$(pgrep -f "$process_name" 2>/dev/null)
        
        if [ -n "$remaining_pids" ]; then
            echo "💥 Force killing stubborn $description processes..."
            kill -9 $remaining_pids 2>/dev/null
            sleep 1
        fi
        
        # Final check
        final_check=$(pgrep -f "$process_name" 2>/dev/null)
        if [ -z "$final_check" ]; then
            echo "✅ $description stopped successfully"
        else
            echo "❌ Failed to stop some $description processes"
        fi
    else
        echo "✅ No $description processes found"
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port="$1"
    local description="$2"
    
    echo "🔍 Checking port $port for $description..."
    
    # Find process using the port
    pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo "⚠️  Found process $pid using port $port"
        echo "🔪 Terminating process on port $port..."
        
        # Try graceful termination first
        kill $pid 2>/dev/null
        sleep 2
        
        # Check if process is still running
        remaining_pid=$(lsof -ti:$port 2>/dev/null)
        
        if [ -n "$remaining_pid" ]; then
            echo "💥 Force killing process on port $port..."
            kill -9 $remaining_pid 2>/dev/null
            sleep 1
        fi
        
        # Final check
        final_check=$(lsof -ti:$port 2>/dev/null)
        if [ -z "$final_check" ]; then
            echo "✅ Port $port freed successfully"
        else
            echo "❌ Failed to free port $port"
        fi
    else
        echo "✅ Port $port is already free"
    fi
}

# Stop Backend Server (Node.js)
echo ""
echo "🔧 Stopping Backend Server..."
kill_port 3000 "Backend Server"
kill_process "node.*index.js" "Backend Node.js"

# Stop Frontend Development Server (Vite)
echo ""
echo "🎨 Stopping Frontend Server..."
kill_port 5173 "Frontend Server (Vite default)"
kill_port 5174 "Frontend Server (alternative)"
kill_process "vite.*dev" "Frontend Vite"
kill_process "npm.*run.*dev" "Frontend npm dev"

# Stop any remaining Node.js processes related to the project
echo ""
echo "🧹 Cleaning up remaining processes..."
kill_process "brilliant-interface" "Project-related"

# Optional: Stop LM Studio if requested
read -p "🤖 Do you want to stop LM Studio as well? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔍 Stopping LM Studio..."
    
    # Try to use LM Studio CLI for clean shutdown
    lms_path="/Users/josephbeaman/.cache/lm-studio/bin/lms"
    if [[ -f "$lms_path" ]]; then
        echo "🛑 Using LM Studio CLI to stop server..."
        "$lms_path" server stop 2>/dev/null || true
        sleep 2
    fi
    
    # Fallback to process killing
    kill_process "LM Studio" "LM Studio"
    kill_port 1234 "LM Studio API"
else
    echo "ℹ️  LM Studio left running"
fi

# Final cleanup
echo ""
echo "🧽 Final cleanup..."

# Kill any orphaned processes
pkill -f "brilliant-interface" 2>/dev/null || true
pkill -f "core/backend" 2>/dev/null || true
pkill -f "core/frontend" 2>/dev/null || true

echo ""
echo "✅ Shutdown complete!"
echo ""
echo "📊 Port Status:"
echo "   Port 3000 (Backend): $(lsof -ti:3000 >/dev/null 2>&1 && echo "🔴 In Use" || echo "🟢 Free")"
echo "   Port 5173 (Frontend): $(lsof -ti:5173 >/dev/null 2>&1 && echo "🔴 In Use" || echo "🟢 Free")"
echo "   Port 1234 (LM Studio): $(lsof -ti:1234 >/dev/null 2>&1 && echo "🔴 In Use" || echo "🟢 Free")"
echo ""
echo "💡 To restart everything, run: ./start.sh"
echo "🛑 Brilliant Interface Task Coordinator and Helper stopped"
