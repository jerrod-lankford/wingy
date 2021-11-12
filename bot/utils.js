const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://wingy.herokuapp.com';
const ORDER_URL = `${BASE_URL}/api/orders`;
const THREAD_URL = `${BASE_URL}/api/threads`;
const POST_RECEIPT_URL = `${BASE_URL}/api/receipt`;
const RECEIPT_URL = `${BASE_URL}/receipt.png`;

// Fry calculation, 2 people to a large, 1 gets a small
module.exports.fryCalc = function(numPeople) {
  const large = Math.floor(numPeople / 2);
  const small = numPeople % 2;

  return {
    large,
    small
  };
};

module.exports.getOrders = async function() {
  const response = await axios.get(ORDER_URL);
  if (response.data) {
    return response.data;
  } else {
    throw new Error('Error making xhr to get orders.');
  }
};

module.exports.clearOrders = async function() {
  const response = await axios.delete(ORDER_URL);
  if (response.status !== 200) {
    throw new Error(`Error clearing orders: ${response.status}`);
  }
  return response;
};

module.exports.clearThread = async function() {
  const response = await axios.delete(THREAD_URL);
  if (response.status !== 200) {
    throw new Error(`Error clearing thread: ${response.status}`);
  }
  return response;
};

module.exports.timeout = async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.getCurrentThread = async function() {
  const response = await axios.get(THREAD_URL);
  if (response.status !== 200) {
    throw new Error('Error making xhr to get thread.');
  }

  return (response.data && response.data.thread_ts) || null;
};

module.exports.createNewThread = async function(thread_ts) {
  const response = await axios.post(THREAD_URL, {thread_ts});
  if (response.status !== 200) {
    throw new Error(`Error creating thread ${response.status}`);
  }
  return response;
}

module.exports.uploadImage = async function() {
  const form = new FormData();
  form.append('file', fs.createReadStream(path.join(__dirname, '../receipt.png')));

  const request_config = {
    headers: {
      ...form.getHeaders()
    }
  };

  await axios.post(POST_RECEIPT_URL, form, request_config);
  return RECEIPT_URL;
}