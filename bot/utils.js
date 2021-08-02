const axios = require('axios');

const BASE_URL = 'https://wingy.herokuapp.com';
const ORDER_URL = `${BASE_URL}/api/orders`;
const CLEAR_ORDER_URL = `${BASE_URL}/api/clear`;
const THREAD_URL = `${BASE_URL}/api/threads`;

// 2 people to a small, 3 to a large
module.exports.fryCalc = function(numPeople) {
  let large = Math.floor(numPeople / 3);
  let r = numPeople % 3;
  let small = 0;

  if (r === 1) {
    large !== 0 ? large-- : large;
    small += numPeople === 1 ? 1 : 2;
  } else if (r === 2) {
    small++;
  }

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
  const response = await axios.post(CLEAR_ORDER_URL);
  if (response.status !== 200) {
    throw new Error(`Error clearing orders: ${response.status}`);
  }
  return response;
};

module.exports.timeout = async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.getCurrentThread = async function() {
  const response = await axios.get(THREAD_URL);
  if (response.data) {
    return response.data;
  } else {
    throw new Error('Error making xhr to get thread.');
  }
};

module.exports.createNewThread = async function(thread_ts) {
  const response = await axios.post(THREAD_URL, {thread_ts});
  if (response.status !== 200) {
    throw new Error(`Error creating thread ${response.status}`);
  }
  return response;
}