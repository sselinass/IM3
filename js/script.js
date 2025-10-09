// test js file
// console.log("blub");

// fetch('https://im3.selina-schoepfer.ch/php/unload.php')
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error('Error fetching data:', error);
//     });

function fetchData() {
    return fetch('https://im3.selina-schoepfer.ch/php/unload.php')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            return data; // Return the data for chaining
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            throw error; // Re-throw to handle in initApp
        });
}

// Sunlight Chart
function createSunlightChart(apiData) {
    let SunlightChart = document.getElementById('SunlightChart');

    // Check if canvas element exists
    if (!SunlightChart) {
        console.error('Canvas element with id "SunlightChart" not found');
        return;
    }
    
    // Extract weather data from API response
    const weatherData = apiData.weather[0]; // Get first weather entry
    const daylightHours = weatherData.daylight_duration;
    const nightHours = 24 - daylightHours;

    const chartData = {
        labels: ['Tageslicht', 'dunkel'],
        datasets: [
            {
                label: 'Stunden',
                data: [daylightHours, nightHours],
                backgroundColor: [
                    '#a3aed1ff',
                    '#303436ff',
                ],
                hoverOffset: 4,
                borderWidth: 0,
            }
        ]
    };

    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tägliche Sonnenscheindauer'
                }
            }
        },
    };

    const chart = new Chart(SunlightChart, config);
}

// Sunshine Chart
function createSunshineChart(apiData) {
    let SunshineChart = document.getElementById('SunshineChart');
    
    // Check if canvas element exists
    if (!SunshineChart) {
        console.error('Canvas element with id "SunshineChart" not found');
        return;
    }
    
    // Extract weather data from API response
    const weatherData = apiData.weather[0]; // Get first weather entry
    const sunshineHours = weatherData.sunshine_duration;
    const daylightHours = weatherData.daylight_duration;
    const nightHours = 24 - daylightHours;
    const nonSunshineHours = daylightHours - sunshineHours;

    const chartData = {
        labels: ['Sonnenschein', 'Tageslicht ohne Sonne'],
        datasets: [
            {
                label: 'Stunden',
                data: [sunshineHours, nonSunshineHours],
                backgroundColor: [
                    '#FFD700',
                    '#87CEEB',
                ],
                hoverOffset: 4,
                borderWidth: 0,
            }
        ]
    };

    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tägliche Sonnenscheindauer'
                }
            }
        },
    };

    const chart = new Chart(SunshineChart, config);
}

// Initialize the application
function initApp() {
    fetchData()
        .then(data => {
            createSunlightChart(data);
            createSunshineChart(data);
        })
        .catch(error => {
            console.error('Failed to initialize app:', error);
        });
}

// Call the init function when the page loads
document.addEventListener('DOMContentLoaded', initApp);