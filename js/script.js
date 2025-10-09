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



fetch('https://im3.selina-schoepfer.ch/php/unload.php')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        // Chart mit echten Daten erstellen
        createSunshineChart(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

function createSunshineChart(apiData) {
    let SunshineChart = document.getElementById('SunshineChart'); // Ohne #
    
    // Beispiel-Daten aus Ihrer API verwenden
    const chartData = {
        labels: ['Publibike Stationen', 'Wetter Daten', 'Sonnenschein', 'Tageslicht', 'Andere'],
        datasets: [
            {
                label: 'Daten Übersicht',
                data: [25, 30, 20, 15, 10], // Ersetzen Sie durch echte Werte
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB', 
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ],
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
                    text: 'Sunshine Duration Chart'
                }
            }
        },
    };

    const chart = new Chart(SunshineChart, config);
}