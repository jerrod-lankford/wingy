const express = require('express');
const request = require('request')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const { ACTIONS } = require('../common/slack-blocks.js');

let orders = [];

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/slack', urlencodedParser, (req, res) =>{
    res.status(200).end();
    var actionJSONPayload = JSON.parse(req.body.payload);
    parseAction(actionJSONPayload);
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
    console.table(orders);
});

app.post('/api/clear', (req, res) => {
    orders = [];
    res.status(200).end();
});

console.log(`Listening on ${PORT}...`);
app.listen(PORT);

function parseAction(payload) {
    const user = payload.user;
    const action = payload.actions[0];
    const order = lookupOrCreateOrder(user);

    switch(action.action_id) {
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
            const text = validateOrder(order);
            sendMessage(payload.response_url, text);
            break;
        default:
            console.log(`Unknown action id ${action}`);
    }
}

function lookupOrCreateOrder(user) {
    let order = orders.find(o => o.name === user.username);
    if (order) {
        return order;
    }

    order = {name: user.username, user_id: user.id};
    orders.push(order);
    return order;
}

// Form return values are Type:Size:Price eg (Boneless:DC-3:6.99)
function parseSize(action) {
    const values = action.selected_option.value.split(':');
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

    if (!order || !order.type || !order.price || !order.size ||
        !order.sauces || !order.dressing) {
        return `:x: Please fill in required fields: Order, sauces, and dressing.`
    }

    if ((order.size === 'DC-3' || order.size === 'Paper Airplane') && order.sauces.length > 1) {
        return `:x: With ${order.size} you are only allowed to have 1 sauce.`;
    }

    
    let text;

    if (order.complete) {
        text = `:white_check_mark: Order successfully updated!`;
    } else {
        text = `:white_check_mark: Order successfully placed! If you change your mind you can order again to update your current order.`;
        order.complete = true;
    }

    return text;

}

function sendMessage(responseURL, text){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: {
            text,
            replace_original: false,
            response_type: "ephemeral"
        }
    }
    request(postOptions, (error, response, body) => {
        if (error){
            // TODO
        }
    })
}