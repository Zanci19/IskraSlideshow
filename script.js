// Slideshow configuration
const SLIDE_DURATION = 20000; // 20 seconds
const NEWS_ROTATION_DURATION = 20000; // 20 seconds per 3-news batch
const NEWS_BATCH_SIZE = 3; // Always display up to 3 news items per news loop
let currentSlide = 0;
let globalNewsStartIndex = 0; // Global position tracking - persists across slide transitions
let newsItems = [];
let newsRotationInterval = null;
let slideInterval = null; // Store the slide interval so we can reset it
let progressAnimationId = null;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const progressBar = document.getElementById('slide-progress-bar');

// Weather icons mapping
const weatherIcons = {
    'clear': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️',
    'default': '🌤️'
};

// Slovenian day names
const slovenianDays = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];

// Slovenian month names
const slovenianMonths = ['Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij', 'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'];

// Initialize slideshow
function initSlideshow() {
    showSlide(currentSlide);
    startSlideInterval();
    
    // Click navigation disabled - keyboard only
    // indicators.forEach((indicator, index) => {
    //     indicator.addEventListener('click', () => {
    //         currentSlide = index;
    //         showSlide(currentSlide);
    //         resetSlideTimer(); // Reset the timer when manually navigating
    //     });
    // });
}

// Start the slide interval
function startSlideInterval() {
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
}

// Reset the slide timer
function resetSlideTimer() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    startSlideInterval();
}

// Show specific slide
function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    indicators.forEach((indicator, i) => {
        if (i === index) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    // Start news rotation when on news slide
    if (index === 2 && newsItems.length > 0) {
        // Stop the main slide timer while on news slide
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }

        displayCurrentNewsBatch();
        startNewsRotation();
    } else {
        stopNewsRotation();
        startProgressBar(SLIDE_DURATION);
        resetSlideTimer();
    }
}

// Move to next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Fetch weather data for Kranj
async function fetchWeather() {
    try {
        // Using free weather API alternative (no key required)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=46.2389&longitude=14.3553&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Ljubljana&forecast_days=7`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        displayWeatherError();
    }
}

// Weather code to description and icon mapping
function getWeatherInfo(code) {
    const weatherCodes = {
        0: { desc: 'Jasno', icon: '☀️' },
        1: { desc: 'Pretežno jasno', icon: '🌤️' },
        2: { desc: 'Delno oblačno', icon: '⛅' },
        3: { desc: 'Oblačno', icon: '☁️' },
        45: { desc: 'Megla', icon: '🌫️' },
        48: { desc: 'Megla z ivjem', icon: '🌫️' },
        51: { desc: 'Rahlo rosenje', icon: '🌦️' },
        53: { desc: 'Rosenje', icon: '🌦️' },
        55: { desc: 'Močno rosenje', icon: '🌧️' },
        61: { desc: 'Rahel dež', icon: '🌧️' },
        63: { desc: 'Dež', icon: '🌧️' },
        65: { desc: 'Močan dež', icon: '⛈️' },
        71: { desc: 'Rahel sneg', icon: '🌨️' },
        73: { desc: 'Sneg', icon: '❄️' },
        75: { desc: 'Močan sneg', icon: '❄️' },
        77: { desc: 'Snežne krupe', icon: '🌨️' },
        80: { desc: 'Rahle plohe', icon: '🌦️' },
        81: { desc: 'Plohe', icon: '🌧️' },
        82: { desc: 'Močne plohe', icon: '⛈️' },
        85: { desc: 'Snežne plohe', icon: '🌨️' },
        86: { desc: 'Močne snežne plohe', icon: '❄️' },
        95: { desc: 'Nevihta', icon: '⛈️' },
        96: { desc: 'Nevihta s točo', icon: '⛈️' },
        99: { desc: 'Močna nevihta s točo', icon: '⛈️' }
    };
    
    return weatherCodes[code] || { desc: 'Neznan vremenski pogoj', icon: '🌤️' };
}

// Display weather data
function displayWeather(data) {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = '';
    
    const daily = data.daily;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = slovenianDays[date.getDay()];
        const tempMax = Math.round(daily.temperature_2m_max[i]);
        const tempMin = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weathercode[i];
        const weatherInfo = getWeatherInfo(weatherCode);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'weather-day';
        dayElement.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="weather-icon">${weatherInfo.icon}</div>
            <div class="weather-temp">${tempMax}° / ${tempMin}°</div>
            <div class="weather-description">${weatherInfo.desc}</div>
            <div class="weather-details">${date.getDate()}.${date.getMonth() + 1}.</div>
        `;
        
        weatherContainer.appendChild(dayElement);
    }
    
    // Display mini weather widgets for today (first day)
    displayMiniWeather(data);
}

// Display mini weather widgets for today
function displayMiniWeather(data) {
    const miniWeatherTitle = document.getElementById('mini-weather-title');
    const miniWeatherNews = document.getElementById('mini-weather-news');
    
    if (!data || !data.daily || data.daily.time.length === 0) {
        return;
    }
    
    const daily = data.daily;
    const today = new Date(daily.time[0]);
    const dayName = slovenianDays[today.getDay()];
    const tempMax = Math.round(daily.temperature_2m_max[0]);
    const tempMin = Math.round(daily.temperature_2m_min[0]);
    const weatherCode = daily.weathercode[0];
    const weatherInfo = getWeatherInfo(weatherCode);
    
    const miniWidgetHTML = `
        <div class="mini-weather-icon">${weatherInfo.icon}</div>
        <div class="mini-weather-info">
            <div class="mini-weather-location">Kranj - ${dayName}</div>
            <div class="mini-weather-temp">${tempMax}° / ${tempMin}°</div>
            <div class="mini-weather-desc">${weatherInfo.desc}</div>
        </div>
    `;
    
    miniWeatherTitle.innerHTML = miniWidgetHTML;
    miniWeatherNews.innerHTML = miniWidgetHTML;
}

// Display weather error
function displayWeatherError() {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = '<div class="loading">Napaka pri nalaganju vremenske napovedi</div>';
    
    // Update mini weather widgets with error state
    const miniWeatherTitle = document.getElementById('mini-weather-title');
    const miniWeatherNews = document.getElementById('mini-weather-news');
    
    const errorHTML = '<div class="loading-mini">Vreme nedostopno</div>';
    if (miniWeatherTitle) miniWeatherTitle.innerHTML = errorHTML;
    if (miniWeatherNews) miniWeatherNews.innerHTML = errorHTML;
}

// Fetch meals data from easistent.com API
async function fetchMeals() {
    try {
        console.log('Logging in to easistent.com...');
        
        // Step 1: Login to easistent.com
        const loginUrl = 'https://www.easistent.com/m/login';
        const loginData = {
            uporabnik: 'zanci.torkarci64@gmail.com',
            geslo: 'szts11l!',
            supported_user_types: ['parent', 'child']
        };
        
        const loginHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'x-app-name': 'child',
            'x-client-version': '11101',
            'x-client-platform': 'android'
        };
        
        const loginResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: loginHeaders,
            body: JSON.stringify(loginData)
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }
        
        console.log('Login successful');
        
        // Step 2: Fetch meals data
        const mealsUrl = 'https://moj.easistent.com/api/meals/menus?date=2026-02-12';
        
        const mealsResponse = await fetch(mealsUrl, {
            method: 'GET',
            headers: loginHeaders
        });
        
        if (!mealsResponse.ok) {
            throw new Error(`Failed to fetch meals with status ${mealsResponse.status}`);
        }
        
        const mealsData = await mealsResponse.json();
        console.log('Meals data fetched successfully:', mealsData);
        
        // Display the meals data
        displayMeals(mealsData);
        
    } catch (error) {
        console.error('Error fetching meals:', error);
        displayMealsError(`Napaka pri pridobivanju jedilnika: ${error.message}`);
    }
}

// Display meals data
function displayMeals(data) {
    const mealsContainer = document.getElementById('meals-container');
    if (!mealsContainer) return;
    
    try {
        // Check if data has items array
        if (!data.items || data.items.length === 0) {
            mealsContainer.innerHTML = '<div class="loading">Ni razpoložljivih podatkov o jedilniku</div>';
            return;
        }
        
        const todayMeals = data.items[0]; // Get first item (today's meals)
        if (!todayMeals || !todayMeals.menus) {
            mealsContainer.innerHTML = '<div class="loading">Ni razpoložljivih podatkov o jedilniku</div>';
            return;
        }
        
        const menus = todayMeals.menus;
        let mealsHTML = '<div class="meals-grid">';
        
        // Display breakfast
        if (menus.breakfast && menus.breakfast.length > 0) {
            mealsHTML += '<div class="meal-section"><h3>Zajtrk</h3>';
            menus.breakfast.forEach(meal => {
                mealsHTML += `
                    <div class="meal-item">
                        <div class="meal-name">${meal.name}</div>
                        <div class="meal-description">${meal.description}</div>
                    </div>
                `;
            });
            mealsHTML += '</div>';
        }
        
        // Display snack (malica)
        if (menus.snack && menus.snack.length > 0) {
            mealsHTML += '<div class="meal-section"><h3>Malica</h3>';
            menus.snack.forEach(meal => {
                mealsHTML += `
                    <div class="meal-item">
                        <div class="meal-name">${meal.name}</div>
                        <div class="meal-description">${meal.description}</div>
                    </div>
                `;
            });
            mealsHTML += '</div>';
        }
        
        // Display lunch
        if (menus.lunch && menus.lunch.length > 0) {
            mealsHTML += '<div class="meal-section"><h3>Kosilo</h3>';
            menus.lunch.forEach(meal => {
                mealsHTML += `
                    <div class="meal-item">
                        <div class="meal-name">${meal.name}</div>
                        <div class="meal-description">${meal.description}</div>
                    </div>
                `;
            });
            mealsHTML += '</div>';
        }
        
        // Display afternoon snack
        if (menus.afternoon_snack && menus.afternoon_snack.length > 0) {
            mealsHTML += '<div class="meal-section"><h3>Popoldanska malica</h3>';
            menus.afternoon_snack.forEach(meal => {
                mealsHTML += `
                    <div class="meal-item">
                        <div class="meal-name">${meal.name}</div>
                        <div class="meal-description">${meal.description}</div>
                    </div>
                `;
            });
            mealsHTML += '</div>';
        }
        
        mealsHTML += '</div>';
        mealsContainer.innerHTML = mealsHTML;
    } catch (error) {
        console.error('Error displaying meals:', error);
        displayMealsError();
    }
}

// Display meals error
function displayMealsError(customMessage) {
    const mealsContainer = document.getElementById('meals-container');
    if (mealsContainer) {
        const errorMessage = customMessage || 'Napaka pri nalaganju jedilnika';
        mealsContainer.innerHTML = `<div class="loading error-message">${errorMessage}</div>`;
    }
}

// Fetch news from RSS feed
async function fetchNews() {
    try {
        const RSS_URL = 'https://sckr.si/?show=1000&format=feed&type=rss';
        
        const response = await fetch(RSS_URL);
        if (!response.ok) throw new Error('RSS fetch error');
        
        const text = await response.text();
        parseRSSFeed(text);
    } catch (error) {
        console.warn('Direct RSS fetch failed, trying proxy:', error);
        try {
            const RSS_URL = 'https://sckr.si/?show=1000&format=feed&type=rss';
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`;
            const proxyResponse = await fetch(proxyUrl);
            if (!proxyResponse.ok) throw new Error('Proxy fetch error');
            const proxyText = await proxyResponse.text();
            parseRSSFeed(proxyText);
        } catch (proxyError) {
            console.error('Error fetching news via proxy:', proxyError);
            displayNewsError();
        }
    }
}

