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
            if (weatherData && weatherData !== 'date not in data') {
                numberValue.textContent = Math.round(weatherData.daylight_duration);
                console.log('Updated sunlight to:', Math.round(weatherData.daylight_duration));
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
            if (weatherData && weatherData !== 'date not in data') {
                numberValue.textContent = Math.round(weatherData.sunshine_duration);
                console.log('Updated sunshine to:', Math.round(weatherData.sunshine_duration));
            } else {
                numberValue.textContent = '—';
                console.log('No sunshine data, showing dash');
            }
        }
    }
    
    // Update available bikes
    const veloElement = document.getElementById('veloNumber');
    if (veloElement) {
        const numberValue = veloElement.querySelector('.number-value');
        if (publibikeData && publibikeData.length > 0) {
            numberValue.textContent = publibikeData[0].freebikes;
            console.log('Updated velo to:', publibikeData[0].freebikes);
        } else {
            numberValue.textContent = '—';
            console.log('No velo data, showing dash');
        }
    }
}

// Function to update charts when date changes
function updateChartsWithDate(selectedDate, apiData) {
    const weatherData = findWeatherDataByDate(selectedDate, apiData);
    const publibikeData = findPublibikeDataByDate(selectedDate, apiData);
    
    // Update background color based on sunshine hours
    if (weatherData && weatherData !== 'date not in data') {
        updateBackgroundColor(weatherData.sunshine_duration);
    }
    
    // Update big numbers
    updateBigNumbers(weatherData, publibikeData);
    
    // Destroy old charts first
    destroyAllCharts();
    
    // Create new charts with the selected date's data
    const modifiedData = {
        weather: [weatherData],
        publibike: publibikeData
    };
    
    createAndStoreCharts(modifiedData);
}

// Helper function to destroy all charts
function destroyAllCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}

// Helper function to create and store all charts
function createAndStoreCharts(data) {
    const sunlightChart = createChart('SunlightChart', 'sunlight', data);
    const sunshineChart = createChart('SunshineChart', 'sunshine', data);
    
    if (sunlightChart) charts.push(sunlightChart);
    if (sunshineChart) charts.push(sunshineChart);
    
    // Only create velo chart if publibike data exists
    if (data.publibike) {
        const veloChart = createVeloChart('VeloChart', data);
        if (veloChart) charts.push(veloChart);
    } else {
        // Clear the canvas if no data
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

// Charts (Sunshine and Sunlight charts combined, structure from Chart.js)
function createChart(canvasId, chartType, apiData) {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`Canvas element with id "${canvasId}" not found`);
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
    
    const data = {
        labels: [''],
        datasets: [{
            data: [publibikeData[0].freebikes],
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

// Helper function to calculate average publibike data
function calculateAveragePublibikeData(publibikeData) {
    const averageFreeBikes = publibikeData.reduce((sum, entry) => sum + entry.freebikes, 0) / publibikeData.length;
    
    return [{
        created_at: 'average',
        freebikes: Math.round(averageFreeBikes)
    }];
}

// Initialize the application
async function initApp() {
    try {
        const data = await fetchData();
        
        // Store data globally so we can use it when date changes
        globalApiData = data;
        
        // Validate data structure
        if (!data.weather || !Array.isArray(data.weather) || data.weather.length === 0) {
            throw new Error('Invalid weather data structure');
        }
        
        if (!data.publibike || !Array.isArray(data.publibike) || data.publibike.length === 0) {
            throw new Error('Invalid publibike data structure');
        }

        // Set initial background color based on first weather entry
        updateBackgroundColor(data.weather[0].sunshine_duration);

        // Clear existing charts
        destroyAllCharts();

        // For initial load, always show average of all publibike data
        const averagedData = {
            weather: data.weather,
            publibike: calculateAveragePublibikeData(data.publibike)
        };
        
        // Update big numbers with initial data
        updateBigNumbers(data.weather[0], averagedData.publibike);
        
        // Create charts with initial data
        createAndStoreCharts({
            weather: data.weather,
            publibike: averagedData.publibike
        });
        
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Date picker event listener
function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    
    if (datePicker) {
        datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            console.log('Date selected:', selectedDate);
            
            if (globalApiData) {
                updateChartsWithDate(selectedDate, globalApiData);
            }
        });
    }
}

// Call the init function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupDatePicker();
    initApp();
});