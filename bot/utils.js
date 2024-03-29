const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const config = require('./configuration.json')

const BASE_URL = config.baseUrl;
const HEALTH_URL = `${BASE_URL}/health`;
const THREAD_URL = `${BASE_URL}/api/threads`;
const ORDER_URL = `${BASE_URL}/api/threads/:thread/orders`;
const POST_RECEIPT_URL = `${BASE_URL}/api/threads/:thread/receipt`;

const THREAD_FILE = path.join(__dirname, '../thread.id');

// Fry calculation, 2 people to a large, 1 gets a small
module.exports.fryCalc = function(numPeople) {
  const large = Math.floor(numPeople / 2);
  const small = numPeople % 2;

  return {
    large,
    small
  };
};

module.exports.getOrders = async function(thread_ts) {
  const url = ORDER_URL.replace(':thread', thread_ts);
  const response = await axios.get(url);
  if (response.data) {
    return response.data;
  } else {
    throw new Error('Error making xhr to get orders.');
  }
};

module.exports.timeout = async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.wakeUp = async function() {
  const response = await axios.get(HEALTH_URL);
  if (response.status !== 200) {
    throw new Error(`Error waking up dyno: ${response.status}`);
  }
  return response;
};

module.exports.getCurrentThread = async function() {
  if (fs.existsSync(THREAD_FILE)) {
    return fs.readFileSync(THREAD_FILE, 'utf8');
  }
};

module.exports.createNewThread = async function(thread_ts) {
  fs.writeFileSync(THREAD_FILE, thread_ts);
  await axios.post(THREAD_URL, { thread: thread_ts });
}

module.exports.clearThread = async function(thread) {
  fs.unlinkSync(THREAD_FILE);
  await axios.put(`${THREAD_URL}/${thread}`, {active: false});
};

module.exports.uploadImage = async function(thread) {
  const form = new FormData();
  form.append('file', fs.createReadStream('../receipt.png'));

  const request_config = {
    headers: {
      ...form.getHeaders()
    }
  };
  const url = POST_RECEIPT_URL.replace(':thread', thread);
  await axios.post(url, form, request_config);
  return `${url}.png`;
}
