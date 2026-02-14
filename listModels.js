
const https = require('https');
const fs = require('fs');

const apiKey = "AIzaSyCGltnjT5iwxPK0dQB1F9K60UuDj3bHk6M";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            fs.writeFileSync('models.json', JSON.stringify(jsonData, null, 2));
            console.log("Written to models.json");
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw data:", data);
        }
    });

}).on('error', (err) => {
    console.error("Error: " + err.message);
});
