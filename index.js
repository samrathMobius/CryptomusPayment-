const axios = require('axios');
const crypto = require('crypto');
const express = require('express');

const app = express()

app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString()
    }
}));

const MERCHANT_ID = "421b757b-3470-492f-8f87-b97817fcb893"
const API_KEY = "*Api key of cryptomus*"

app.post('/checkout', async (req, res) => {
    const { amount, currency } = req.body;

    const data = {
        amount,
        currency,
        order_id: crypto.randomBytes(12).toString("hex"),
        url_callback: "https://5627-183-82-6-253.ngrok-free.app/callback"
    };

    const sign = crypto.createHash("md5")
    .update(Buffer.from(JSON.stringify(data)).toString("base") + API_KEY).digest('hex');

    const response = await axios.post("https://api.cryptomus.com/v1/payment", data,{
        headers: {
            merachant: MERCHANT_ID,
        }
    });
    res.send(response.data);
})

app.post('/callback', async (req, res) => {
    const { sign } = req.body;

    if (!sign) {
        return res.status(404).send("Invalid payload");

    }

    const data = JSON.parse(req.rawBody)

    delete data.sign;
    
    const hash = crypto.createHash("md5")
    .update(Buffer.from(JSON.stringify(data)).toString("base") + API_KEY).digest('hex');

    if(hash !== sign) {
        return res.status(400).send("Invalid Sign")
    }

    console.log(req.body);

    res.sendStatus(200);
});

app.listen(3000, () => console.log('server running...'))