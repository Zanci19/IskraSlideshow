# Quick Start Guide - IskraSlideshow Meals

## What Was Fixed
✅ CORS error when opening index.html directly
✅ Meals now display perfectly on Slide 4
✅ Automated updates from easistent.com API

## How to Use

### Option 1: Just View (No Setup Required)
```bash
# Simply open index.html in your browser
# Meals are already embedded and working!
```

### Option 2: Enable Automatic Updates
```bash
# Step 1: Setup credentials (one-time)
cd /path/to/IskraSlideshow
cp .env.example .env
nano .env  # or use any text editor

# Add your credentials:
EASISTENT_USERNAME=your_email@example.com
EASISTENT_PASSWORD=your_password

# Step 2: Test the script
node fetch_meals.js

# You should see:
# ============================================================
# Easistent.com Meals Data Fetcher
# ============================================================
# Logging in to easistent.com...
# ✓ Login successful
# Fetching meals for 2026-02-10...
# ✓ Meals data fetched successfully
# ✓ Updated meals.json
# ✓ Updated embedded meals data in index.html
# ============================================================
# ✅ All updates completed successfully!
# ============================================================

# Step 3: Automate (optional)
crontab -e
# Add this line:
0 6 * * * cd /path/to/IskraSlideshow && node fetch_meals.js >> ~/meals_update.log 2>&1
```

## What Each Slide Shows

1. **Slide 1**: Šolski center Kranj - Title screen
2. **Slide 2**: Weather forecast for Kranj
3. **Slide 3**: News and announcements
4. **Slide 4**: 🍽️ Daily meal menu (Dnevni jedilnik)

## Meals Display on Slide 4

The slideshow displays meals in sections:
- **Zajtrk** (Breakfast) - if available
- **Malica** (Morning Snack) - if available
- **Kosilo** (Lunch) - if available
- **Popoldanska malica** (Afternoon Snack) - if available

Each meal shows:
- Menu name (e.g., "Priljubljeni meni")
- Description (e.g., "PEČENO PIŠČANČJE BEDRO, POMRI, SOLATA")

## Files You Need to Know

- `index.html` - Main slideshow file (contains embedded meals)
- `meals.json` - Backup meals data
- `fetch_meals.js` - Script to update meals from API
- `.env` - Your credentials (YOU create this from .env.example)
- `README-MEALS.md` - Complete documentation

## Troubleshooting

### "Meals not showing"
- Open browser console (F12)
- Look for: "Using embedded meals data from HTML"
- If you see CORS error: The embedded data fix should prevent this!

### "Script fails"
- Check credentials in .env file
- Verify internet connection
- Check if easistent.com is accessible

### "Want to update meals manually"
- Edit the `<script id="embedded-meals-data">` section in index.html
- Copy your meals JSON from easistent.com
- Save and refresh browser

## Security Note

⚠️ **IMPORTANT**: Never commit your `.env` file to Git!
- The `.gitignore` file already excludes it
- Only share `.env.example` (template)
- Keep your credentials secure

## Need Help?

- Full documentation: `README-MEALS.md`
- Usage guide: `README-USAGE.md`
- Check browser console for errors (F12)

## Success Indicators

When everything is working:
✅ Browser console: "Using embedded meals data from HTML"
✅ Slide 4 shows: "Dnevni jedilnik" with meal items
✅ No CORS errors in console
✅ Meals update when you run fetch_meals.js
