/* eslint-disable no-underscore-dangle */
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ACTIONS } from '../common/slack-blocks.js';
import { validateOrder, validateThread, getReceiptImage } from './order-utils.js';

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/wingy';
const dbName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
const PORT = process.env.PORT || 3000;
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// __dirname polyfill for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create collections and start the server
const client = new MongoClient(url);
const db = client.db(dbName);
const threads = db.collection('threads');
const orders = db.collection('orders');
app.listen(PORT);
console.log(`Server running on port ${PORT}`);

// Collections
const upload = multer({
  dest: __dirname,
});

/** Helper functions */
// Lookup order from mongo or return a new order to be upserted (does not insert in this method)
async function lookupOrCreateOrder(user, thread) {
  const order = await orders.findOne({ name: user.username, thread });

  if (order) {
    return order;
  }

  return {
    name: user.username,
    userId: user.id,
    thread,
    time: new Date().toLocaleString(),
  };
}

// Update order in mongodb
async function updateOrder(order) {
  // eslint-disable-next-line no-param-reassign
  delete order._id;
  const query = { name: order.name, thread: order.thread };
  const values = { $set: { ...order } };

  try {
    await orders.updateOne(query, values, { upsert: true });
  } catch (e) {
    console.error('Error updating order');
    console.error(e);
  }
}

// Form return values are Type:Size:Price eg (Tenders:2 Tenders:6.99)
function parseSize(action) {
  const values = action.selected_option.value.split(':');
  return {
    type: values[0],
    item: values[1],
    price: parseFloat(values[2]),
  };
}

function parseSelect(action) {
  return action.selected_option.value;
}

function parseMultiselect(action) {
  return action.selected_options.map((option) => option.value);
}

async function sendMessage(responseURL, text) {
  const response = await fetch(responseURL, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      text,
      replace_original: false,
      response_type: 'ephemeral',
    }),
  });

  if (response.status !== 200) {
    console.error('Error sending message:', response.statusText);
  }
}

async function parseAction(payload) {
  const { user } = payload;
  const action = payload.actions[0];
  const threadTs = payload.message.ts;

  const order = await lookupOrCreateOrder(user, threadTs);

  let text;
  // In case it was complete before, any action will cause it to be uncompleted
  if (order.complete) {
    order.complete = false;
    text = ':warning: Order updated but you need to click Order again to finalize.';
  }

  switch (action.action_id) {
    case ACTIONS.SIZE:
      Object.assign(order, parseSize(action));
      break;
    case ACTIONS.SAUCES:
      order.sauces = parseMultiselect(action);
      break;
    case ACTIONS.DRESSING:
      order.dressing = parseSelect(action);
      break;
    case ACTIONS.FRIES:
      order.fries = parseSelect(action);
      break;
    case ACTIONS.ORDER: {
      const thread = await threads.findOne({ slack_id: threadTs });
      text = validateThread(thread);
      text = text || validateOrder(order);
      break;
    }
    default:
      throw new Error(`Unknown action id ${action}`);
  }

  await updateOrder(order);

  if (text) {
    await sendMessage(payload.response_url, text);
  }
}

/** Express routes */
app.get('/health', (req, res) => {
  res.status(200).end();
});

app.post('/slack', urlencodedParser, async (req, res) => {
  const actionJSONPayload = JSON.parse(req.body.payload);
  await parseAction(actionJSONPayload);
  res.status(200).end();
});

app.get('/api/threads/:thread/orders', async (req, res) => {
  const { thread } = req.params;
  const cursor = orders.find({ thread });
  const allOrders = await cursor.toArray();
  res.status(200).send(allOrders).end();
});

app.delete('/api/threads/:thread/orders', async (req, res) => {
  const { thread } = req.params;

  try {
    await orders.deleteMany({ thread });
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: `Error deleting orders: ${e.errorResponse.errmsg}` });
  }
});

app.post('/api/threads', jsonParser, async (req, res) => {
  const { thread } = req.body;
  try {
    await threads.insertOne({ slack_id: thread, active: true });
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: `Error creating thread: ${e.errorResponse.errmsg}` });
  }
});

app.patch('/api/threads/:thread', jsonParser, async (req, res) => {
  const { thread } = req.params;
  const { active } = req.body;

  try {
    await threads.updateOne({ slack_id: thread }, { $set: { active } });
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: `Error updating thread: ${e.errorResponse.errmsg}` });
  }
});

app.delete('/api/threads', async (req, res) => {
  try {
    await threads.deleteMany({});
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: `Error deleting threads: ${e.errorResponse.errmsg}` });
  }
});

// TODO the heroku filesystem is ephemeral, so this will not last forever, find a more persistance way to store receipt images
app.post(
  '/api/threads/:thread/receipt',
  upload.single('file'),
  (req, res) => {
    const { thread } = req.params;
    const tempPath = req.file.path;
    const targetPath = getReceiptImage(thread);

    if (path.extname(req.file.originalname).toLowerCase() === '.png') {
      fs.rename(tempPath, targetPath, () => {
        res
          .status(200)
          .contentType('text/plain')
          .end('File uploaded!');
      });
    } else {
      fs.unlink(tempPath, () => {
        res
          .status(403)
          .contentType('text/plain')
          .end('Only .png files are allowed!');
      });
    }
  },
);

app.get('/api/threads/:thread/receipt.png', (req, res) => {
  const { thread } = req.params;
  res.sendFile(getReceiptImage(thread));
});
