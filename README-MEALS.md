# Meals Data Fetcher

This Python script fetches the daily meal menu from easistent.com API and automatically updates both `meals.json` and the embedded data in `index.html`.

## Prerequisites

- Python 3.6 or higher
- `requests` library

## Installation

1. Install the required Python package:
```bash
pip install requests
```

## Setup

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your easistent.com credentials:
```
EASISTENT_USERNAME=your_email@example.com
EASISTENT_PASSWORD=your_password_here
```

**IMPORTANT**: The `.env` file is gitignored and will never be committed to the repository. Keep your credentials secure!

## Usage

Run the script from the repository directory:

```bash
python fetch_meals.py
```

or make it executable and run:

```bash
chmod +x fetch_meals.py
./fetch_meals.py
```

The script will:
1. Log in to easistent.com using your credentials
2. Fetch the current day's meal menu
3. Update `meals.json` with the fresh data
4. Update the embedded meals data in `index.html`

## Automation

You can automate this script to run daily using:

### On Linux/Mac (cron)

Edit your crontab:
```bash
crontab -e
```

Add a line to run the script daily at 6 AM:
```
0 6 * * * cd /path/to/IskraSlideshow && /usr/bin/python3 fetch_meals.py >> /var/log/meals_update.log 2>&1
```

### On Windows (Task Scheduler)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set it to run daily at your preferred time
4. Action: Start a program
5. Program: `python`
6. Arguments: `C:\path\to\IskraSlideshow\fetch_meals.py`
7. Start in: `C:\path\to\IskraSlideshow`

## Troubleshooting

### Login fails
- Check your username and password in the `.env` file
- Ensure you have an active easistent.com account
- Verify your internet connection

### Script can't find credentials
- Make sure the `.env` file exists in the same directory as `fetch_meals.py`
- Check that the file is properly formatted (KEY=value, no spaces around =)
- Try setting environment variables directly:
  ```bash
  export EASISTENT_USERNAME="your_email@example.com"
  export EASISTENT_PASSWORD="your_password"
  python fetch_meals.py
  ```

### Script updates meals.json but not index.html
- Verify that `index.html` contains the `<script id="embedded-meals-data">` tag
- The script looks for this specific tag to update the embedded data

## Security Notes

- Never commit the `.env` file or share your credentials
- The `.env` file is automatically excluded from Git via `.gitignore`
- Consider using environment variables on production servers instead of `.env` files
- The credentials are only used to authenticate with easistent.com API and are not stored elsewhere

## Manual Alternative

If you prefer not to use this script, you can manually:
1. Log in to easistent.com
2. Export your meal data as JSON
3. Update the `<script id="embedded-meals-data">` section in `index.html`
4. Update `meals.json` file
