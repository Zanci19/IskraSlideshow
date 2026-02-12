#!/usr/bin/env node
/**
 * Simple HTTP server that serves the slideshow and provides API endpoint for meals
 * 
 * This server:
 * 1. Serves static files (HTML, CSS, JS)
 * 2. Provides /api/meals endpoint that fetches meals from easistent.com
 * 3. Handles CORS for the frontend
 * 
 * Usage:
 *   node server.js
 * 
 * Then open http://localhost:3000 in your browser
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Load credentials
function loadCredentials() {
    let username = "zanci.torkarci64@gmail.com";
    let password = "Szts11l!";

    if (!username || !password) {
        const envFile = path.join(__dirname, '.env');
        if (fs.existsSync(envFile)) {
            const envContent = fs.readFileSync(envFile, 'utf8');
            const lines = envContent.split('\n');

            for (const rawLine of lines) {
                const line = rawLine.trim();
                if (!line || line.startsWith('#') || !line.includes('=')) {
                    continue;
                }

                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
                const normalizedKey = key.trim();

                if (normalizedKey === 'EASISTENT_USERNAME') {
                    username = value;
                } else if (normalizedKey === 'EASISTENT_PASSWORD') {
                    password = value;
                }
            }
        }
    }

    return { username, password };
}

function formatDateToYyyyMmDd(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function fetchMealsFromApi(username, password) {
    const loginUrl = 'https://www.easistent.com/m/login';

    const commonHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'x-app-name': 'child',
        'x-client-version': '11101',
        'x-client-platform': 'android'
    };

    const loginPayload = {
        uporabnik: username,
        geslo: password,
        supported_user_types: ['parent', 'child']
    };

    console.log('Logging in to easistent.com...');
    const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(loginPayload)
    });

    if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error(`ERROR: Login failed with status code ${loginResponse.status}`);
        throw new Error(`Login failed: ${errorText}`);
    }

    const loginResult = await loginResponse.json();
    console.log('✓ Login successful');

    const accessToken = loginResult?.access_token?.token;
    const childId = loginResult?.user?.id;

    if (!accessToken || !childId) {
        throw new Error('Login response missing access token or child ID');
    }

    const currentDate = formatDateToYyyyMmDd(new Date());
    const mealsUrl = new URL('https://www.easistent.com/m/meals/menus');
    mealsUrl.searchParams.set('from', currentDate);
    mealsUrl.searchParams.set('to', currentDate);

    const mealsHeaders = {
        ...commonHeaders,
        authorization: `Bearer ${accessToken}`,
        'X-Child-Id': String(childId)
    };

    console.log(`Fetching meals for ${currentDate}...`);
    const mealsResponse = await fetch(mealsUrl, {
        method: 'GET',
        headers: mealsHeaders
    });

    if (!mealsResponse.ok) {
        const errorText = await mealsResponse.text();
        console.error(`ERROR: Failed to fetch meals with status code ${mealsResponse.status}`);
        throw new Error(`Failed to fetch meals: ${errorText}`);
    }

    console.log('✓ Meals data fetched successfully');
    return mealsResponse.json();
}

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API endpoint for meals
    if (pathname === '/api/meals') {
        try {
            const { username, password } = loadCredentials();
            
            if (!username || !password) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Credentials not configured. Please set up .env file with EASISTENT_USERNAME and EASISTENT_PASSWORD.' 
                }));
                return;
            }

            const mealsData = await fetchMealsFromApi(username, password);
            
            // Also save to meals.json for persistence
            const mealsJsonPath = path.join(__dirname, 'meals.json');
            fs.writeFileSync(mealsJsonPath, JSON.stringify(mealsData, null, 2), 'utf8');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mealsData));
        } catch (error) {
            console.error('Error fetching meals:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Failed to fetch meals from eAsistent API',
                message: error.message 
            }));
        }
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('IskraSlideshow Server');
    console.log('='.repeat(60));
    console.log('');
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  - http://localhost:${PORT}/          (slideshow)`);
    console.log(`  - http://localhost:${PORT}/api/meals (meals API)`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('='.repeat(60));
});
