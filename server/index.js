const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { ACTIONS } = require('../common/slack-blocks.js');
const { validateOrder, validateThread, getReceiptImage } = require('./order-utils');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/wingy';
const dbName = url.substr(url.lastIndexOf('/') + 1).split('?')[0];
const PORT = process.env.PORT || 3000;
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// Collections
let orders, threads;

const upload = multer({
  dest: __dirname
});

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

app.delete('/api/threads/:thread/orders', (req, res) => {
  const { thread } = req.params;
  const result = orders.deleteMany({ thread });
  if (!result.writeError) {
    res.status(200).end();
  } else {
    res.status(400).send({error: result.writeError.errmsg}).end();
  }
});

app.post('/api/threads', jsonParser, (req, res) => {
  const { thread } = req.body;
  threads.insertOne({ slack_id: thread, active: true }, function(err) {
    if (err) {
      res.status(400).send({error: result?.writeError?.errmsg}).end();
    } else {
      res.status(200).end();
    }
  });
});

app.put('/api/threads/:thread', jsonParser, (req, res) => {
  const { thread } = req.params;
  const { active } = req.body;
  const result = threads.updateOne({ slack_id: thread }, { $set: { active } });
  if (!result.writeError) {
    res.status(200).end();
  } else {
    res.status(400).send({error: result.writeError.errmsg}).end();
  }
});

app.delete('/api/threads', (req, res) => {
  const result = threads.deleteMany({});
  if (!result.writeError) {
    res.status(200).end();
  } else {
    res.status(400).send({error: result.writeError.errmsg}).end();
  }
});

// TODO the heroku filesystem is ephemeral, so this will not last forever, find a more persistance way to store receipt images
app.post('/api/threads/:thread/receipt',
  upload.single('file'),
  (req, res) => {
    const { thread } = req.params;
    const tempPath = req.file.path;
    const targetPath = getReceiptImage(thread);

    if (path.extname(req.file.originalname).toLowerCase() === '.png') {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .contentType('text/plain')
          .end('File uploaded!');
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType('text/plain')
          .end('Only .png files are allowed!');
      });
    }
  }
);

app.get('/api/threads/:thread/receipt.png', (req, res) => {
  const { thread } = req.params;
  res.sendFile(getReceiptImage(thread));
});

let dbo;

// Create collections and start the server
connect().then(result => {
  dbo = result;
  return getOrCreateCollection(dbo, 'orders');
}).then(collection => {
  orders = collection;
  return getOrCreateCollection(dbo, 'threads')
}).then(collection => {
  threads = collection;
  console.log(`Listening on ${PORT}...`);
  app.listen(PORT);
});

/**** Helper functions ******/
async function parseAction(payload) {
  const user = payload.user;
  const action = payload.actions[0];
  const threadTs = payload.message.ts;
  const order = await lookupOrCreateOrder(user, threadTs);

  let text;
  // In case it was complete before, any action will cause it to be uncompleted
  if (order.complete) {
    order.complete = false;
    text = `:warning: Order updated but you need to click Order again to finalize.`;
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
    case ACTIONS.ORDER:
      const thread = await threads.findOne({slack_id: threadTs});
      text = validateThread(thread);
      text = text || validateOrder(order);
      break;
    default:
      throw new Error(`Unknown action id ${action}`);
  }

  await updateOrder(order);

  if (text) {
    sendMessage(payload.response_url, text);
  }
}

// Lookup order from mongo or insert a new order
function lookupOrCreateOrder(user, thread) {
  return new Promise((resolve, reject) => {
    orders.findOne({ name: user.username, thread: thread }, function(err, result) {
      if (err) reject(error);

      if (result) {
        resolve(result);
      } else {
        // Create a new order with the given timestamp and user
        const date = new Date();
        const order = {
          name: user.username,
          user_id: user.id,
          thread,
          time: date.toLocaleString()
        };

        // Insert the new order and return it
        orders.insertOne(order, function(err, res) {
          if (err) reject(err);
          console.log('new order created');
          resolve(order);
        });
      }
    });
  });
}

// Update order in mongodb
function updateOrder(order) {
  delete order._id;
  return new Promise((resolve, reject) => {
    var query = { name: order.name };
    var values = { $set: {...order}};
    orders.updateOne(query, values, function(err) {
      if (err) reject(err);
      console.log('order updated');
      resolve(true);
    });
  });
}

// Form return values are Type:Size:Price eg (Tenders:2 Tenders:6.99)
function parseSize(action) {
  const values = action.selected_option.value.split(':');
  return {
    type: values[0],
    item: values[1],
    price: parseFloat(values[2])
  };
}

function parseSelect(action) {
  return action.selected_option.value;
}

function parseMultiselect(action) {
  return action.selected_options.map(option => option.value);
}

function sendMessage(responseURL, text) {
  var postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: {
      text,
      replace_original: false,
      response_type: 'ephemeral'
    }
  };
  request(postOptions, (error) => {
    if (error) {
      console.log(`error sending validation message: ${error}`);
    }
  });
}

function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) reject(err);
      const dbo = db.db(dbName);
      resolve(dbo);
    });
  });
}

function getOrCreateCollection(dbo, name) {
  return new Promise((resolve, reject) => {
      const collection  = dbo.collection(name);
      if (collection) {
        resolve(collection);
      } else {
        dbo.createCollection(name, function(err, res) {
          if (err) reject(err);
          resolve(res);
        });
      }
  });
}