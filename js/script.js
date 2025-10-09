// test js file
// console.log("blub");

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

// Charts (Sunshine and Sunlight charts combined, structure from Chart.js)
function createChart(canvasId, chartType, apiData) {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`Canvas element with id "${canvasId}" not found`);
        return null;
    }

    const weatherData = apiData.weather[0]; // hier noch ersetzen mit dem ausgewählten Datum
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
    const labels = publibikeData.map(entry => {
        const date = new Date(entry.created_at);
        return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    });
    
    const bikesInUse = publibikeData.map(entry => entry.emptyslots);

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

        // Create charts
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