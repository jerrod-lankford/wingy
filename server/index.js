const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const { ACTIONS } = require("../common/slack-blocks.js");

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/wingy";
const dbName = url.substr(url.lastIndexOf('/') + 1);
const PORT = process.env.PORT || 3000;
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

let orders;

app.post("/slack", urlencodedParser, async (req, res) => {
  var actionJSONPayload = JSON.parse(req.body.payload);
  await parseAction(actionJSONPayload);
  res.status(200).end();
});

app.get("/api/orders", async (req, res) => {
  const cursor = orders.find({});
  const allOrders = await cursor.toArray();
  res.status(200).send(allOrders).end();
});

app.post("/api/clear", (req, res) => {
  const result = orders.remove({});
  if (!result.writeError) {
    res.status(200).end();
  } else {
    res.status(400).send({error: result.writeError.errmsg}).end();
  }
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db(dbName);
  dbo.createCollection("orders", function(err, res) {
    if (err) throw err;
    orders = res;
    console.log(`Listening on ${PORT}...`);
    app.listen(PORT);
  });
});

/**** Helper functions ******/
async function parseAction(payload) {
  const user = payload.user;
  const action = payload.actions[0];
  const order = await lookupOrCreateOrder(user);

  let text;
  // In case it was complete before, any action will cause it to be uncompleted
  order.complete = false;
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
      text = validateOrder(order);
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
function lookupOrCreateOrder(user) {
  return new Promise((resolve, reject) => {
    orders.findOne({ name: user.username }, function(err, result) {
      if (err) reject(error);

      if (result) {
        resolve(result);
      } else {
        // Create a new order with the given timestamp and user
        const date = new Date();
        const order = {
          name: user.username,
          user_id: user.id,
          time: date.toLocaleString()
        };

        // Insert the new order and return it
        orders.insertOne(order, function(err, res) {
          if (err) reject(err);
          console.log("new order created");
          resolve(order);
        });
      }
    });
  });
}

// Update order in mongodb
function updateOrder(order) {
  return new Promise((resolve, reject) => {
    var query = { name: order.name };
    var values = { $set: {...order}};
    orders.updateOne(query, values, function(err) {
      if (err) reject(err);
      console.log("order updated");
      resolve(true);
    });
  });
}

// Form return values are Type:Size:Price eg (Boneless:DC-3:6.99)
function parseSize(action) {
  const values = action.selected_option.value.split(":");
  return {
    type: values[0],
    size: values[1],
    price: parseFloat(values[2])
  };
}

function parseSelect(action) {
  return action.selected_option.value;
}

function parseMultiselect(action) {
  return action.selected_options.map(option => option.value);
}

function validateOrder(order) {
  if (!order || !order.type || !order.price || 
    !order.size || !order.sauces || !order.dressing) {
    return `:x: Please fill in required fields: Order, sauces, and dressing.`;
  }

  if ((order.size === "DC-3" || order.size === "Paper Airplane") && order.sauces.length > 1) {
    return `:x: With ${order.size} you are only allowed to have 1 sauce.`;
  } else if ((order.size === "DC-10" || order.size === "Puddle Jumper") && order.sauces.length > 2) {
    return `:x: With ${order.size} you are only allowed to have up to 2 sauces.`;
  } else if ((order.size === "F-16" || order.size === "Skymaster") && order.sauces.length > 3) {
    return `:x: With ${order.size} you are only allowed to have up to 3 sauces.`;
  } else if ((order.size === "B-1 Bomber" || order.size === "Stratocruiser") && order.sauces.length > 4) {
    return `:x: With ${order.size} you are only allowed to have up to 4 sauces.`;
  }

  if (order.completed_before) {
    text = `:white_check_mark: Order successfully updated!`;
    order.complete = true;
  } else {
    text = `:white_check_mark: Order successfully placed! If you change your mind you can order again to update your current order.`;
    order.complete = true;
    order.completed_before = true;
  }

  return text;
}

function sendMessage(responseURL, text) {
  var postOptions = {
    uri: responseURL,
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    json: {
      text,
      replace_original: false,
      response_type: "ephemeral"
    }
  };
  request(postOptions, (error) => {
    if (error) {
      console.log(`error sending validation message: ${error}`);
    }
  });
}