// Parse RSS feed
function parseRSSFeed(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xml.querySelectorAll('item');
    newsItems = []; // Reset news items array
    
    if (items.length === 0) {
        const newsContainer = document.getElementById('news-container');
        newsContainer.innerHTML = '<div class="loading">Trenutno ni razpoložljivih novic</div>';
        return;
    }
    
    items.forEach((item, index) => {
        // Remove limit - fetch ALL news items
        
        const title = item.querySelector('title')?.textContent || 'Brez naslova';
        const link = item.querySelector('link')?.textContent || '#';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        // Try to extract image from various RSS fields
        let imageUrl = '';
        const enclosure = item.querySelector('enclosure[type^="image"]');
        if (enclosure) {
            imageUrl = enclosure.getAttribute('url');
        } else {
            // Try to find image in media:content or media:thumbnail
            const mediaContent = item.querySelector('content[url], thumbnail[url]');
            if (mediaContent) {
                imageUrl = mediaContent.getAttribute('url');
            } else {
                // Try to extract image from description HTML
                const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }
            }
        }
        
        // Format date
        let formattedDate = '';
        if (pubDate) {
            try {
                const date = new Date(pubDate);
                formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            } catch (e) {
                formattedDate = pubDate;
            }
        }
        
        newsItems.push({
            title,
            link,
            description: stripHTML(description),
            date: formattedDate,
            image: imageUrl
        });
    });
    
    // RSS feeds typically return newest items first, which is what we want
    // If the feed returns oldest first, we would need to reverse: newsItems.reverse();
    
    // Display first batch of news
    globalNewsStartIndex = 0; // Reset global position when fresh news is loaded
    displayCurrentNewsBatch();
    
    // Start rotation if on news slide
    if (currentSlide === 2) {
        startNewsRotation();
    }
}

