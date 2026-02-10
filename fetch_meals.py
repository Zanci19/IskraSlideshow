#!/usr/bin/env python3
"""
Fetch meals data from easistent.com API and update both meals.json and index.html

This script:
1. Logs in to easistent.com using credentials from environment variables
2. Fetches the daily meal menu
3. Updates meals.json
4. Updates the embedded meals data in index.html

Required environment variables:
- EASISTENT_USERNAME: Your easistent.com username/email
- EASISTENT_PASSWORD: Your easistent.com password
"""

import requests
import json
import os
import sys
import re
from datetime import datetime


def load_credentials():
    """Load credentials from environment variables or .env file"""
    username = os.getenv('EASISTENT_USERNAME')
    password = os.getenv('EASISTENT_PASSWORD')
    
    # Try to load from .env file if environment variables are not set
    if not username or not password:
        env_file = os.path.join(os.path.dirname(__file__), '.env')
        if os.path.exists(env_file):
            print("Loading credentials from .env file...")
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            value = value.strip().strip('"').strip("'")
                            if key == 'EASISTENT_USERNAME':
                                username = value
                            elif key == 'EASISTENT_PASSWORD':
                                password = value
    
    if not username or not password:
        print("ERROR: Credentials not found!")
        print("Please set EASISTENT_USERNAME and EASISTENT_PASSWORD environment variables")
        print("or create a .env file with these variables.")
        sys.exit(1)
    
    return username, password


def fetch_meals_from_api(username, password):
    """Fetch meals data from easistent.com API"""
    session = requests.Session()
    
    login_url = "https://www.easistent.com/m/login"
    login_data = {
        "username": username,
        "password": password,
        "supported_user_types": ["parent", "child"]
    }
    
    session.headers.update({
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "x-app-name": "child",
        "x-client-version": "11101",
        "x-client-platform": "android"
    })
    
    print("Logging in to easistent.com...")
    response = session.post(login_url, json=login_data)
    
    if response.status_code != 200:
        print(f"ERROR: Login failed with status code {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    print("✓ Login successful")
    login_result = response.json()
    access_token = login_result["access_token"]["token"]
    child_id = login_result["user"]["id"]
    
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Headers for API requests
    api_headers = {
        "authorization": f"Bearer {access_token}",
        "x-app-name": "child",
        "x-client-version": "11101",
        "x-client-platform": "android",
        "X-Child-Id": str(child_id),
        "Content-Type": "application/json"
    }
    
    # Fetch meals
    print(f"Fetching meals for {current_date}...")
    meals_url = "https://www.easistent.com/m/meals/menus"
    params = {
        "from": current_date,
        "to": current_date
    }
    
    meals_response = session.get(meals_url, params=params, headers=api_headers)
    
    if meals_response.status_code != 200:
        print(f"ERROR: Failed to fetch meals with status code {meals_response.status_code}")
        print(f"Response: {meals_response.text}")
        return None
    
    print("✓ Meals data fetched successfully")
    return meals_response.json()


def update_meals_json(meals_data, filepath='meals.json'):
    """Update meals.json file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(meals_data, f, indent=2, ensure_ascii=False)
    print(f"✓ Updated {filepath}")


def update_index_html(meals_data, filepath='index.html'):
    """Update embedded meals data in index.html"""
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Find the script tag boundaries
    start_tag = '<script id="embedded-meals-data" type="application/json">'
    end_tag = '</script>'
    
    start_idx = html_content.find(start_tag)
    if start_idx == -1:
        print("WARNING: Could not find embedded-meals-data script tag in index.html")
        return False
    
    # Find the end tag after the start tag
    search_start = start_idx + len(start_tag)
    end_idx = html_content.find(end_tag, search_start)
    if end_idx == -1:
        print("WARNING: Could not find closing script tag in index.html")
        return False
    
    # Build the new JSON string
    json_str = json.dumps(meals_data, indent=2, ensure_ascii=False)
    
    # Construct the new HTML content
    new_html_content = (
        html_content[:start_idx + len(start_tag)] +
        '\n' + json_str + '\n    ' +
        html_content[end_idx:]
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html_content)
    
    print(f"✓ Updated embedded meals data in {filepath}")
    return True


def main():
    """Main function"""
    print("=" * 60)
    print("Easistent.com Meals Data Fetcher")
    print("=" * 60)
    print()
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Load credentials
    username, password = load_credentials()
    
    # Fetch meals data
    meals_data = fetch_meals_from_api(username, password)
    
    if not meals_data:
        print("\n❌ Failed to fetch meals data")
        sys.exit(1)
    
    # Update files
    print()
    update_meals_json(meals_data)
    update_index_html(meals_data)
    
    print()
    print("=" * 60)
    print("✅ All updates completed successfully!")
    print("=" * 60)
    
    # Display summary
    if meals_data.get('items'):
        first_item = meals_data['items'][0]
        print(f"\nDate: {first_item.get('date', 'N/A')}")
        if first_item.get('menus'):
            menus = first_item['menus']
            for menu_type, items in menus.items():
                if items:
                    print(f"  {menu_type}: {len(items)} item(s)")


if __name__ == '__main__':
    main()
