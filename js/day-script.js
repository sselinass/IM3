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

// Add loading states and smooth transitions
function showLoadingState() {
    const bigNumbers = document.querySelectorAll('.number-value');
    bigNumbers.forEach(element => {
        element.style.opacity = '0.5';
        element.textContent = '...';
    });
    
    // Add loading overlay to chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
    });
}

function hideLoadingState() {
    const bigNumbers = document.querySelectorAll('.number-value');
    bigNumbers.forEach(element => {
        element.style.opacity = '1';
    });
    
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
    });
}

// Update the big number displays
function updateBigNumbers(weatherData, publibikeData) {
    // Update sunlight duration with smooth transition
    const sunlightElement = document.getElementById('sunlightNumber');
    if (sunlightElement) {
        const numberValue = sunlightElement.querySelector('.number-value');
        if (numberValue) {
            // Add transition effect
            numberValue.style.transition = 'opacity 0.3s ease';
            numberValue.style.opacity = '0';
            
            setTimeout(() => {
                if (weatherData && weatherData.length > 0) {
                    numberValue.textContent = Math.round(weatherData[0].daylight_duration);
                } else {
                    numberValue.textContent = '—';
                }
                numberValue.style.opacity = '1';
            }, 150);
        }
    }
    
    // Update sunshine duration with smooth transition
    const sunshineElement = document.getElementById('sunshineNumber');
    if (sunshineElement) {
        const numberValue = sunshineElement.querySelector('.number-value');
        if (numberValue) {
            numberValue.style.transition = 'opacity 0.3s ease';
            numberValue.style.opacity = '0';
            
            setTimeout(() => {
                if (weatherData && weatherData.length > 0) {
                    numberValue.textContent = Math.round(weatherData[0].sunshine_duration);
                } else {
                    numberValue.textContent = '—';
                }
                numberValue.style.opacity = '1';
            }, 150);
        }
    }
    
    // Update available bikes with smooth transition
    const veloElement = document.getElementById('veloNumber');
    if (veloElement) {
        const numberValue = veloElement.querySelector('.number-value');
        if (numberValue) {
            numberValue.style.transition = 'opacity 0.3s ease';
            numberValue.style.opacity = '0';
            
            setTimeout(() => {
                if (publibikeData && publibikeData.length > 0) {
                    const averageFreeBikes = publibikeData.reduce((sum, entry) => sum + entry.freebikes, 0) / publibikeData.length;
                    numberValue.textContent = Math.round(averageFreeBikes);
                } else {
                    numberValue.textContent = '—';
                }
                numberValue.style.opacity = '1';
            }, 150);
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
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            },
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
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            },
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
        
        // Show loading state immediately
        showLoadingState();
        
        const data = await fetchDataForDate(selectedDate);
        
        // Small delay to prevent jarring instant updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (data.weather && data.weather.length > 0) {
            updateBackgroundColor(data.weather[0].sunshine_duration);
        } else {
            document.body.style.setProperty('background-color', COOL_BLUE, 'important');
        }
        
        // Update numbers with smooth transitions
        updateBigNumbers(data.weather, data.publibike);
        
        // Destroy existing charts smoothly
        destroyAllCharts();
        
        // Small delay before creating new charts
        await new Promise(resolve => setTimeout(resolve, 200));
        
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
        
        // Hide loading state after charts are created
        hideLoadingState();
        
    } catch (error) {
        console.error('Error updating data for date:', error);
        hideLoadingState();
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