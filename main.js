const envDiv = document.getElementById('envData').getContext("2d");
const motionDiv = document.getElementById('motionData').getContext("2d");

const MAX_INDEX = 20;

let delayed;


const env_labels = [];
const motion_labels = [];

var env_index = 0;
var motion_index = 0;

const env_data = {
    labels: env_labels,
    datasets: [{
        data: [],
        label: "Temperature (°C)",
        borderColor: "#3cb4e6",
        pointBackgroundColor: "#3cb4e6",
        tension: 0,
    },
    {
        data: [],
        label: "Humidity (%)",
        borderColor: "#ffd200",
        pointBackgroundColor: "#ffd200",
        tension: 0,
    }]
};

const motion_data = {
    labels: motion_labels,
    datasets: [{
        data: [],
        label: "x",
        borderColor: "#3cb4e6",
        pointBackgroundColor: "#3cb4e6",
        tension: 0,
    },
    {
        data: [],
        label: "y",
        borderColor: "#ffd200",
        pointBackgroundColor: "#ffd200",
        tension: 0,
    },
    {
        data: [],
        label: "z",
        borderColor: "#e6007e",
        pointBackgroundColor: "#e6007e",
        tension: 0,
    }]
}

const env_config = {
    type: 'line',
    data: env_data,
    options: {
        animation: {
            onComplete: () => {
                delayed = true;
            },
            delay: (context) => {
                let delay = 0;
                if (context.type === "data" && context.mode === "default" && !delayed) {
                    delay = context.dataIndex * 300 + context.datasetIndex * 100;
                }
                return delay;
            },
        },
        plugins: {
            title: {
                display: true,
                text: 'Temperature and Humidity',
                color: '#03234b',
            }
        },
        radius: 5,
        hitRadius: 30,
        hoverRadius: 12,
        responsive: true,
    },
}

const motion_config = {
    type: 'line',
    data: motion_data,
    options: {
        animation: {
            onComplete: () => {
                delayed = true;
            },
            delay: (context) => {
                let delay = 0;
                if (context.type === "data" && context.mode === "default" && !delayed) {
                    delay = context.dataIndex * 300 + context.datasetIndex * 100;
                }
                return delay;
            },
        },
        plugins: {
            title: {
                display: true,
                text: 'Acceleration (mG)',
                color: '#03234b',
            }
        },
        radius: 5,
        hitRadius: 30,
        hoverRadius: 12,
        responsive: true,
    },
}

const envChart = new Chart(envDiv, env_config);
const motionChart = new Chart(motionDiv, motion_config);


function add_env_sensor_data(temp, hum) {
    env_index++;
    if (env_index > MAX_INDEX) {
        envChart.data.labels.shift();
        envChart.data.datasets[0].data.shift();
        envChart.data.datasets[1].data.shift();
    }

    envChart.data.labels.push(env_index);
    envChart.data.datasets[0].data.push(temp);
    envChart.data.datasets[1].data.push(hum);

    envChart.update();
    console.log("added (" + temp + ", " + hum + ")")
}

function add_motion_sensor_data(x, y, z)
{
    motion_index++;

    if(motion_index > MAX_INDEX)
    {
        motionChart.data.labels.shift();
        motionChart.data.datasets[0].data.shift();
        motionChart.data.datasets[1].data.shift();
        motionChart.data.datasets[2].data.shift();
    }

    motionChart.data.labels.push(motion_index);
    motionChart.data.datasets[0].data.push(x);
    motionChart.data.datasets[1].data.push(y);
    motionChart.data.datasets[2].data.push(z);

    motionChart.update();
}

function toggleLED() {
    let ledCheckbox = document.getElementById("ledCheckbox");

    if (ledCheckbox.checked) {
        SendMessage("1")
    } else {
        SendMessage("0")
    }
}

function turnLED(on) 
{
    if(on)
    {
        document.getElementById("ledImage").src="/assets/led_on.svg";
        document.getElementById("ledCheckbox").checked = true;
    }
    else
    {
        document.getElementById("ledImage").src="/assets/led_off.svg";
        document.getElementById("ledCheckbox").checked = false;
    }
}

