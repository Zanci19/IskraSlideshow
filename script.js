// Slideshow configuration
const SLIDE_DURATION = 20000; // 20 seconds
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');

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
const slovakDays = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];

// Initialize slideshow
function initSlideshow() {
    showSlide(currentSlide);
    setInterval(nextSlide, SLIDE_DURATION);
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
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
}

// Move to next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Fetch weather data for Kranj
async function fetchWeather() {
    try {
        // Using OpenWeatherMap API (free tier)
        // For production, you should use your own API key
        const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key
        const city = 'Kranj';
        const country = 'SI';
        
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
        const dayName = slovakDays[date.getDay()];
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
}

// Display weather error
function displayWeatherError() {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = '<div class="loading">Napaka pri nalaganju vremenske napovedi</div>';
}

// Fetch news from RSS feed
async function fetchNews() {
    try {
        const RSS_URL = 'https://sckr.si/?show=1000&format=feed&type=rss';
        
        // Use a CORS proxy for development
        const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
        const url = CORS_PROXY + encodeURIComponent(RSS_URL);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('RSS fetch error');
        
        const text = await response.text();
        parseRSSFeed(text);
    } catch (error) {
        console.error('Error fetching news:', error);
        displayNewsError();
    }
}

// Parse RSS feed
function parseRSSFeed(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xml.querySelectorAll('item');
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    
    if (items.length === 0) {
        newsContainer.innerHTML = '<div class="loading">Trenutno ni razpoložljivih novic</div>';
        return;
    }
    
    items.forEach((item, index) => {
        // Limit to first 9 news items for better display
        if (index >= 9) return;
        
        const title = item.querySelector('title')?.textContent || 'Brez naslova';
        const link = item.querySelector('link')?.textContent || '#';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        // Format date
        let formattedDate = '';
        if (pubDate) {
            try {
                const date = new Date(pubDate);
                formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            } catch (e) {
                formattedDate = pubDate;
            }
        }
        
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <div class="news-title">${title}</div>
            ${formattedDate ? `<div class="news-date">📅 ${formattedDate}</div>` : ''}
            ${description ? `<div class="news-description">${stripHTML(description)}</div>` : ''}
            <a href="${link}" class="news-link" target="_blank">Preberi več →</a>
        `;
        
        newsContainer.appendChild(newsItem);
    });
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
    
    // Refresh weather and news every 10 minutes
    setInterval(() => {
        fetchWeather();
        fetchNews();
    }, 600000);
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    } else if (e.key === 'ArrowLeft') {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
});
