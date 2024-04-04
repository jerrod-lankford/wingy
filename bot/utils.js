/* eslint-disable no-underscore-dangle */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './configuration.json' with { type: 'json' };

const BASE_URL = config.baseUrl;
const HEALTH_URL = `${BASE_URL}/health`;
const THREAD_URL = `${BASE_URL}/api/threads`;
const ORDER_URL = `${BASE_URL}/api/threads/:slackId/orders`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THREAD_FILE = path.join(__dirname, '../thread.id');

async function jsonAction(url, body, method = 'POST') {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status !== 200) {
    throw new Error(`Error making xhr to ${url}. Status: ${response.statusText}`);
  }
}

export async function getOrders(slackId) {
  const url = ORDER_URL.replace(':slackId', slackId);
  let response;
  try {
    response = await fetch(url);
    console.log('Successfully got orders');
  } catch (e) {
    console.log('Getting orders failed, retrying...');
    console.error(e);
    response = await fetch(url);
  }

  const data = await response.json();

  if (data) {
    return data;
  }

  throw new Error('Error making xhr to get orders.');
}

export async function timeout(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export async function wakeUp() {
  const response = await fetch(HEALTH_URL);
  if (response.status !== 200) {
    throw new Error(`Error waking up dyno: ${response.status}`);
  }
  return response;
}

export async function getCurrentThread() {
  if (fs.existsSync(THREAD_FILE)) {
    const slackId = fs.readFileSync(THREAD_FILE, 'utf8');
    const url = `${THREAD_URL}/${slackId}`;
    const response = await fetch(url);
    if (response.status !== 200) {
      throw new Error(`Error getting thread: ${slackId}`);
    }
    return response.json();
  }
  return {};
}

export async function createNewThread(slackId, channel, teamId) {
  fs.writeFileSync(THREAD_FILE, slackId);
  await jsonAction(THREAD_URL, { slackId, channel, teamId });
}

export async function closeThread(slackId) {
  fs.unlinkSync(THREAD_FILE);
  await jsonAction(`${THREAD_URL}/${slackId}`, { active: false }, 'PATCH');
}

export async function waitThenClick(page, selector) {
  const element = await page.waitForSelector(selector, { visible: true });
  await element.click();
}

export async function waitThenType(page, selector, text) {
  await page.waitForSelector(selector);
  await page.type(selector, text);
}
