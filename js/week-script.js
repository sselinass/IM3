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
            // Debug: Log the actual weather data structure
            console.log('Found weather data for', selectedDate, ':', weatherEntry);
            console.log('Available properties:', Object.keys(weatherEntry));
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

// Function to get week data starting from selected date
function getWeekData(selectedDate, apiData) {
    const startDate = new Date(selectedDate);
    const weekData = [];
    
    // Debug: Log available dates
    const availableDates = getAvailableDates(apiData);
    console.log('Available dates in data:', availableDates);
    console.log('Trying to get week starting from:', selectedDate);
    
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        console.log('Looking for date:', dateString);
        
        const weatherData = findWeatherDataByDate(dateString, apiData);
        const publibikeData = findPublibikeDataByDate(dateString, apiData);
        
        weekData.push({
            date: dateString,
            dayName: currentDate.toLocaleDateString('de-DE', { weekday: 'short' }),
            weather: weatherData !== 'date not in data' ? weatherData : null,
            publibike: publibikeData
        });
    }
    
    console.log('Week data:', weekData);
    return weekData;
}

// Alternative approach: Show only available dates within a week range
function getAvailableWeekData(selectedDate, apiData) {
    const startDate = new Date(selectedDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 7 days total
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    console.log('Looking for data between:', startDateString, 'and', endDateString);
    
    const availableDates = getAvailableDates(apiData);
    const weekDates = availableDates.filter(date => date >= startDateString && date <= endDateString);
    
    console.log('Available dates in week range:', weekDates);
    
    const weekData = weekDates.map(dateString => {
        const date = new Date(dateString);
        const weatherData = findWeatherDataByDate(dateString, apiData);
        const publibikeData = findPublibikeDataByDate(dateString, apiData);
        
        return {
            date: dateString,
            dayName: date.toLocaleDateString('de-DE', { weekday: 'short' }),
            weather: weatherData !== 'date not in data' ? weatherData : null,
            publibike: publibikeData
        };
    });
    
    return weekData;
}

// Function to create weather chart with week data
function createWeatherChart(weekData) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    
    // Debug: Log the weather data to see what properties are available
    console.log('Weather data for chart:', weekData.map(day => day.weather));
    
    const labels = weekData.map(day => day.dayName);
    
    // Try different possible property names for sunshine and daylight hours
    const sunshineData = weekData.map(day => {
        if (!day.weather) return 0;
        
        // Try different possible property names
        return day.weather.sunshine_hours || 
               day.weather.sunshine_duration || 
               day.weather.sun_hours || 
               day.weather.sunshine || 
               0;
    });
    
    const daylightData = weekData.map(day => {
        if (!day.weather) return 0;
        
        // Try different possible property names
        return day.weather.daylight_hours || 
               day.weather.daylight_duration || 
               day.weather.daylight || 
               day.weather.day_hours ||
               0;
    });
    
    console.log('Sunshine data:', sunshineData);
    console.log('Daylight data:', daylightData);
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sunshine Hours',
                data: sunshineData,
                borderColor: SUNSHINE_YELLOW,
                backgroundColor: LIGHT_YELLOW,
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }, {
                label: 'Daylight Hours',
                data: daylightData,
                borderColor: WARM_YELLOW,
                backgroundColor: WARM_YELLOW + '40',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sunshine & Daylight Hours - Week View'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 24,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Function to create publibike chart with week data
function createPublibikeChart(weekData) {
    const ctx = document.getElementById('publibikeChart').getContext('2d');
    
    const labels = weekData.map(day => day.dayName);
    const freeBikesData = weekData.map(day => 
        day.publibike && day.publibike.length > 0 ? day.publibike[0].freebikes : 0
    );
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Available Bikes',
                data: freeBikesData,
                borderColor: CHART_BLUE,
                backgroundColor: LIGHT_BLUE,
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'PubliBike Data - Week View'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Bikes'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Update charts with selected date data (now shows available data in week range)
function updateChartsWithDate(selectedDate, apiData) {
    console.log('Updating charts for week starting:', selectedDate);
    
    // Get available week data instead of forcing 7 days
    const weekData = getAvailableWeekData(selectedDate, apiData);
    
    if (weekData.length === 0) {
        console.log('No data available for the selected week range');
        return;
    }
    
    // Destroy existing charts
    charts.forEach(chart => chart.destroy());
    charts = [];
    
    // Create weather chart
    const weatherChart = createWeatherChart(weekData);
    charts.push(weatherChart);
    
    // Create publibike chart
    const publibikeChart = createPublibikeChart(weekData);
    charts.push(publibikeChart);
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