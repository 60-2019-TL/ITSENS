let chart = document.getElementById('myChart');
let availableColors = ['#FF4500', '#1C86EE','#7CFC00', '#FF00FF', '#FF7F00','#000000'];

$(document).ready(function () {
    if ($('#myChart').html() === "") {
        $.get('C:\\Users\\Tamara\\Desktop\\2023merenja.csv', function (data) { dataToArrays(data) }, 'text');
    }

    document.getElementById('csvFile').addEventListener('change', upload, false);

});

function dataToArrays(data) {
    let rawData = Papa.parse(data);
   
    createChart(rawData);
}


function getColor() {
    if (availableColors.length > 0) {
        return availableColors.shift(); // Uzmi prvu boju iz niza i ukloni je iz niza
    } else {
        console.log("Nema više dostupnih boja.");
        // Ako nestanu boje, možete vratiti podrazumevanu boju ili prekinuti izvršenje funkcije
        return '#000000'; // Crna boja kao podrazumevana
    }
}


function createChart(parsedData) {
    let dataArray = parsedData.data;
    let dataMatrix = [];

    let headingArray = [];

    for (let i = 0; i < dataArray[0].length; i++) {
        dataMatrix[i] = [];

        headingArray.push({
            title: dataArray[0][i],
            unit: dataArray[1][i],
        })
    }

    for (let i = 0; i < dataArray.length; i++) {
        for (let j = 0; j < dataArray[i].length; j++) {
            if (!dataArray[i][j]) {
                dataArray[i][j] = null;
            }
            dataMatrix[j][i] = dataArray[i][j];
        }
    }

    let commentIndex = headingArray.findIndex(element => {
        if (element.title === 'Comment') {
            return true;
        }
    });
    if (commentIndex !== -1) {
        dataMatrix.splice(commentIndex, 1);
        headingArray.splice(commentIndex, 1);
    }

    let html = '';
    html += '<table class="table"><tbody>';

    parsedData.data.forEach(element => {
        if (element.some(function (el) { return el !== null; })) {
            html += '<tr>';
            element.forEach(element => {
                html += '<td>' + (element !== null ? element : '') + '</td>';
            });
            html += '</tr>';
        }
    });
    html += '</tbody></table>'
    $('#parsedData').html(html);

    console.log(parsedData);
    console.log(dataMatrix);
    console.log(headingArray);

    /* Global chart options */

    Chart.defaults.global.defaultFontFamily = 'Consolas';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = 'black';

    Chart.defaults.global.elements.line.backgroundColor = 'transparent';

    /* /Global chart options */

    /* Data */

    let labels = dataMatrix[0];
    labels.splice(0, 3);

    let datasets = [];

    for (let i = 1; i < dataMatrix.length; i++) {
        let label = dataMatrix[i][0];

        let datasetData = dataMatrix[i];
        datasetData.splice(0, 3);

        datasets.push({
            label: label,
            data: datasetData,

            borderColor: getColor(),
            borderWidth: '1',

            pointRadius: 0,
        });
    }

    /* /Data */

    let myChart = document.getElementById('myChart').getContext('2d');
    let type = 'line';
    let data = {
        labels,
        datasets,
    };
    let options = {
        title: {
            display: true,
            text: ['Prikaz rezultata merenja:'],
            fontSize: 23,
            fontFamily: "Times New Roman",
        },
        legend: {
            position: 'bottom',
            labels: {
                fontColor: 'black',
            }
        },
        tooltips: {
            intersect: false,
            callbacks: {
                title: (toolTipItem) => {
                    return headingArray[0].title + ": " + toolTipItem[0].label + " " + headingArray[0].unit;
                },
                label: (toolTipItem) => {
                    return toolTipItem.yLabel + " " + headingArray[toolTipItem.datasetIndex + 1].unit;

                },
            },
        },
    };

    chart = new Chart(myChart, { type, data, options });
}



function upload(evt) {
    if (chart != null) {
        chart.destroy();
    }

    let data = null;
    let file = evt.target.files[0];
    let reader = new FileReader();
    try { reader.readAsText(file); } catch (e) { console.log(e) }
    reader.onload = function (event) {
        let csvData = event.target.result;
        data = csvData;
        if (data && data.length > 0) {
            console.log('Imported -' + data.length + '- rows successfully!');
            dataToArrays(data);
        } else {
            console.log('No data to import!');
        }
    };
    reader.onerror = function () {
        console.log('Unable to read ' + file.fileName);
    };
}