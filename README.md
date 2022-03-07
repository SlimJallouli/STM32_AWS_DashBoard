# STM32_AWS_DashBoard
Demo on how to use JavaScript to connect to AWS and exchange MQTT messages

[B-U585I-IOT02A](https://www.st.com/en/evaluation-tools/b-u585i-iot02a.html)

[Source code](https://github.com/FreeRTOS/lab-iot-reference-stm32u5)

[Create an IAM user in your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)

- Open STM32_AWS_DashBoard\assets\iot.js and update the following

```
// WARNING!!! It is not recommended to expose
// sensitive credential information in code.
// Consider setting the following AWS values from a secure source.

// example: us-east-1
const REGION = "us-east-2";
// example: xzy-ats.iot.your-region.amazonaws.com
const IOT_ENDPOINT = "a1qwhobjtvew8t-ats.iot.us-east-2.amazonaws.com";
// your AWS access key ID
const KEY_ID = "";
// your AWS secret access key
const SECRET_KEY = "";
```

- Open Index.html
- Replave **SLIM_U5_AMZ** with your device name
- Click "Subscribe"