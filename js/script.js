// Fetch data from the API
function fetchData() {
    return fetch('https://im3.selina-schoepfer.ch/php/unload.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            throw error;
        });
}

// Global variable to store API data
let globalApiData = null;

// date picker event listener
const datePicker = document.getElementById('datePicker');
datePicker.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    console.log('Date selected:', selectedDate);
    
    if (globalApiData) {
        updateChartsWithDate(selectedDate, globalApiData);
    }
});

// function to find weather data for a specific date
function findWeatherDataByDate(selectedDate, apiData) {
    // Look through all the weather data to find the right day
    for (let i = 0; i < apiData.weather.length; i++) {
        const weatherEntry = apiData.weather[i];
        const entryDate = weatherEntry.created_at.split(' ')[0]; // Get just the date part (YYYY-MM-DD)
        
        if (entryDate === selectedDate) {
            return weatherEntry; // Found it! Return this weather data
        }
    }
    
    // If we didn't find the exact date, return the first one
    console.log('date not found in data');
    return 'date not in data';
}

// function to find publibike data for a specific date and calculate average
function findPublibikeDataByDate(selectedDate, apiData) {
    // Filter all publibike entries that match the selected date
    const filteredData = apiData.publibike.filter(entry => {
        const entryDate = entry.created_at.split(' ')[0]; // Get just the date part (YYYY-MM-DD)
        return entryDate === selectedDate;
    });
    
    // If we found data for this date, calculate average
    if (filteredData.length > 0) {
        const averageFreeBikes = filteredData.reduce((sum, entry) => sum + entry.freebikes, 0) / filteredData.length;
        
        // Return a single entry with average values and the selected date
        return [{
            created_at: selectedDate + ' 12:00:00', // Use noon as representative time
            freebikes: Math.round(averageFreeBikes) // Round to nearest integer
        }];
    }
    
    // If no data found for this date, return null instead of all data
    console.log('No publibike data found for selected date');
    return null;
}

// Add this new function after the existing functions
function updateBackgroundColor(sunshineHours) {
    const body = document.body;
    console.log('Updating background color for sunshine hours:', sunshineHours);
    
    if (sunshineHours >= 8) {
        body.style.setProperty('background-color', '#f1e19e', 'important');
        body.style.transition = 'background-color 0.5s ease';
        console.log('Set background to warm yellow');
    } else {
        body.style.setProperty('background-color', '#9fd1ff', 'important');
        body.style.transition = 'background-color 0.5s ease';
        console.log('Set background to light blue');
    }
}

// Add this new function after your existing functions
function updateBigNumbers(weatherData, publibikeData) {
    // Update sunlight duration
    const sunlightElement = document.getElementById('sunlightNumber');
    console.log('Sunlight element found:', sunlightElement);
    
    if (sunlightElement && weatherData && weatherData !== 'date not in data') {
        const numberValue = sunlightElement.querySelector('.number-value');
        console.log('Number value element found:', numberValue);
        console.log('Weather daylight duration:', weatherData.daylight_duration);
        
        if (numberValue) {
            numberValue.textContent = Math.round(weatherData.daylight_duration);
            console.log('Updated sunlight to:', Math.round(weatherData.daylight_duration));
        }
    }
    
    // Update sunshine duration
    const sunshineElement = document.getElementById('sunshineNumber');
    console.log('Sunshine element found:', sunshineElement);
    
    if (sunshineElement && weatherData && weatherData !== 'date not in data') {
        const numberValue = sunshineElement.querySelector('.number-value');
        console.log('Sunshine number value element found:', numberValue);
        
        if (numberValue) {
            numberValue.textContent = Math.round(weatherData.sunshine_duration);
            console.log('Updated sunshine to:', Math.round(weatherData.sunshine_duration));
        }
    }
    
    // Update available bikes
    const veloElement = document.getElementById('veloNumber');
    console.log('Velo element found:', veloElement);
    
    if (veloElement) {
        const numberValue = veloElement.querySelector('.number-value');
        console.log('Velo number value element found:', numberValue);
        
        if (publibikeData && publibikeData.length > 0) {
            numberValue.textContent = publibikeData[0].freebikes;
            console.log('Updated velo to:', publibikeData[0].freebikes);
        } else {
            numberValue.textContent = '—'; // Show dash when no data
            console.log('No velo data, showing dash');
        }
    }
}

