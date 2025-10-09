// test js file
// console.log("blub");

fetch('https://im3.selina-schoepfer.ch/php/unload.php')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
