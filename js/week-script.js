// Week-specific functions

// Fetch week data from the API for a specific start date
async function fetchWeekData(startDate) {
    try {
        const url = `${WEEK_API_URL}?date=${startDate}`;
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
    
    if (apiData.weather) {
        apiData.weather.forEach(entry => {
            const date = entry.created_at.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = { date };
            }
            dailyData[date].weather = entry;
        });
    }
    
    if (apiData.publibike) {
        const publibikeByDate = {};
        
        apiData.publibike.forEach(entry => {
            const date = entry.created_at.split(' ')[0];
            if (!publibikeByDate[date]) {
                publibikeByDate[date] = [];
            }
            publibikeByDate[date].push(entry);
        });
        
        Object.keys(publibikeByDate).forEach(date => {
            const entries = publibikeByDate[date];
            const averageFreeBikes = entries.reduce((sum, entry) => sum + entry.freebikes, 0) / entries.length;
            
            if (!dailyData[date]) {
                dailyData[date] = { date };
            }
            dailyData[date].publibike = Math.round(averageFreeBikes);
        });
    }
    
    const weekArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    
    weekArray.forEach(day => {
        const date = new Date(day.date);
        day.dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
    });
    
    console.log('Processed week data:', weekArray);
    return weekArray;
}

// Create weather chart with week data
function createWeatherChart(weekData) {
    const canvas = document.getElementById('weatherChart');
    if (!canvas) {
        console.error('Weather chart canvas not found');
        return null;
    }
    
    const labels = weekData.map(day => day.dayName);
    
    const sunshineData = weekData.map(day => 
        day.weather ? (day.weather.sunshine_duration || 0) : 0
    );
    
    const daylightData = weekData.map(day => 
        day.weather ? (day.weather.daylight_duration || 0) : 0
    );
    
    const chart = new Chart(canvas, {
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

// Create publibike chart with week data
function createPublibikeChart(weekData) {
    const canvas = document.getElementById('publibikeChart');
    if (!canvas) {
        console.error('Publibike chart canvas not found');
        return null;
    }
    
    const labels = weekData.map(day => day.dayName);
    const freeBikesData = weekData.map(day => day.publibike || 0);
    
    const chart = new Chart(canvas, {
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

// Update date range display
function updateDateRangeDisplay(startDate, endDate) {
    // Create date range element if it doesn't exist
    let dateRangeElement = document.getElementById('dateRange');
    if (!dateRangeElement) {
        dateRangeElement = document.createElement('div');
        dateRangeElement.id = 'dateRange';
        dateRangeElement.className = 'date-range';
        
        // Insert it after the date picker
        const datePickerContainer = document.getElementById('datePickerContainer');
        if (datePickerContainer) {
            datePickerContainer.insertAdjacentElement('afterend', dateRangeElement);
        }
    }
    
    if (dateRangeElement) {
        const start = new Date(startDate).toLocaleDateString('de-DE');
        const end = new Date(endDate).toLocaleDateString('de-DE');
        dateRangeElement.textContent = `${start} - ${end}`;
    }
}

// Update all charts with week data
async function updateWeekData(startDate) {
    try {
        console.log('Updating week data for start date:', startDate);
        
        const apiData = await fetchWeekData(startDate);
        const weekData = processWeekData(apiData);
        
        if (weekData.length === 0) {
            console.log('No data available for the selected week');
            alert('No data available for the selected week. Please choose a different date.');
            return;
        }
        
        destroyAllCharts();
        
        const weatherChart = createWeatherChart(weekData);
        const publibikeChart = createPublibikeChart(weekData);
        
        if (weatherChart) charts.push(weatherChart);
        if (publibikeChart) charts.push(publibikeChart);
        
        updateDateRangeDisplay(apiData.start_date, apiData.end_date);
        
    } catch (error) {
        console.error('Error updating week data:', error);
        alert('Error loading week data. Please try again.');
    }
}

// Show week view - simplified since we're on a dedicated page
function showWeekView() {
    console.log('Showing week view');
    
    // No need to hide/show elements since this is a dedicated page
    document.body.style.setProperty('background-color', '#f5f5f5', 'important');
    
    const datePicker = document.getElementById('datePicker');
    const startDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
    updateWeekData(startDate);
}

// Initialize week view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Week script loaded');
    // Auto-load week view since this is the week page
    setTimeout(showWeekView, 100); // Small delay to ensure main script is loaded
});