let configData = {};
let currentData = [];
let currentConfig = {};

/**
 * Fetches the configuration from a local JSON file or uses cached configuration.
 * @returns {Promise<Object>} - Returns a promise that resolves to the configuration object.
 */
function getConfig() {
    if (Object.keys(configData).length !== 0) {
        return Promise.resolve(configData);
    }
    console.log('Fetching default config');
    return fetch('cfg/plotcfg.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load default configuration file');
            }
            return response.json();
        })
        .then(config => {
            console.log('Default config loaded:', config);
            configData = config; // Cache the config for future use
            return config;
        })
        .catch(error => {
            console.error('Error fetching default config:', error);
            return {}; // Return an empty object to not break further execution
        });
}

/**
 * Handles configuration file selection by the user.
 * @param {Event} event - The file selection event.
 */
function handleConfigSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No configuration file selected');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            currentConfig = JSON.parse(e.target.result);
            console.log('Configuration loaded successfully');
            if (currentData.length > 0) {
                plotData(currentData); // Re-plot if data exists
            } else {
                alert('Configuration loaded. Please upload or select data to see changes.');
            }
        } catch (error) {
            console.error('Error parsing configuration file:', error);
            alert('The configuration file is not valid JSON.');
        }
    };
    reader.onerror = (error) => {
        console.error('Error reading configuration file:', error);
        alert('There was an error reading the configuration file.');
    };
    reader.readAsText(file);
}

/**
 * Plots the given data using Plotly.js with the current configuration.
 * @param {Array} data - The data to plot.
 */
function plotData(data) {
    // Check if data is inside an object with a 'data' property
    let plotDataArray = Array.isArray(data) ? data : (data.data || []);

    if (!Array.isArray(plotDataArray) || plotDataArray.length === 0) {
        console.error('Invalid data for plotting');
        alert('No valid data to plot.');
        return;
    }
    currentData = plotDataArray; // Save the current data
    applyConfig(currentConfig).then(config => {
        console.log('Applying config:', config);
        const plotData = [{
            x: plotDataArray.map(row => row.x || row[0]),
            y: plotDataArray.map(row => row.y || row[1]),
            type: config.type || 'scatter',
            mode: config.mode || 'lines+markers'
        }];
        const layout = config.layout || {};
        const configOptions = config.config || { displaylogo: false };
        Plotly.newPlot('myDiv', plotData, layout, configOptions);
    }).catch(error => {
        console.error('Error applying configuration:', error);
        alert('Failed to apply configuration. Using default settings.');
        Plotly.newPlot('myDiv', [{
            x: plotDataArray.map(row => row.x || row[0]),
            y: plotDataArray.map(row => row.y || row[1]),
            type: 'scatter',
            mode: 'lines+markers'
        }], {}, { displaylogo: false });
    });
}

function applyConfig(config) {
    return new Promise((resolve, reject) => {
        try {
            currentConfig = config; // Update the current configuration
            resolve(config);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Loads and plots sample data from JSON and CSV files.
 */
function plotSampleData() {
    const sampleFiles = ['sample.json', 'sample.csv'];
    sampleFiles.forEach(file => {
        fetch(file)
            .then(response => response.ok ? response.text() : Promise.reject('Network response was not ok'))
            .then(contents => {
                const type = file.endsWith('.csv') ? 'text/csv' : 'application/json';
                processFile(contents, type);
            })
            .catch(error => {
                console.error(`Fetch Error for ${file}:`, error);
                alert(`Failed to load sample data from ${file}. Please check your connection or try again later.`);
            });
    });
}

document.addEventListener('DOMContentLoaded', plotSampleData);