// Day-specific functions

// Fetch data from the API for a specific date
async function fetchDataForDate(date) {
    try {
        const url = `${DAY_API_URL}?date=${date}`;
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
    
    // Update available bikes
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

// Create day charts (doughnut charts)
function createDayChart(canvasId, chartType, apiData) {
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

// Create velo chart (horizontal bar chart)
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

// Update all data for a selected date
async function updateDataForDate(selectedDate) {
    try {
        console.log('Updating data for date:', selectedDate);
        
        const data = await fetchDataForDate(selectedDate);
        
        if (data.weather && data.weather.length > 0) {
            updateBackgroundColor(data.weather[0].sunshine_duration);
        } else {
            document.body.style.setProperty('background-color', COOL_BLUE, 'important');
        }
        
        updateBigNumbers(data.weather, data.publibike);
        
        destroyAllCharts();
        
        if (data.weather && data.weather.length > 0) {
            const sunlightChart = createDayChart('SunlightChart', 'sunlight', data);
            const sunshineChart = createDayChart('SunshineChart', 'sunshine', data);
            
            if (sunlightChart) charts.push(sunlightChart);
            if (sunshineChart) charts.push(sunshineChart);
        }
        
        if (data.publibike && data.publibike.length > 0) {
            const veloChart = createVeloChart('VeloChart', data);
            if (veloChart) charts.push(veloChart);
        }
        
    } catch (error) {
        console.error('Error updating data for date:', error);
        alert('Error loading data for selected date. Please try again.');
    }
}

// Show day view
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
    
    if (datePicker && datePicker.value) {
        updateDataForDate(datePicker.value);
    }
}

// Initialize day view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Day script loaded');
});