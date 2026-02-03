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
const slovenianDays = ['Nedelja', 'Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota'];

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

// Mock weather data for fallback
function getMockWeatherData() {
    const today = new Date();
    const mockData = {
        daily: {
            time: [],
            temperature_2m_max: [18, 20, 19, 17, 21, 22, 20],
            temperature_2m_min: [8, 10, 9, 7, 11, 12, 10],
            weathercode: [1, 2, 61, 3, 0, 1, 2]
        }
    };
    
    // Generate dates for next 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        mockData.daily.time.push(date.toISOString().split('T')[0]);
    }
    
    return mockData;
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
        // Use mock data as fallback
        displayWeather(getMockWeatherData());
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
        48: { desc: 'Megla z ivje', icon: '🌫️' },
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
}

// Display weather error
function displayWeatherError() {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = '<div class="loading">Napaka pri nalaganju vremenske napovedi</div>';
}

// Mock news data for fallback
function getMockNewsData() {
    const mockNews = [
        {
            title: 'Uspešna zaključna prireditev dijakov',
            link: 'https://sckr.si',
            description: 'Dijaki zaključnih letnikov so se poslovili z izjemno uspešno prireditvijo. Program je bil bogat z glasbenimi in plesnimi točkami.',
            pubDate: new Date().toISOString()
        },
        {
            title: 'Dnevi odprtih vrat - povabilo',
            link: 'https://sckr.si',
            description: 'Vabimo vas na dneve odprtih vrat našega šolskega centra. Predstavili bomo vse programe in dejavnosti.',
            pubDate: new Date(Date.now() - 86400000).toISOString()
        },
        {
            title: 'Rezultati športnih tekmovanj',
            link: 'https://sckr.si',
            description: 'Naši dijaki so dosegli odlične rezultate na regijskem tekmovanju v atletiki. Čestitamo vsem udeležencem!',
            pubDate: new Date(Date.now() - 172800000).toISOString()
        },
        {
            title: 'Nova računalniška oprema',
            link: 'https://sckr.si',
            description: 'Šolski center je pridobil novo računalniško opremo za IT učilnice. Dijaki bodo imeli dostop do najnovejše tehnologije.',
            pubDate: new Date(Date.now() - 259200000).toISOString()
        },
        {
            title: 'Ekskurzija v Ljubljano',
            link: 'https://sckr.si',
            description: 'Dijaki so se udeležili ekskurzije v našo prestolnico, kjer so si ogledali parlament in različne kulturne ustanove.',
            pubDate: new Date(Date.now() - 345600000).toISOString()
        },
        {
            title: 'Predavanje o zdravi prehrani',
            link: 'https://sckr.si',
            description: 'Nutricionistka je predstavila pomembnost zdrave in uravnotežene prehrane za mladostnike.',
            pubDate: new Date(Date.now() - 432000000).toISOString()
        }
    ];
    
    // Create mock RSS XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>';
    mockNews.forEach(news => {
        xml += `<item>
            <title>${news.title}</title>
            <link>${news.link}</link>
            <description>${news.description}</description>
            <pubDate>${new Date(news.pubDate).toUTCString()}</pubDate>
        </item>`;
    });
    xml += '</channel></rss>';
    
    return xml;
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
        // Use mock data as fallback
        parseRSSFeed(getMockNewsData());
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
                formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
