#!/bin/bash

# Simple test script for the Accessibility Navigator page

echo "Testing Accessibility Navigator..."
echo "================================"

# Check if all files exist
files=("index.html" "styles.css" "app.js" "qa.js" "assets/urls.txt")
missing_files=()

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files exist"
else
    echo "❌ Missing files: ${missing_files[*]}"
    exit 1
fi

# Check file sizes
echo ""
echo "File sizes:"
for file in "${files[@]}"; do
    size=$(stat -c%s "$file" 2>/dev/null || echo "0")
    echo "  $file: $size bytes"
done

# Count images in HTML
image_count=$(grep -c '<img' index.html)
echo ""
echo "Images in HTML: $image_count"

# Check if JavaScript files have content
js_size_app=$(stat -c%s app.js 2>/dev/null || echo "0")
js_size_qa=$(stat -c%s qa.js 2>/dev/null || echo "0")

if [ "$js_size_app" -gt 1000 ] && [ "$js_size_qa" -gt 1000 ]; then
    echo "✅ JavaScript files have substantial content"
else
    echo "⚠️  JavaScript files might be incomplete"
fi

echo ""
echo "To test the page:"
echo "1. Open index.html in a web browser"
echo "2. Or run: python3 -m http.server 8000"
echo "3. Then visit: http://localhost:8000"
echo ""
echo "The page includes:"
echo "- Scroll-driven animations"
echo "- Image loading with fallbacks"
echo "- QA self-checking (click the status indicator in bottom-right)"
echo "- Responsive design"
echo "- Accessibility features"