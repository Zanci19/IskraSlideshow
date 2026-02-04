// Slideshow configuration
const SLIDE_DURATION = 20000; // 20 seconds
const NEWS_ROTATION_DURATION = 20000; // 20 seconds per news item
const MAX_NEWS_TO_SHOW = 3; // Show only 3 news items before returning to first slide
let currentSlide = 0;
let currentNewsIndex = 0;
let newsShownCount = 0; // Track how many news items have been shown
let newsItems = [];
let newsRotationInterval = null;
let slideInterval = null; // Store the slide interval so we can reset it
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
    startSlideInterval();
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            resetSlideTimer(); // Reset the timer when manually navigating
        });
    });
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
        newsShownCount = 1; // First news item counts as shown
        currentNewsIndex = 0; // Start from first news
        displayCurrentNews();
        startNewsRotation();
    } else {
        stopNewsRotation();
    }
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
            pubDate: new Date().toISOString(),
            image: 'https://picsum.photos/800/400?random=1'
        },
        {
            title: 'Dnevi odprtih vrat - povabilo',
            link: 'https://sckr.si',
            description: 'Vabimo vas na dneve odprtih vrat našega šolskega centra. Predstavili bomo vse programe in dejavnosti.',
            pubDate: new Date(Date.now() - 86400000).toISOString(),
            image: 'https://picsum.photos/800/400?random=2'
        },
        {
            title: 'Rezultati športnih tekmovanj',
            link: 'https://sckr.si',
            description: 'Naši dijaki so dosegli odlične rezultate na regijskem tekmovanju v atletiki. Čestitamo vsem udeležencem!',
            pubDate: new Date(Date.now() - 172800000).toISOString(),
            image: 'https://picsum.photos/800/400?random=3'
        },
        {
            title: 'Nova računalniška oprema',
            link: 'https://sckr.si',
            description: 'Šolski center je pridobil novo računalniško opremo za IT učilnice. Dijaki bodo imeli dostop do najnovejše tehnologije.',
            pubDate: new Date(Date.now() - 259200000).toISOString(),
            image: 'https://picsum.photos/800/400?random=4'
        },
        {
            title: 'Ekskurzija v Ljubljano',
            link: 'https://sckr.si',
            description: 'Dijaki so se udeležili ekskurzije v našo prestolnico, kjer so si ogledali parlament in različne kulturne ustanove.',
            pubDate: new Date(Date.now() - 345600000).toISOString(),
            image: 'https://picsum.photos/800/400?random=5'
        },
        {
            title: 'Predavanje o zdravi prehrani',
            link: 'https://sckr.si',
            description: 'Nutricionistka je predstavila pomembnost zdrave in uravnotežene prehrane za mladostnike.',
            pubDate: new Date(Date.now() - 432000000).toISOString(),
            image: 'https://picsum.photos/800/400?random=6'
        }
    ];
    
    // Create mock RSS XML with images - properly escape special characters
    let xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel>';
    mockNews.forEach(news => {
        // Escape XML special characters in URLs
        const escapedImageUrl = news.image ? news.image.replace(/&/g, '&amp;') : '';
        xml += `<item>
            <title><![CDATA[${news.title}]]></title>
            <link>${news.link}</link>
            <description><![CDATA[${news.description}]]></description>
            <pubDate>${new Date(news.pubDate).toUTCString()}</pubDate>
            ${escapedImageUrl ? `<enclosure url="${escapedImageUrl}" type="image/jpeg" />` : ''}
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
    
    // Display first news item
    currentNewsIndex = 0;
    displayCurrentNews();
    
    // Start rotation if on news slide
    if (currentSlide === 2) {
        startNewsRotation();
    }
}

// Display current news item
function displayCurrentNews() {
    if (newsItems.length === 0) return;
    
    const newsContainer = document.getElementById('news-container');
    const news = newsItems[currentNewsIndex];
    const hasImage = Boolean(news.image);
    
    newsContainer.innerHTML = `
        <div class="news-item${hasImage ? '' : ' no-image'}">
            <div class="news-text">
                <div class="news-title">${news.title}</div>
                ${news.date ? `<div class="news-date">📅 ${news.date}</div>` : ''}
                ${news.description ? `<div class="news-description">${news.description}</div>` : ''}
                <a href="${news.link}" class="news-link" target="_blank">Preberi več →</a>
            </div>
            ${hasImage ? `<img src="${news.image}" alt="${news.title}" class="news-image" onerror="this.closest('.news-item').classList.add('no-image'); this.remove();">` : ''}
        </div>
    `;
}

// Start news rotation
function startNewsRotation() {
    stopNewsRotation(); // Clear any existing interval
    
    if (newsItems.length <= 1) return; // No need to rotate if only one item
    
    newsRotationInterval = setInterval(() => {
        // Check if we've shown enough news items before rotating
        if (newsShownCount >= MAX_NEWS_TO_SHOW) {
            stopNewsRotation();
            currentSlide = 0; // Go back to first slide
            showSlide(currentSlide);
            resetSlideTimer(); // Reset the main slide timer
            return;
        }
        
        // Otherwise, show next news item and increment counter
        currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
        newsShownCount++;
        displayCurrentNews();
    }, NEWS_ROTATION_DURATION);
}

// Stop news rotation
function stopNewsRotation() {
    if (newsRotationInterval) {
        clearInterval(newsRotationInterval);
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