// Display current batch of news items (up to 3)
function displayCurrentNewsBatch() {
    if (newsItems.length === 0) return;

    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    const batchItems = [];
    const batchSize = Math.min(NEWS_BATCH_SIZE, newsItems.length);

    for (let i = 0; i < batchSize; i++) {
        const itemIndex = (globalNewsStartIndex + i) % newsItems.length;
        batchItems.push(newsItems[itemIndex]);
    }

    startProgressBar(NEWS_ROTATION_DURATION);

    newsContainer.innerHTML = batchItems.map((news) => {
        const hasImage = Boolean(news.image);

        return `
        <div class="news-item${hasImage ? '' : ' no-image'}">
            ${hasImage ? `<img src="${news.image}" alt="${news.title}" class="news-image" onerror="this.closest('.news-item').classList.add('no-image'); this.remove();">` : ''}
            <div class="news-text">
                <div class="news-title">${news.title}</div>
                ${news.date ? `<div class="news-date">📅 ${news.date}</div>` : ''}
                ${news.description ? `<div class="news-description">${news.description}</div>` : '<div class="news-description">Več informacij na sckr.si</div>'}
                <a href="${news.link}" class="news-link" target="_blank" rel="noopener noreferrer">Preberi več →</a>
            </div>
        </div>
        `;
    }).join('');
}

// Start news rotation
function startNewsRotation() {
    stopNewsRotation(); // Clear any existing interval

    newsRotationInterval = setTimeout(() => {
        globalNewsStartIndex = (globalNewsStartIndex + NEWS_BATCH_SIZE) % newsItems.length;

        currentSlide = 0; // Go back to first slide
        showSlide(currentSlide);
        startSlideInterval(); // Restart the main slide timer
    }, NEWS_ROTATION_DURATION);
}

// Stop news rotation
function stopNewsRotation() {
    if (newsRotationInterval) {
        clearTimeout(newsRotationInterval);
        newsRotationInterval = null;
    }
}

// Strip HTML tags from text
function stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Display news error
function displayNewsError() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<div class="loading">Napaka pri nalaganju novic</div>';
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    fetchWeather();
    fetchNews();
    fetchMeals();
    updateDateTime(); // Initialize clock
    
    // Refresh weather, news and meals every 10 minutes
    setInterval(() => {
        fetchWeather();
        fetchNews();
        fetchMeals();
    }, 600000);
    
    // Update clock every second
    setInterval(updateDateTime, 1000);
});

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    
    if (timeDisplay && dateDisplay) {
        // Format time HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;
        
        // Format date: Day, DD Month YYYY
        const dayName = slovenianDays[now.getDay()];
        const day = now.getDate();
        const month = slovenianMonths[now.getMonth()];
        const year = now.getFullYear();
        dateDisplay.textContent = `${dayName}, ${day}. ${month} ${year}`;
    }
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        if (currentSlide !== 2) {
            resetSlideTimer();
        }
    } else if (e.key === 'ArrowLeft') {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
        if (currentSlide !== 2) {
            resetSlideTimer();
        }
    }
});

function startProgressBar(duration) {
    if (!progressBar) return;
    if (progressAnimationId) {
        cancelAnimationFrame(progressAnimationId);
    }

    const startTime = performance.now();
    progressBar.style.width = '0%';

    const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        progressBar.style.width = `${progress * 100}%`;

        if (progress < 1) {
            progressAnimationId = requestAnimationFrame(animate);
        }
    };

    progressAnimationId = requestAnimationFrame(animate);
}
