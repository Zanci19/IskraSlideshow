# IskraSlideshow Server

This is a simple HTTP server that serves the slideshow and provides an API endpoint for fetching meals from eAsistent.

## Features

- Serves static files (HTML, CSS, JS)
- Provides `/api/meals` endpoint that fetches meals from eAsistent API
- Handles CORS for frontend requests
- Automatically saves fetched meals to `meals.json` for persistence

## Prerequisites

- Node.js 18 or higher
- eAsistent credentials (username and password)

## Setup

1. **Configure Credentials**

   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your eAsistent credentials:
   ```
   EASISTENT_USERNAME=your_email@example.com
   EASISTENT_PASSWORD=your_password_here
   ```

2. **Start the Server**

   ```bash
   node server.js
   ```

   The server will start on port 3000 by default. You should see:
   ```
   ============================================================
   IskraSlideshow Server
   ============================================================

   Server running at http://localhost:3000/

   Available endpoints:
     - http://localhost:3000/          (slideshow)
     - http://localhost:3000/api/meals (meals API)

   Press Ctrl+C to stop the server
   ============================================================
   ```

3. **Open the Slideshow**

   Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```

## How It Works

1. When you open the slideshow in your browser, it will attempt to fetch meals from `/api/meals`
2. The server receives the request and:
   - Logs in to eAsistent using your credentials
   - Fetches the current day's meal menu
   - Returns the data as JSON
   - Saves it to `meals.json` for persistence
3. If the API call fails, the slideshow will:
   - Display an error message
   - Try to load from the embedded data in `index.html`
   - Try to load from `meals.json` as a fallback

## API Endpoints

### GET /api/meals

Fetches the current day's meal menu from eAsistent.

**Response (Success):**
```json
{
  "items": [
    {
      "date": "2026-02-12",
      "menus": {
        "breakfast": [...],
        "snack": [...],
        "lunch": [...],
        "afternoon_snack": [...]
      }
    }
  ]
}
```

**Response (Error):**
```json
{
  "error": "Failed to fetch meals from eAsistent API",
  "message": "Login failed: ..."
}
```

## Customization

### Change Port

Set the `PORT` environment variable:
```bash
PORT=8080 node server.js
```

Or add it to your `.env` file:
```
PORT=8080
```

## Troubleshooting

### "Credentials not configured"

- Make sure you have created the `.env` file
- Check that it contains `EASISTENT_USERNAME` and `EASISTENT_PASSWORD`
- Verify there are no extra spaces around the `=` sign

### "Login failed"

- Verify your credentials are correct
- Check your internet connection
- Ensure eAsistent.com is accessible from your network

### Port Already in Use

If port 3000 is already in use, you'll see an error. Change the port using the `PORT` environment variable:
```bash
PORT=8080 node server.js
```

## Production Deployment

For production deployment:

1. **Use Process Manager**

   Use PM2 to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name iskra-slideshow
   pm2 save
   pm2 startup
   ```

2. **Use Reverse Proxy**

   Configure nginx or Apache to proxy requests to the Node.js server.

3. **Use HTTPS**

   Set up SSL/TLS certificates for secure connections.

## Security Notes

- Never commit the `.env` file to version control
- The `.env` file is already excluded via `.gitignore`
- Keep your credentials secure
- For production, consider using environment variables instead of `.env` file
- The server runs on localhost by default; configure firewall rules if exposing to network

## Alternative: Static File Approach

If you prefer not to run a server, you can still use the standalone scripts:

1. Run `node fetch_meals.js` or `python3 fetch_meals.py` to update meals
2. Open `index.html` directly in your browser (uses embedded data)
3. Automate with cron/Task Scheduler for regular updates

See [README-MEALS.md](README-MEALS.md) for details on this approach.
