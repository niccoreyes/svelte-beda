#!/bin/bash
# Quick browser debug script for svelte-beda
# Opens the app in a browser and provides a snapshot for inspection

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
URL="${1:-http://localhost:5173}"

echo "🔍 Browser Debug: $URL"
echo ""

# Check if server is running
if ! curl -sf "$URL" > /dev/null 2>&1; then
  echo "⚡ Starting dev server..."
  cd "$ROOT"
  npm run dev &
  DEV_PID=$!
  
  # Wait for server
  for i in {1..60}; do
    if curl -sf "$URL" > /dev/null 2>&1; then
      echo "✅ Server ready"
      break
    fi
    sleep 1
  done
  
  trap "kill $DEV_PID 2>/dev/null || true" EXIT
fi

# Open browser and take snapshot
echo "🔌 Opening browser..."
agent-browser open "$URL"
agent-browser wait --load networkidle

echo ""
echo "📸 Page snapshot:"
agent-browser snapshot -i

echo ""
echo "💡 Commands you can run:"
echo "   agent-browser snapshot -i           # Interactive elements"
echo "   agent-browser screenshot page.png     # Screenshot"
echo "   agent-browser click @e1             # Click element"
echo "   agent-browser get text @e1           # Get element text"
echo "   agent-browser eval 'document.title'   # Run JS"
echo "   agent-browser close --all           # Close browser"
echo ""
