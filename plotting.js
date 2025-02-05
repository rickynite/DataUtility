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