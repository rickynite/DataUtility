document.addEventListener('DOMContentLoaded', () => {
    // Plot sample data when the page loads
    plotSampleData();

    // Event listener for file input to handle user file uploads
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
});

function showInstallPromotion() {
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        // Hide the app provided install promotion
        installButton.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        processFile(contents, file.type);
    };
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        alert('There was an error reading the file. Please try again.');
    };
    reader.readAsText(file);
}

function processFile(contents, type) {
    if (type === 'text/csv') {
        Papa.parse(contents, {
            complete: function(results) {
                plotData(results.data);
            },
            error: function(err) {
                console.error('CSV Parse Error:', err);
                alert('There was an error parsing the CSV file. Please check the file format.');
            }
        });
    } else if (type === 'application/json') {
        try {
            const data = JSON.parse(contents);
            if (data.data && Array.isArray(data.data)) {
                plotData(data.data);
            } else {
                throw new Error('Invalid JSON structure');
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            alert('There was an error parsing the JSON file. Please check the file format or structure.');
        }
    } else {
        console.error('Unsupported file type:', type);
        alert('This file type is not supported. Please upload a CSV or JSON file.');
    }
}

function plotData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid data for plotting');
        alert('No valid data to plot.');
        return;
    }
    const plotData = [{
        x: data.map(row => row.x || row[0]),
        y: data.map(row => row.y || row[1]),
        type: 'scatter',
        mode: 'lines+markers'
    }];
    const layout = {};
    const config = { displaylogo: false };
    Plotly.newPlot('myDiv', plotData, layout, config);
}

function plotSampleData() {
    fetch('sample.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && Array.isArray(data.data)) {
                plotData(data.data);
            } else {
                throw new Error('Invalid sample data structure');
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            alert('Failed to load sample data. Please check your internet connection or try again later.');
        });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/DataUtility/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}