document.addEventListener('DOMContentLoaded', () => {
    // Plot sample data when the page loads
    plotSampleData();

    // Event listener for file input to handle user file uploads
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    // Assuming 'fetchButton' and 'urlInput' exist in your HTML
    document.getElementById('fetchButton').addEventListener('click', handleUrlInput);
});

let deferredPrompt;

// PWA installation handling
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
});

function showInstallPromotion() {
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', handleInstallClick, { once: true });
    }
}

function handleInstallClick() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

/**
 * Handles file selection for plotting new data.
 * @param {Event} event - The file selection event.
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                plotData(data); // Assuming plotData is defined in plotting.js
            } catch (error) {
                console.error('JSON Parse Error:', error);
                alert('There was an error parsing the JSON file. Please check the file format or structure.');
            }
        };
        reader.readAsText(file);
    }
}

function handleConfigSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);
                applyConfig(config).then(() => {
                    if (currentData.length > 0) {
                        plotData(currentData); // Re-plot the data with the new configuration
                    }
                });
            } catch (error) {
                console.error('JSON Parse Error:', error);
                alert('There was an error parsing the JSON file. Please check the file format or structure.');
            }
        };
        reader.readAsText(file);
    }
}

/**
 * Handles fetching data from a URL provided by the user.
 */
function handleUrlInput() {
    const url = document.getElementById('urlInput').value;
    if (!url) {
        alert('No URL entered');
        return;
    }
    fetch(url)
        .then(response => response.ok ? response.text().then(text => ({ text, type: response.headers.get('content-type') })) : Promise.reject('Network response was not ok'))
        .then(({ text, type }) => processFile(text, type || ''))
        .catch(error => {
            console.error('Fetch Error:', error);
            alert('Failed to fetch data from the URL. Please check the URL and try again.');
        });
}

/**
 * Processes file content based on its type.
 * @param {string} contents - The content of the file or URL response.
 * @param {string} type - MIME type of the content.
 */
function processFile(contents, type) {
    if (type.includes('text/csv') || type === '') {
        Papa.parse(contents, {
            complete: results => plotData(results.data),
            error: err => {
                console.error('CSV Parse Error:', err);
                alert('There was an error parsing the CSV file. Please check the file format.');
            }
        });
    } else if (type.includes('application/json')) {
        try {
            const data = JSON.parse(contents);
            if (Array.isArray(data) || (data.data && Array.isArray(data.data))) {
                plotData(Array.isArray(data) ? data : data.data);
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