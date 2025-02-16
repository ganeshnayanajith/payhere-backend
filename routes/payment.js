const express = require("express");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

// Merchant details
const merchant_id = process.env.MERCHANT_ID; // Replace with your actual Merchant ID
const merchant_secret = process.env.MERCHANT_SECRET; // Replace with your Merchant Secret

router.post("/generate-hash", (req, res) => {
  const { order_id, amount, currency } = req.body;
  console.log("Payment request for order:", order_id);

  console.log(`merchant_id: ${merchant_id}, merchant_secret: ${merchant_secret}`);

  const hashed_merchant_secret = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")
    .toUpperCase();

  console.log(`hashed_merchant_secret: ${hashed_merchant_secret}`);

  // Generate the hash value
  const hash = crypto
    .createHash("md5")
    .update(
      merchant_id +
      order_id +
      amount +
      currency +
      hashed_merchant_secret
    )
    .digest("hex")
    .toUpperCase();

  console.log("Hash generated for order:", order_id);

  res.json({ data: hash });
});

// Payment notification endpoint
router.post("/verify-payment", (req, res) => {

  console.log("Payment notification received");
  console.log(req.body);

  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const local_md5sig = crypto
    .createHash("md5")
    .update(
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      crypto
        .createHash("md5")
        .update(merchant_secret)
        .digest("hex")
        .toUpperCase()
    )
    .digest("hex")
    .toUpperCase();

  console.log("Payment notification for order:", order_id);



  if (local_md5sig === md5sig && status_code == "2") {
    // Payment success - update the database
    console.log("Payment successful for order:", order_id);
    res.sendStatus(200);
  } else {
    // Payment verification failed
    console.log("Payment verification failed for order:", order_id);
    res.sendStatus(400);
  }
});

module.exports = router;