// function to update charts when date changes
function updateChartsWithDate(selectedDate, apiData) {
    // Find the weather data for the selected date
    const weatherData = findWeatherDataByDate(selectedDate, apiData);

    // Find the publibike data for the selected date
    const publibikeData = findPublibikeDataByDate(selectedDate, apiData);
    
    // Update background color based on sunshine hours
    if (weatherData && weatherData !== 'date not in data') {
        updateBackgroundColor(weatherData.sunshine_duration);
    }
    
    // Update big numbers
    updateBigNumbers(weatherData, publibikeData);
    
    // Destroy old charts first
    charts.forEach(chart => chart.destroy());
    charts = [];
    
    // Create new charts with the selected date's data
    const modifiedData = {
        weather: [weatherData], // Put the selected weather data as the first item
        publibike: publibikeData // This can now be null if no data exists
    };
    
    
    const sunlightChart = createChart('SunlightChart', 'sunlight', modifiedData);
    const sunshineChart = createChart('SunshineChart', 'sunshine', modifiedData);
    
    // Only create velo chart if publibike data exists
    let veloChart = null;
    if (publibikeData) {
        veloChart = createVeloChart('VeloChart', modifiedData);
    } else {
        // Hide or clear the canvas if no data
        const canvas = document.getElementById('VeloChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Store the new charts
    if (sunlightChart) charts.push(sunlightChart);
    if (sunshineChart) charts.push(sunshineChart);
    if (veloChart) charts.push(veloChart);
}



// Charts (Sunshine and Sunlight charts combined, structure from Chart.js)
function createChart(canvasId, chartType, apiData) {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`Canvas element with id "${canvasId}" not found`);
        return null;
    }

    let weatherData = apiData.weather[0];
    const daylightHours = weatherData.daylight_duration;
    const sunshineHours = weatherData.sunshine_duration;
    const nightHours = 24 - daylightHours;
    const nonSunshineHours = daylightHours - sunshineHours;

    let chartData;
    
    if (chartType === 'sunlight') {
        chartData = {
            // labels: ['Tageslicht', 'Dunkel'],
            datasets: [{
                // label: 'Stunden',
                data: [daylightHours, nightHours],
                backgroundColor: ['#76acfdff', '#c6dde8ff'],
                hoverOffset: 4,
                borderWidth: 0,
            }]
        };
    } else if (chartType === 'sunshine') {
        chartData = {
            // labels: ['Sonnenschein', 'Tageslicht ohne Sonne', 'Kein Tageslicht'],
            datasets: [{
                // label: 'Stunden',
                data: [sunshineHours, nonSunshineHours, nightHours],
                backgroundColor: ['#FFD700', '#fdff80ff', 'transparent'],
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
                },
                // title: {
                //     display: true,
                // text: chartType === 'sunlight' ? 'Tageslichtdauer' : 'Sonnenscheindauer'
                // }
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
    
    // Check if publibikeData exists
    if (!publibikeData || publibikeData.length === 0) {
        return null;
    }
    
    // Always show average data (single entry)
    const labels = [''];
    const availableBikes = [publibikeData[0].freebikes];

    const data = {
        labels: labels,
        datasets: [
            {
                data: availableBikes,
                borderColor: '#76acfdff',
                backgroundColor: '#76acfdff',
            },
        ]
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
                    display: false // Hide legend
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        },
    };

    return new Chart(canvas, config);
}

// Store chart instances for potential cleanup
let charts = [];

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
        if (data.weather && data.weather.length > 0) {
            updateBackgroundColor(data.weather[0].sunshine_duration);
        }

        // Clear existing charts
        charts.forEach(chart => chart.destroy());
        charts = [];

        // For initial load, always show average of all publibike data
        const allPublibikeData = data.publibike;
        const averageFreeBikes = allPublibikeData.reduce((sum, entry) => sum + entry.freebikes, 0) / allPublibikeData.length;
        const averagedData = {
            weather: data.weather,
            publibike: [{
                created_at: 'average',
                freebikes: Math.round(averageFreeBikes)
            }]
        };
        
        // Update big numbers with initial data
        updateBigNumbers(data.weather[0], averagedData.publibike);
        
        // Create charts with first available data (REMOVE DUPLICATE)
        const sunlightChart = createChart('SunlightChart', 'sunlight', data);
        const sunshineChart = createChart('SunshineChart', 'sunshine', data);
        const veloChart = createVeloChart('VeloChart', averagedData);
        
        // Store chart instances
        if (sunlightChart) charts.push(sunlightChart);
        if (sunshineChart) charts.push(sunshineChart);
        if (veloChart) charts.push(veloChart);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Call the init function when the page loads
document.addEventListener('DOMContentLoaded', initApp);