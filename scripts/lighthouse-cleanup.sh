#!/bin/bash

# Lighthouse Chrome Profile Cleanup Script
# Removes all data from the isolated Chrome profile used for Lighthouse testing

PROFILE_DIR="$HOME/.lighthouse-chrome-profile"

echo "🧹 Starting Lighthouse Chrome profile cleanup..."

if [ -d "$PROFILE_DIR" ]; then
    echo "📁 Found profile directory: $PROFILE_DIR"
    
    # Stop any running Chrome processes using this profile
    echo "🔄 Stopping any Chrome processes using the Lighthouse profile..."
    pkill -f "user-data-dir=$PROFILE_DIR" 2>/dev/null || true
    
    # Wait a moment for processes to terminate
    sleep 2
    
    # Remove all profile data
    echo "🗑️  Removing profile data..."
    rm -rf "$PROFILE_DIR"/*
    
    # Recreate the directory structure
    mkdir -p "$PROFILE_DIR"
    
    echo "✅ Profile cleanup completed successfully"
else
    echo "📁 Profile directory not found, creating: $PROFILE_DIR"
    mkdir -p "$PROFILE_DIR"
fi

echo "🔒 Profile is ready for next Lighthouse run with clean state"