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

// Get available dates from API data
function getAvailableDates(apiData) {
    const dates = new Set();
    
    // Get dates from weather data
    apiData.weather.forEach(entry => {
        const date = entry.created_at.split(' ')[0];
        dates.add(date);
    });
    
    // Get dates from publibike data
    apiData.publibike.forEach(entry => {
        const date = entry.created_at.split(' ')[0];
        dates.add(date);
    });
    
    return Array.from(dates).sort();
}

// Update charts with selected date data
function updateChartsWithDate(selectedDate, apiData) {
    console.log('Updating charts for date:', selectedDate);
    
    // Find data for the selected date
    const weatherData = findWeatherDataByDate(selectedDate, apiData);
    const publibikeData = findPublibikeDataByDate(selectedDate, apiData);
    
    // Destroy existing charts
    charts.forEach(chart => chart.destroy());
    charts = [];
    
    // Create/update your charts here based on the selected date
    if (weatherData && weatherData !== 'date not in data') {
        console.log('Weather data for selected date:', weatherData);
        // Add your weather chart creation logic here
    }
    
    if (publibikeData) {
        console.log('Publibike data for selected date:', publibikeData);
        // Add your publibike chart creation logic here
    }
}

// Setup date picker functionality
function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    
    if (datePicker && globalApiData) {
        const availableDates = getAvailableDates(globalApiData);
        
        if (availableDates.length > 0) {
            // Set min and max dates
            datePicker.min = availableDates[0];
            datePicker.max = availableDates[availableDates.length - 1];
            
            // Set default to first available date
            datePicker.value = availableDates[0];
        }
        
        datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            console.log('Date selected:', selectedDate);
            
            // Check if selected date has data
            const availableDates = getAvailableDates(globalApiData);
            if (availableDates.includes(selectedDate)) {
                updateChartsWithDate(selectedDate, globalApiData);
            } else {
                alert('No data available for this date. Please select another date.');
                // Reset to first available date
                datePicker.value = availableDates[0];
            }
        });
    }
}

// Main initialization function
async function initializeApp() {
    try {
        console.log('Initializing application...');
        
        // Fetch data first
        globalApiData = await fetchData();
        
        if (!globalApiData) {
            throw new Error('No data received from API');
        }
        
        // Setup date picker after data is loaded
        setupDatePicker();
        
        // Initialize charts with first available date
        const availableDates = getAvailableDates(globalApiData);
        if (availableDates.length > 0) {
            updateChartsWithDate(availableDates[0], globalApiData);
        }
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);