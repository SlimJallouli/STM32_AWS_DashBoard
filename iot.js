// WARNING!!! It is not recommended to expose
// sensitive credential information in code.
// Consider setting the following AWS values from a secure source.

// The device ID
let DeviceID = '';
// example: us-east-1
const REGION = "us-west-2";
// example: xzy-ats.iot.your-region.amazonaws.com
const IOT_ENDPOINT = "a1qwhobjtvew8t-ats.iot.us-west-2.amazonaws.com";
// your AWS access key ID
let KEY_ID = "";
// your AWS secret access key
let SECRET_KEY = "";


let client = {};

let subscribed = false;
let isConnected = false;
let env_sensor_topic  = "/"+DeviceID+"/env_sensor_data";
let motion_sensor_topic = "/"+DeviceID+"/motion_sensor_data";
let shadow_topic = "$aws/things/"+DeviceID+"/shadow/update";
let presense_topic = "$aws/events/presence/";

let message_count = 0;
var _clientToken = Math.random() * 1000000;

//gets MQTT client
function initClient()
{
  const clientId = Math.random().toString(36).substring(7);
  const _client  = new Paho.MQTT.Client(getEndpoint(), clientId);

    // publish method added to simplify messaging
    _client.publish = function(topic, payload)
      {
        let payloadText = JSON.stringify(payload);
        let message = new Paho.MQTT.Message(payloadText);
        message.destinationName = topic;
        message.qos = 0;
        _client.send(message);
    }

    return _client;
}

function getEndpoint()
{
// WARNING!!! It is not recommended to expose
// sensitive credential information in code.
// Consider setting the following AWS values
// from a secure source.

    // example: us-east-1
    //const REGION = "us-east-2";

    // example: blahblahblah-ats.iot.your-region.amazonaws.com
    //const IOT_ENDPOINT = "a1qwhobjtvew8t-ats.iot.us-east-2.amazonaws.com";

    // your AWS access key ID
    //const KEY_ID =

    // your AWS secret access key
    //const SECRET_KEY = "";

    // date & time
    const dt = (new Date()).toISOString().replace(/[^0-9]/g, "");
    const ymd = dt.slice(0,8);
    const fdt = `${ymd}T${dt.slice(8,14)}Z`

    const scope = `${ymd}/${REGION}/iotdevicegateway/aws4_request`;
    const ks = encodeURIComponent(`${KEY_ID}/${scope}`);

      let qs = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${ks}&X-Amz-Date=${fdt}&X-Amz-SignedHeaders=host`;

      const req = `GET\n/mqtt\n${qs}\nhost:${IOT_ENDPOINT}\n\nhost\n${p4.sha256('')}`;

      qs += '&X-Amz-Signature=' + p4.sign(p4.getSignatureKey( SECRET_KEY, ymd, REGION, 'iotdevicegateway'), `AWS4-HMAC-SHA256\n${fdt}\n${scope}\n${p4.sha256(req)}`);
    return `wss://${IOT_ENDPOINT}/mqtt?${qs}`;
}

function p4(){}
p4.sign = function(key, msg)
{
    const hash = CryptoJS.HmacSHA256(msg, key);
    return hash.toString(CryptoJS.enc.Hex);
};

p4.sha256 = function(msg)
{
    const hash = CryptoJS.SHA256(msg);
    return hash.toString(CryptoJS.enc.Hex);
};

p4.getSignatureKey = function(key, dateStamp, regionName, serviceName)
{
    const kDate    = CryptoJS.HmacSHA256(dateStamp     , 'AWS4' + key);
    const kRegion  = CryptoJS.HmacSHA256(regionName    , kDate);
    const kService = CryptoJS.HmacSHA256(serviceName   , kRegion);
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
    return kSigning;
};

function connected()
{
  console.log("connected to AWS");
  //document.getElementById("idTitle").innerHTML = 'Connected to AWS';

}

function getClient(success)
{
    if (!success) success = ()=> connected();

    const _client = initClient();

    const connectOptions =
      {
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
      onSuccess: success
    };

    _client.connect(connectOptions);

    return _client;
}

function HideShowElement(elementID, HideShow)
{
    var x = document.getElementById(elementID);

    if(HideShow == true)
    {
        x.style.display = "block";
    }
    else
    {
      x.style.display = "none";
    }
}

