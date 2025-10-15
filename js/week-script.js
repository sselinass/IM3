// Constants for colors and API
const API_URL = 'https://im3.selina-schoepfer.ch/php/unload_week.php';
const WARM_YELLOW = '#f1e19e';
const COOL_BLUE = '#9fd1ff';
const CHART_BLUE = '#76acfdff';
const LIGHT_BLUE = '#c6dde8ff';
const SUNSHINE_YELLOW = '#FFD700';
const LIGHT_YELLOW = '#fdff80ff';

// Global variables
let charts = [];

// Fetch week data from the API for a specific start date
async function fetchWeekData(startDate) {
    try {
        const url = `${API_URL}?date=${startDate}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Week data fetched for start date:', startDate, data);
        return data;
    } catch (error) {
        console.error('Error fetching week data:', error);
        throw error;
    }
}

// Process API data into daily aggregates
function processWeekData(apiData) {
    const dailyData = {};
    
    // Process weather data
    if (apiData.weather) {
        apiData.weather.forEach(entry => {
            const date = entry.created_at.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = { date };
            }
            dailyData[date].weather = entry;
        });
    }
    
    // Process publibike data (calculate daily average)
    if (apiData.publibike) {
        const publibikeByDate = {};
        
        apiData.publibike.forEach(entry => {
            const date = entry.created_at.split(' ')[0];
            if (!publibikeByDate[date]) {
                publibikeByDate[date] = [];
            }
            publibikeByDate[date].push(entry);
        });
        
        // Calculate averages for each date
        Object.keys(publibikeByDate).forEach(date => {
            const entries = publibikeByDate[date];
            const averageFreeBikes = entries.reduce((sum, entry) => sum + entry.freebikes, 0) / entries.length;
            
            if (!dailyData[date]) {
                dailyData[date] = { date };
            }
            dailyData[date].publibike = Math.round(averageFreeBikes);
        });
    }
    
    // Convert to array and sort by date
    const weekArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    
    // Add day names
    weekArray.forEach(day => {
        const date = new Date(day.date);
        day.dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
    });
    
    console.log('Processed week data:', weekArray);
    return weekArray;
}

// Function to create weather chart with week data
function createWeatherChart(weekData) {
    const canvas = document.getElementById('weatherChart');
    if (!canvas) {
        console.error('Weather chart canvas not found');
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    const labels = weekData.map(day => day.dayName);
    
    const sunshineData = weekData.map(day => 
        day.weather ? (day.weather.sunshine_duration || 0) : 0
    );
    
    const daylightData = weekData.map(day => 
        day.weather ? (day.weather.daylight_duration || 0) : 0
    );
    
    console.log('Chart data - Sunshine:', sunshineData, 'Daylight:', daylightData);
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sonnenstunden',
                data: sunshineData,
                borderColor: SUNSHINE_YELLOW,
                backgroundColor: LIGHT_YELLOW,
                borderWidth: 3,
                fill: false,
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Tageslichtzeit',
                data: daylightData,
                borderColor: WARM_YELLOW,
                backgroundColor: WARM_YELLOW + '40',
                borderWidth: 3,
                fill: false,
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sonnenstunden und Tageslichtzeit - Wochenansicht',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 24,
                    title: {
                        display: true,
                        text: 'Stunden'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Function to create publibike chart with week data
function createPublibikeChart(weekData) {
    const canvas = document.getElementById('publibikeChart');
    if (!canvas) {
        console.error('Publibike chart canvas not found');
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    const labels = weekData.map(day => day.dayName);
    const freeBikesData = weekData.map(day => day.publibike || 0);
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Verfügbare PubliBikes',
                data: freeBikesData,
                borderColor: CHART_BLUE,
                backgroundColor: LIGHT_BLUE,
                borderWidth: 3,
                fill: false,
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Verfügbare PubliBikes - Wochenansicht (von 8572 gesamt)',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 8572,
                    title: {
                        display: true,
                        text: 'Anzahl PubliBikes'
                    }
                }
            }
        }
    });
    
    return chart;
}

// Function to update all charts with week data
async function updateWeekData(startDate) {
    try {
        console.log('Updating week data for start date:', startDate);
        
        // Fetch week data from API
        const apiData = await fetchWeekData(startDate);
        
        // Process the data into daily aggregates
        const weekData = processWeekData(apiData);
        
        if (weekData.length === 0) {
            console.log('No data available for the selected week');
            alert('No data available for the selected week. Please choose a different date.');
            return;
        }
        
        // Destroy existing charts
        destroyAllCharts();
        
        // Create new charts
        const weatherChart = createWeatherChart(weekData);
        const publibikeChart = createPublibikeChart(weekData);
        
        if (weatherChart) charts.push(weatherChart);
        if (publibikeChart) charts.push(publibikeChart);
        
        // Update date range display
        updateDateRangeDisplay(apiData.start_date, apiData.end_date);
        
    } catch (error) {
        console.error('Error updating week data:', error);
        alert('Error loading week data. Please try again.');
    }
}

// Helper function to destroy all charts
function destroyAllCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}

// Function to update date range display
function updateDateRangeDisplay(startDate, endDate) {
    const dateRangeElement = document.getElementById('dateRange');
    if (dateRangeElement) {
        const start = new Date(startDate).toLocaleDateString('de-DE');
        const end = new Date(endDate).toLocaleDateString('de-DE');
        dateRangeElement.textContent = `${start} - ${end}`;
    }
}

// Setup date picker functionality
function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    
    if (datePicker) {
        // Set default to today (will fetch week starting from today)
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
        
        // Add event listener for date changes
        datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            console.log('Week start date selected:', selectedDate);
            updateWeekData(selectedDate);
        });
    }
}

// Initialize the application
async function initializeApp() {
    try {
        console.log('Initializing week view application...');
        
        // Setup date picker
        setupDatePicker();
        
        // Load initial week data (starting from today)
        const today = new Date().toISOString().split('T')[0];
        await updateWeekData(today);
        
        console.log('Week view application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize week view app:', error);
        alert('Failed to load the application. Please refresh the page.');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);