// Constants for colors and API
const API_URL = 'https://im3.selina-schoepfer.ch/php/unload_day.php';
const WARM_YELLOW = '#f1e19e';
const COOL_BLUE = '#9fd1ff';
const CHART_BLUE = '#76acfdff';
const LIGHT_BLUE = '#c6dde8ff';
const SUNSHINE_YELLOW = '#FFD700';
const LIGHT_YELLOW = '#fdff80ff';

// Global variables
let charts = [];
let currentView = 'day';

// Fetch data from the API for a specific date
async function fetchDataForDate(date) {
    try {
        const url = `${API_URL}?date=${date}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data fetched for date:', date, data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Update background color based on sunshine hours
function updateBackgroundColor(sunshineHours) {
    const body = document.body;
    console.log('Updating background color for sunshine hours:', sunshineHours);
    
    const color = sunshineHours >= 7 ? WARM_YELLOW : COOL_BLUE;
    const colorName = sunshineHours >= 7 ? 'warm yellow' : 'light blue';
    
    body.style.setProperty('background-color', color, 'important');
    body.style.transition = 'background-color 0.5s ease';
    console.log(`Set background to ${colorName}`);
}

// Update the big number displays
function updateBigNumbers(weatherData, publibikeData) {
    // Update sunlight duration
    const sunlightElement = document.getElementById('sunlightNumber');
    if (sunlightElement) {
        const numberValue = sunlightElement.querySelector('.number-value');
        if (numberValue) {
            if (weatherData && weatherData.length > 0) {
                numberValue.textContent = Math.round(weatherData[0].daylight_duration);
                console.log('Updated sunlight to:', Math.round(weatherData[0].daylight_duration));
            } else {
                numberValue.textContent = '—';
                console.log('No sunlight data, showing dash');
            }
        }
    }
    
    // Update sunshine duration
    const sunshineElement = document.getElementById('sunshineNumber');
    if (sunshineElement) {
        const numberValue = sunshineElement.querySelector('.number-value');
        if (numberValue) {
            if (weatherData && weatherData.length > 0) {
                numberValue.textContent = Math.round(weatherData[0].sunshine_duration);
                console.log('Updated sunshine to:', Math.round(weatherData[0].sunshine_duration));
            } else {
                numberValue.textContent = '—';
                console.log('No sunshine data, showing dash');
            }
        }
    }
    
    // Update available bikes (calculate average if multiple entries)
    const veloElement = document.getElementById('veloNumber');
    if (veloElement) {
        const numberValue = veloElement.querySelector('.number-value');
        if (publibikeData && publibikeData.length > 0) {
            const averageFreeBikes = publibikeData.reduce((sum, entry) => sum + entry.freebikes, 0) / publibikeData.length;
            numberValue.textContent = Math.round(averageFreeBikes);
            console.log('Updated velo to:', Math.round(averageFreeBikes));
        } else {
            numberValue.textContent = '—';
            console.log('No velo data, showing dash');
        }
    }
}

// Function to update all data for a selected date
async function updateDataForDate(selectedDate) {
    try {
        console.log('Updating data for date:', selectedDate);
        
        // Fetch new data from API
        const data = await fetchDataForDate(selectedDate);
        
        // Update background color based on sunshine hours
        if (data.weather && data.weather.length > 0) {
            updateBackgroundColor(data.weather[0].sunshine_duration);
        } else {
            // Default to cool blue if no weather data
            document.body.style.setProperty('background-color', COOL_BLUE, 'important');
        }
        
        // Update big numbers
        updateBigNumbers(data.weather, data.publibike);
        
        // Destroy old charts and create new ones
        destroyAllCharts();
        createAndStoreCharts(data);
        
    } catch (error) {
        console.error('Error updating data for date:', error);
        // Show user-friendly error
        alert('Error loading data for selected date. Please try again.');
    }
}

// Helper function to destroy all charts
function destroyAllCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}

// Helper function to create and store all charts
function createAndStoreCharts(data) {
    if (data.weather && data.weather.length > 0) {
        const sunlightChart = createChart('SunlightChart', 'sunlight', data);
        const sunshineChart = createChart('SunshineChart', 'sunshine', data);
        
        if (sunlightChart) charts.push(sunlightChart);
        if (sunshineChart) charts.push(sunshineChart);
    }
    
    // Create velo chart if publibike data exists
    if (data.publibike && data.publibike.length > 0) {
        const veloChart = createVeloChart('VeloChart', data);
        if (veloChart) charts.push(veloChart);
    } else {
        clearVeloCanvas();
    }
}

// Helper function to clear velo canvas
function clearVeloCanvas() {
    const canvas = document.getElementById('VeloChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Charts creation function
function createChart(canvasId, chartType, apiData) {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`Canvas element with id "${canvasId}" not found`);
        return null;
    }

    if (!apiData.weather || apiData.weather.length === 0) {
        console.error('No weather data available for chart');
        return null;
    }

    const weatherData = apiData.weather[0];
    const daylightHours = weatherData.daylight_duration;
    const sunshineHours = weatherData.sunshine_duration;
    const nightHours = 24 - daylightHours;
    const nonSunshineHours = daylightHours - sunshineHours;

    let chartData;
    
    if (chartType === 'sunlight') {
        chartData = {
            datasets: [{
                data: [daylightHours, nightHours],
                backgroundColor: [CHART_BLUE, LIGHT_BLUE],
                hoverOffset: 4,
                borderWidth: 0,
            }]
        };
    } else if (chartType === 'sunshine') {
        chartData = {
            datasets: [{
                data: [sunshineHours, nonSunshineHours, nightHours],
                backgroundColor: [SUNSHINE_YELLOW, LIGHT_YELLOW, 'transparent'],
                hoverOffset: 4,
                borderWidth: 0,
            }]
        };
    }

    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        },
    };

    return new Chart(canvas, config);
}

// Velo Chart (horizontal bar chart)
function createVeloChart(canvasId, apiData) {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`Canvas element with id "${canvasId}" not found`);
        return null;
    }

    const publibikeData = apiData.publibike;
    
    if (!publibikeData || publibikeData.length === 0) {
        return null;
    }
    
    // Calculate average if multiple entries
    const averageFreeBikes = publibikeData.reduce((sum, entry) => sum + entry.freebikes, 0) / publibikeData.length;
    
    const data = {
        labels: [''],
        datasets: [{
            data: [Math.round(averageFreeBikes)],
            borderColor: CHART_BLUE,
            backgroundColor: CHART_BLUE,
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            elements: {
                bar: {
                    borderWidth: 0,
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 8572
                }
            }
        },
    };

    return new Chart(canvas, config);
}

// Setup date picker
function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    
    if (datePicker) {
        // Set default to today
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
        
        // Add event listener for date changes
        datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            console.log('Date selected:', selectedDate);
            updateDataForDate(selectedDate);
        });
    }
}

// Function to toggle between day and week view
function setView(viewType) {
    currentView = viewType;
    console.log('View changed to:', viewType);
    
    updateViewButtons(viewType);
    
    if (viewType === 'day') {
        showDayView();
    } else if (viewType === 'week') {
        showWeekView();
    }
}

// Function to update button appearance
function updateViewButtons(activeView) {
    const dayButton = document.getElementById('dayViewBtn');
    const weekButton = document.getElementById('weekViewBtn');
    
    if (dayButton && weekButton) {
        dayButton.classList.remove('active');
        weekButton.classList.remove('active');
        
        if (activeView === 'day') {
            dayButton.classList.add('active');
        } else {
            weekButton.classList.add('active');
        }
    }
}

// Function to show day view
function showDayView() {
    console.log('Showing day view');
    
    const datePicker = document.getElementById('datePicker');
    const chartsContainer = document.querySelector('.charts-container');
    const bigNumbers = document.querySelector('.big-numbers');
    
    if (datePicker) datePicker.style.display = 'block';
    if (chartsContainer) chartsContainer.style.display = 'block';
    if (bigNumbers) bigNumbers.style.display = 'block';
    
    const weekContainer = document.getElementById('weekContainer');
    if (weekContainer) weekContainer.style.display = 'none';
    
    // Load data for current selected date
    if (datePicker && datePicker.value) {
        updateDataForDate(datePicker.value);
    }
}

// Function to show week view
function showWeekView() {
    console.log('Showing week view');
    
    const datePicker = document.getElementById('datePicker');
    const chartsContainer = document.querySelector('.charts-container');
    const bigNumbers = document.querySelector('.big-numbers');
    
    if (datePicker) datePicker.style.display = 'none';
    if (chartsContainer) chartsContainer.style.display = 'none';
    if (bigNumbers) bigNumbers.style.display = 'none';
    
    let weekContainer = document.getElementById('weekContainer');
    if (!weekContainer) {
        weekContainer = createWeekContainer();
    }
    weekContainer.style.display = 'block';
    
    destroyAllCharts();
    document.body.style.setProperty('background-color', '#f5f5f5', 'important');
}

// Function to create week view container
function createWeekContainer() {
    const weekContainer = document.createElement('div');
    weekContainer.id = 'weekContainer';
    weekContainer.className = 'week-container';
    weekContainer.innerHTML = `
        <div class="week-content">
            <h2>Week View</h2>
            <p>Week view coming soon...</p>
            <p>This will show combined data for the selected week.</p>
        </div>
    `;
    
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(weekContainer);
    
    return weekContainer;
}

// Function to setup view buttons
function setupViewButtons() {
    const dayButton = document.getElementById('dayViewBtn');
    const weekButton = document.getElementById('weekViewBtn');
    
    if (dayButton) {
        dayButton.addEventListener('click', () => setView('day'));
    }
    
    if (weekButton) {
        weekButton.addEventListener('click', () => setView('week'));
    }
    
    updateViewButtons('day');
}

// Initialize the application
async function initApp() {
    try {
        console.log('Initializing app...');
        
        // Setup date picker and view buttons
        setupDatePicker();
        setupViewButtons();
        
        // Start in day view with today's data
        setView('day');
        
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});