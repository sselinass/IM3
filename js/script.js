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
        const averageEmptySlots = filteredData.reduce((sum, entry) => sum + entry.emptyslots, 0) / filteredData.length;
        
        // Return a single entry with average values and the selected date
        return [{
            created_at: selectedDate + ' 12:00:00', // Use noon as representative time
            emptyslots: Math.round(averageEmptySlots) // Round to nearest integer
        }];
    }
    
    // If no data found for this date, return all data
    console.log('No publibike data found for selected date, showing all data');
    return apiData.publibike;
}

// function to update charts when date changes
function updateChartsWithDate(selectedDate, apiData) {
    // Find the weather data for the selected date
    const weatherData = findWeatherDataByDate(selectedDate, apiData);

    // Find the publibike data for the selected date
    const publibikeData = findPublibikeDataByDate(selectedDate, apiData);
    
    // Destroy old charts first
    charts.forEach(chart => chart.destroy());
    charts = [];
    
    // Create new charts with the selected date's data
    const modifiedData = {
        weather: [weatherData], // Put the selected weather data as the first item
        publibike: publibikeData // Don't wrap in array - findPublibikeDataByDate already returns an array
    };
    
    const sunlightChart = createChart('SunlightChart', 'sunlight', modifiedData);
    const sunshineChart = createChart('SunshineChart', 'sunshine', modifiedData);
    const veloChart = createVeloChart('VeloChart', modifiedData);
    
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
    
    // Check if we have averaged data (single entry) or multiple entries
    let labels, bikesInUse;
    
    if (publibikeData.length === 1) {
        // Single averaged entry
        labels = ['Durchschnitt'];
        bikesInUse = [publibikeData[0].emptyslots];
    } else {
        // Multiple entries (all data)
        labels = publibikeData.map(entry => {
            const date = new Date(entry.created_at);
            return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
        });
        bikesInUse = publibikeData.map(entry => entry.emptyslots);
    }

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Velos in Gebrauch',
                data: bikesInUse,
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
                    borderWidth: 2,
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Publibike Zahlen'
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

        // Clear existing charts
        charts.forEach(chart => chart.destroy());
        charts = [];

        // Create charts with first available data
        const sunlightChart = createChart('SunlightChart', 'sunlight', data);
        const sunshineChart = createChart('SunshineChart', 'sunshine', data);
        const veloChart = createVeloChart('VeloChart', data);
        
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