#!/usr/bin/env node
/**
 * Fetch meals data from easistent.com API and update both meals.json and index.html
 *
 * This script:
 * 1. Logs in to easistent.com using credentials from environment variables
 * 2. Fetches the daily meal menu
 * 3. Updates meals.json
 * 4. Updates the embedded meals data in index.html
 *
 * Required environment variables:
 * - EASISTENT_USERNAME: Your easistent.com username/email
 * - EASISTENT_PASSWORD: Your easistent.com password
 */

const fs = require('fs');
const path = require('path');

function loadCredentials() {
    let username = process.env.EASISTENT_USERNAME;
    let password = process.env.EASISTENT_PASSWORD;

    if (!username || !password) {
        const envFile = path.join(__dirname, '.env');
        if (fs.existsSync(envFile)) {
            console.log('Loading credentials from .env file...');
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

    if (!username || !password) {
        console.error('ERROR: Credentials not found!');
        console.error('Please set EASISTENT_USERNAME and EASISTENT_PASSWORD environment variables');
        console.error('or create a .env file with these variables.');
        process.exit(1);
    }

    return { username, password };
}

function formatDateYYYYMMDD(date = new Date()) {
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

    // Use both key variants so login works regardless of expected payload naming.
    const loginPayload = {
        username,
        password,
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
        console.error(`Response: ${errorText}`);
        return null;
    }

    const loginResult = await loginResponse.json();
    console.log('✓ Login successful');

    const accessToken = loginResult?.access_token?.token;
    const childId = loginResult?.user?.id;

    if (!accessToken || !childId) {
        console.error('ERROR: Login response missing access token or child ID.');
        return null;
    }

    const currentDate = formatDateYYYYMMDD();
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
        console.error(`Response: ${errorText}`);
        return null;
    }

    console.log('✓ Meals data fetched successfully');
    return mealsResponse.json();
}

function updateMealsJson(mealsData, filepath = 'meals.json') {
    fs.writeFileSync(filepath, `${JSON.stringify(mealsData, null, 2)}\n`, 'utf8');
    console.log(`✓ Updated ${filepath}`);
}

function updateIndexHtml(mealsData, filepath = 'index.html') {
    const htmlContent = fs.readFileSync(filepath, 'utf8');

    const startTag = '<script id="embedded-meals-data" type="application/json">';
    const endTag = '</script>';

    const startIdx = htmlContent.indexOf(startTag);
    if (startIdx === -1) {
        console.warn('WARNING: Could not find embedded-meals-data script tag in index.html');
        return false;
    }

    const searchStart = startIdx + startTag.length;
    const endIdx = htmlContent.indexOf(endTag, searchStart);
    if (endIdx === -1) {
        console.warn('WARNING: Could not find closing script tag in index.html');
        return false;
    }

    const jsonStr = JSON.stringify(mealsData, null, 2);
    const newHtmlContent = `${htmlContent.slice(0, startIdx + startTag.length)}\n${jsonStr}\n    ${htmlContent.slice(endIdx)}`;

    fs.writeFileSync(filepath, newHtmlContent, 'utf8');
    console.log(`✓ Updated embedded meals data in ${filepath}`);
    return true;
}

async function main() {
    console.log('='.repeat(60));
    console.log('Easistent.com Meals Data Fetcher (JavaScript)');
    console.log('='.repeat(60));
    console.log('');

    process.chdir(__dirname);

    const { username, password } = loadCredentials();
    const mealsData = await fetchMealsFromApi(username, password);

    if (!mealsData) {
        console.error('\n❌ Failed to fetch meals data. No files were updated.');
        process.exit(1);
    }

    updateMealsJson(mealsData, 'meals.json');
    updateIndexHtml(mealsData, 'index.html');

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ All updates completed successfully!');
    console.log('='.repeat(60));
}

main().catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
});
