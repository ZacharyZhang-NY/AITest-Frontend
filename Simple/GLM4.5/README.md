# Accessibility Navigator Homepage

A fully accessible, scroll-driven website showcasing urban accessibility features.

## Features

- **Scroll-Driven Animations**: Uses native CSS Scroll-Linked Animations with IntersectionObserver fallback
- **Image Loading**: Optimized image loading with fallbacks using emojis
- **Accessibility**: Full ARIA support, keyboard navigation, and reduced motion preferences
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Self-Checking**: Built-in QA system that verifies all functionality
- **Performance**: Lazy loading, optimized animations, and efficient rendering

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # All styles and animations
├── app.js              # Core JavaScript functionality
├── qa.js               # QA and self-checking system
├── assets/
│   └── urls.txt        # Image URLs used
├── test-images.html    # Image testing utility
└── test.sh            # Test script
```

## Running the Project

1. **Direct Open**: Simply open `index.html` in a web browser
2. **Local Server**: For better testing, run a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Testing

The page includes a built-in QA system:
- Look for the status indicator (green checkmark or red exclamation) in the bottom-right corner
- Click it to see detailed test results
- All images have fallbacks that show if loading fails

Run the test script:
```bash
./test.sh
```

## Browser Support

- Modern browsers with CSS Scroll-Linked Animations support
- Graceful fallback for older browsers
- Mobile-friendly responsive design

## Accessibility Features

- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Reduced motion support
- High contrast mode ready
- Focus indicators

## Performance Optimizations

- Lazy loading for images
- CSS animations over JavaScript where possible
- Efficient scroll handling
- Minimal reflows and repaints
- Optimized image formats

## Notes

- All images are from Unsplash and may require internet connection
- The page works offline once loaded (except for images)
- No third-party libraries used - pure native web technologies