/* Unsubscribe from all topics */
function unsubscribe()
{
    if(subscribed == true)
    {
        client.unsubscribe(env_sensor_topic);
          client.unsubscribe(motion_sensor_topic);
        client.unsubscribe(shadow_topic+"/accepted");
        client.unsubscribe(presense_topic+"#");


        subscribed = false;
    }
}

/* Update the topics and subscribe */
function subscribe()
{
    unsubscribe();

    //DeviceID = document.getElementById("idDeviceID").value ;
    document.getElementById("deviceID").innerHTML = DeviceID;

    env_sensor_topic  = DeviceID+"/env_sensor_data";
    motion_sensor_topic = DeviceID+"/motion_sensor_data";
    shadow_topic = "$aws/things/"+DeviceID+"/shadow/update";
    //presense_topic = presense_topic+"#"

    client.subscribe(env_sensor_topic);
      client.subscribe(motion_sensor_topic);
    client.subscribe(shadow_topic+"/accepted");
    client.subscribe(presense_topic+"#");

    subscribed = true;

    console.log("subscribed to:");
    console.log(env_sensor_topic);
    console.log(motion_sensor_topic);
    console.log(shadow_topic);
    console.log(presense_topic+"#");
}

function init()
{

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    DeviceID   = urlParams.get('DeviceID');
    KEY_ID     = urlParams.get('KEY_ID');
    SECRET_KEY = urlParams.get('SECRET_KEY');

    //DeviceID = document.getElementById("idDeviceID").value ;
    document.getElementById("deviceID").innerHTML = DeviceID;

    client = getClient(() => {
        subscribe();
      });
      
    client.onMessageArrived = processMessage;
      
      client.onConnection = connected();

    client.onConnectionLost = function(e)
      {
        console.log(e);
        // document.getElementById("idTitle").innerHTML = 'Disconnected from AWS';
        HideShowElement("idButtonSubscribe", false);
    }

    setInterval(onConnectionStatusTimer, 5000);
}

function onConnectionStatusTimer() {
    if (message_count == 0) {
        isConnected = false;
        updateConnectionStatus();
    }
    message_count = 0;
}

function updateConnectionStatus() {
    let status = document.getElementById("idConnectionStatus");
    if (isConnected) {
        status.innerHTML = 'Device connected';
        status.classList.remove('status-disconnected')
        status.classList.add('status-connected')
    } else {
        status.innerHTML = 'Device disconnected';
        status.classList.remove('status-connected')
        status.classList.add('status-disconnected')
    }
}

function processMessage(message)
{
    let info = JSON.parse(message.payloadString);
      
    console.log("Topic: " + message.destinationName);
    console.log(info);

    message_count += 1;

    if((message.destinationName == motion_sensor_topic) || (message.destinationName == env_sensor_topic))
    {
        isConnected = true;
        updateConnectionStatus();
    }
   
      
    if(message.destinationName == shadow_topic+"/accepted")
    {
        try
        {
           if(info.state.reported.powerOn == '1')
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
        catch
        {
            //Do nothing
        }
    }
    else if(message.destinationName == env_sensor_topic)
    {
      add_env_sensor_data(info.temp_0_c, info.rh_pct);
    }
    else if(message.destinationName == motion_sensor_topic)
    {
        add_motion_sensor_data(info.acceleration_mG.x, info.acceleration_mG.y,info.acceleration_mG.z);
    }
    else if(message.destinationName.includes(presense_topic) && message.destinationName.includes(DeviceID))
    {
        try
        {
            if(info.clientId.includes(DeviceID))
            {
                document.getElementById("idConnectionStatus").innerHTML = DeviceID+ " " + info.eventType;
                isConnected = info.state.eventType == "connected"
                updateConnectionStatus()
            }
        }
        catch
        {
            //Do nothing
        }
    }
}

/* Sensd a shadow message, use "1" or "0" to goggle the led on/off*/
function SendMessage(message)
{
    _clientToken++;

    const publishData =
      {
        state:{
          desired:{
          powerOn: message,
        }
        },

      clientToken: _clientToken.toFixed()

      };
            
    client.publish(shadow_topic, publishData);
}

window.addEventListener('DOMContentLoaded', ()=>init());
