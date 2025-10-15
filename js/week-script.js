// Constants for colors and API
const API_URL = 'https://im3.selina-schoepfer.ch/php/unload.php';
const WARM_YELLOW = '#f1e19e';
const COOL_BLUE = '#9fd1ff';
const CHART_BLUE = '#76acfdff';
const LIGHT_BLUE = '#c6dde8ff';
const SUNSHINE_YELLOW = '#FFD700';
const LIGHT_YELLOW = '#fdff80ff';

// Global variables
let globalApiData = null;
let charts = [];

// Fetch data from the API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Function to find weather data for a specific date
function findWeatherDataByDate(selectedDate, apiData) {
    for (let i = 0; i < apiData.weather.length; i++) {
        const weatherEntry = apiData.weather[i];
        const entryDate = weatherEntry.created_at.split(' ')[0];
        
        if (entryDate === selectedDate) {
            return weatherEntry;
        }
    }
    
    console.log('Date not found in weather data');
    return 'date not in data';
}

// Function to find publibike data for a specific date and calculate average
function findPublibikeDataByDate(selectedDate, apiData) {
    const filteredData = apiData.publibike.filter(entry => {
        const entryDate = entry.created_at.split(' ')[0];
        return entryDate === selectedDate;
    });
    
    if (filteredData.length > 0) {
        const averageFreeBikes = filteredData.reduce((sum, entry) => sum + entry.freebikes, 0) / filteredData.length;
        
        return [{
            created_at: selectedDate + ' 12:00:00',
            freebikes: Math.round(averageFreeBikes)
        }];
    }
    
    console.log('No publibike data found for selected date');
    return null;
}

