#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE_PATH = '/data/meals.json';

const EASISTENT_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'x-app-name': 'child',
    'x-client-version': '11101',
    'x-client-platform': 'android'
};

const LOGIN_URL = 'https://www.easistent.com/m/login';
const LOGIN_PAYLOAD = {
    uporabnik: 'zanci.torkarci64@gmail.com',
    geslo: 'szts11l!',
    supported_user_types: ['parent', 'child']
};

function formatDateToYyyyMmDd(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loginToEasistent() {
    const loginResponse = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: EASISTENT_HEADERS,
        body: JSON.stringify(LOGIN_PAYLOAD)
    });

    if (!loginResponse.ok) {
        const text = await loginResponse.text();
        throw new Error(`Login failed (${loginResponse.status}): ${text}`);
    }

    const payload = await loginResponse.json();
    const token = payload?.access_token?.token;

    if (!token) {
        throw new Error('Login response did not include access_token.token');
    }

    return token;
}

async function fetchMealsForToday() {
    const token = await loginToEasistent();
    const currentDate = formatDateToYyyyMmDd(new Date());
    const mealsUrl = `https://moj.easistent.com/api/meals/menus?date=${currentDate}`;

    const mealsResponse = await fetch(mealsUrl, {
        method: 'GET',
        headers: {
            ...EASISTENT_HEADERS,
            authorization: `Bearer ${token}`
        }
    });

    if (!mealsResponse.ok) {
        const text = await mealsResponse.text();
        throw new Error(`Meals fetch failed (${mealsResponse.status}): ${text}`);
    }

    return mealsResponse.json();
}

function persistMealsJson(mealsData) {
    const dir = path.dirname(DATA_FILE_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(mealsData, null, 2), 'utf8');
}

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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (pathname === '/api/meals') {
        try {
            const mealsData = await fetchMealsForToday();
            persistMealsJson(mealsData);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mealsData));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Failed to fetch meals from eAsistent',
                message: error.message
            }));
        }
        return;
    }

    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
                return;
            }

            res.writeHead(500);
            res.end(`Server Error: ${error.code}`, 'utf-8');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Meals endpoint: http://localhost:${PORT}/api/meals`);
    console.log(`Meals JSON save path: ${DATA_FILE_PATH}`);
});
