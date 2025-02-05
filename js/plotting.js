let configData = {};
let currentData = null; // Store the last plotted data

function getConfig() {
    if (Object.keys(configData).length !== 0) {
        return Promise.resolve(configData);
    } else {
        console.log('Fetching default config'); // Add this line
        return fetch('cfg/plotcfg.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load default configuration file');
                }
                return response.json();
            }).then(config => {
                console.log('Default config loaded:', config); // Add this line
                return config;
            });
    }
}

function handleConfigSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No configuration file selected');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            configData = JSON.parse(e.target.result);
            console.log('Configuration loaded successfully');
            // Re-plot data if we have data available
            if (currentData) {
                plotData(currentData);
            }
        } catch (error) {
            console.error('Error parsing configuration file:', error);
            alert('The configuration file is not valid JSON.');
        }
    };
    reader.onerror = function(error) {
        console.error('Error reading configuration file:', error);
        alert('There was an error reading the configuration file.');
    };
    reader.readAsText(file);
}

function plotData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid data for plotting');
        alert('No valid data to plot.');
        return;
    }
    currentData = data; // Save the current data
    getConfig().then(config => {
        console.log('Applying config:', config); // Add this line
        const plotData = [{
            x: data.map(row => row.x || row[0]),
            y: data.map(row => row.y || row[1]),
            type: config.type || 'scatter',
            mode: config.mode || 'lines+markers'
        }];
        const layout = config.layout || {};
        const configOptions = config.config || { displaylogo: false };
        Plotly.newPlot('myDiv', plotData, layout, configOptions);
    }).catch(error => {
        console.error('Error loading configuration:', error);
        alert('Failed to load configuration. Using default settings.');
        const plotData = [{
            x: data.map(row => row.x || row[0]),
            y: data.map(row => row.y || row[1]),
            type: 'scatter',
            mode: 'lines+markers'
        }];
        const layout = {};
        const configOptions = { displaylogo: false };
        Plotly.newPlot('myDiv', plotData, layout, configOptions);
    });
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

    // Fetch and plot sample CSV data
    fetch('sample.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(contents => {
            Papa.parse(contents, {
                complete: function(results) {
                    plotData(results.data);
                },
                error: function(err) {
                    console.error('CSV Parse Error:', err);
                    alert('There was an error parsing the sample CSV file.');
                }
            });
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            alert('Failed to load sample CSV data. Please check your internet connection or try again later.');
        });
}

// Call plotSampleData when the page loads
document.addEventListener('DOMContentLoaded', () => {
    plotSampleData();
});