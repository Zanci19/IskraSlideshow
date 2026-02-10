# IskraSlideshow - Usage Instructions

## Overview
An automated HTML slideshow designed for display on a TV at the entrance of Šolski center Kranj. The slideshow displays the school title, weather forecast, and school news in a continuous loop.

## Features

### 🎬 Three Slides
1. **Title Slide**: Displays "Šolski center Kranj" with animated background
2. **Weather Slide**: 7-day weather forecast for Kranj with emoji icons
3. **News Slide**: Latest school news from the RSS feed

### ⚡ Key Features
- **Automatic Rotation**: Slides change every 20 seconds
- **Weather Integration**: Live weather data from Open-Meteo API
- **News Integration**: RSS feed from https://sckr.si
- **Graphics-Rich**: Large emoji icons, smooth animations, professional design
- **Responsive**: Adapts to different screen sizes
- **Keyboard Navigation**: Use arrow keys to navigate manually
- **Click Navigation**: Click indicator dots to jump to specific slides
- **Auto-Refresh**: Weather and news data refresh every 10 minutes
- **Offline Support**: Falls back to mock data if APIs are unreachable

## Setup

### Simple Setup (Recommended for TV Display)
1. Open `index.html` in any modern web browser
2. Press F11 for fullscreen mode
3. The slideshow will start automatically

### Using a Local Server (Alternative)
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (if you have http-server installed)
npx http-server -p 8080
```

Then open http://localhost:8080 in your browser.

## Configuration

### Adjusting Slide Duration
Edit `script.js` and change the `SLIDE_DURATION` constant (in milliseconds):
```javascript
const SLIDE_DURATION = 20000; // 20 seconds (default)
```

### Weather Location
The weather is currently set for Kranj, Slovenia. To change the location, edit the coordinates in `script.js`:
```javascript
const url = `https://api.open-meteo.com/v1/forecast?latitude=46.2389&longitude=14.3553&...`;
```

### RSS Feed URL
The news feed URL is set to `https://sckr.si/?show=1000&format=feed&type=rss`. To change it, edit `script.js`:
```javascript
const RSS_URL = 'https://sckr.si/?show=1000&format=feed&type=rss';
```

### Meals Data
The daily meals menu is embedded directly in `index.html` to avoid CORS issues when opening the file directly:
```html
<script id="embedded-meals-data" type="application/json">
{
  "items": [
    {
      "date": "2026-02-10",
      "menus": {
        "breakfast": [],
        "snack": [...],
        "lunch": [],
        "afternoon_snack": []
      }
    }
  ]
}
</script>
```

To update the meals menu, edit this JSON directly in `index.html` with data from the moj.asistent API.

## Controls

### Keyboard Navigation
- **Right Arrow**: Next slide
- **Left Arrow**: Previous slide

### Mouse Navigation
- **Click Indicators**: Click the dots at the bottom to jump to a specific slide

## Browser Compatibility
Works best in modern browsers:
- Google Chrome (recommended)
- Microsoft Edge
- Mozilla Firefox
- Safari

## TV Display Recommendations
1. **Set browser to fullscreen mode** (F11)
2. **Disable screen timeout/sleep** in OS settings
3. **Use a dedicated display device** (Raspberry Pi, Chromecast, etc.)
4. **Set browser to auto-start on boot** for kiosk mode
5. **Ensure stable internet connection** for live weather and news

## Troubleshooting

### CORS Error When Opening index.html Directly
**Issue**: "Access to fetch at 'file://...' has been blocked by CORS policy"

**Solution**: The meals data is now embedded directly in `index.html` to avoid CORS issues. The slideshow will automatically use this embedded data when opened from the file system.

To update the meals menu:
1. Edit the `<script id="embedded-meals-data">` section in `index.html`
2. Replace the JSON content with your updated meals data from the moj.asistent API
3. Ensure the JSON is valid (you can use a JSON validator tool)
4. Save the file and refresh the page

**Note**: The `meals.json` file is kept for reference and will be used as a fallback when the slideshow is served over HTTP (e.g., from a web server or API endpoint).

### Weather or News Not Loading
- Check internet connection
- Check if URLs are accessible from your network
- The slideshow will automatically use mock data if APIs fail
- Check browser console (F12) for error messages

### Slideshow Not Rotating
- Ensure JavaScript is enabled in browser
- Check browser console for errors
- Try refreshing the page (F5)

### Display Issues
- Try different browsers (Chrome recommended)
- Check if CSS and JS files are in same directory as index.html
- Clear browser cache (Ctrl+F5)

## Customization

### Colors and Styling
Edit `styles.css` to customize:
- Background gradient colors
- Font sizes and styles
- Animation speeds
- Card layouts

### Adding More Slides
1. Add a new slide div in `index.html`
2. Add corresponding CSS in `styles.css`
3. Update slide rotation logic in `script.js`
4. Add a new indicator dot

## Support
For issues or questions, please contact the school IT department or visit the GitHub repository.

---
**Made for Šolski center Kranj** 🎓
