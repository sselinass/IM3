console.log("blub");

// api url https://im3.selina-schoepfer.ch/php/unload.php 

fetch('https://im3.selina-schoepfer.ch/php/unload.php')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });