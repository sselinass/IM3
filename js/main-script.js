// Constants for colors and APIs
const DAY_API_URL = 'https://im3.selina-schoepfer.ch/php/unload_day.php';
const WEEK_API_URL = 'https://im3.selina-schoepfer.ch/php/unload_week.php';
const WARM_YELLOW = '#f1e19e';
const COOL_BLUE = '#bed5f9ed';
const CHART_BLUE = '#76acfdff';
const LIGHT_BLUE = '#cff0ffff';
const SUNSHINE_YELLOW = '#FFD700';
const LIGHT_YELLOW = '#fafc96ff';

// Global variables
let charts = [];
let currentView = 'day';

// Shared utility functions
function destroyAllCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}

function updateBackgroundColor(sunshineHours) {
    const body = document.body;
    console.log('Updating background color for sunshine hours:', sunshineHours);
    
    const color = sunshineHours >= 7 ? WARM_YELLOW : COOL_BLUE;
    const colorName = sunshineHours >= 7 ? 'warm yellow' : 'light blue';
    
    body.style.setProperty('background-color', color, 'important');
    body.style.transition = 'background-color 0.5s ease';
    console.log(`Set background to ${colorName}`);
}

// View management functions
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

function setView(viewType) {
    currentView = viewType;
    console.log('View changed to:', viewType);
    
    updateViewButtons(viewType);
    
    if (viewType === 'day' && typeof showDayView === 'function') {
        showDayView();
    } else if (viewType === 'week' && typeof showWeekView === 'function') {
        showWeekView();
    }
}

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

// Date picker setup (shared between views)
function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    
    if (datePicker) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
        
        // Set date constraints: from 2025-10-09 to today
        datePicker.min = '2025-10-09';
        datePicker.max = today;
        
        datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            console.log('Date selected:', selectedDate);
            
            // Validate date is within allowed range
            if (selectedDate < '2025-10-08') {
                alert('No data available before October 8, 2025. Please select a valid date.');
                datePicker.value = '2025-10-08';
                return;
            }
            
            if (selectedDate > today) {
                alert('No data available for future dates. Please select a valid date.');
                datePicker.value = today;
                return;
            }
            
            if (currentView === 'day' && typeof updateDataForDate === 'function') {
                updateDataForDate(selectedDate);
            } else if (currentView === 'week' && typeof updateWeekData === 'function') {
                updateWeekData(selectedDate);
            }
        });
    }
}

// Main initialization
function initApp() {
    try {
        console.log('Initializing main app...');
        
        setupDatePicker();
        setupViewButtons();
        setView('day');
        
        console.log('Main app initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize main app:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});