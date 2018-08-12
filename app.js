/**********************************************************************/
/*                              API Variables                         */
/**********************************************************************/
const express = require('express'),
    app = express();

const cors = require('cors');
const bodyParser = require('body-parser');

const hue = require("node-hue-api"),
    api = new hue.HueApi("10.0.1.2", "YtKnrq-DFZzLelkUbUhHGcDCe0exek2WprxnqhE4"),
    lightState = hue.lightState,
    state = lightState.create();

// use it before all route definitions
app.use(cors({origin: 'http://localhost:4200' }));
// support json encoded bodies
app.use(bodyParser.json()); 


/**********************************************************************/
/*                              API Functions                         */
/**********************************************************************/
var getLightNameAndId = function(lightsJson) {
    var lightsArray = [];

    lightsJson.lights.forEach(light => {
        lightsArray.push({LightName: light.name,LightId: light.id});
    });

    return lightsArray;
};

var getLightGroupAndId = function(lightGroupJson) {
    var lightGroupArray = [];

    lightGroupJson.forEach(lightGroup => {
        console.log(lightGroup.id);
        if(lightGroup.id != "8"){
            console.log("Not 8, Push!");
            lightGroupArray.push({LightGroupName: lightGroup.name, LightGroupId: lightGroup.id});
        }
        else {
            console.log("Got 8, Don't Push!");
        }
    });

    return response;
};

/**********************************************************************/
/*                              API Routes                    `        */
/**********************************************************************/
app.route('/api/heartbeat').get((req, res) => {
    console.log("Heartbeat");
    res.send({response: "Got a Heartbeat!"});
});

app.route('/api/listLights').get((req, res) => {
    console.log("List Lights");
    api.lights(function(err, response) {
        if (err) res.send(err);
        try{
            res.send(response);
        }
        catch(exc) {
            res.send(err);
        }
    });
});

app.route('/api/toggleLight/:lightId').get((req, res) => {
    // Capture Light Id To Toggle
    var lightId = req.params.lightId;

    // Check Current Status Of Light
    api.lightStatus(lightId, function(err, result) {
        if (err) throw err;

        // If The Light Is On, Turn It Off
        if(result.state.on){
            api.setLightState(lightId, state.off(), function(err, result) {
                if (err) throw err;
                displayResult(result);
            });

            res.send(JSON.stringify({response: "Light Was On, Now It's Off!"}));
        } else {
            api.setLightState(lightId, state.on(), function(err, result) {
                if (err) throw err;
                displayResult(result);
            });

            res.send(JSON.stringify({response: "Light Group Was Off, Now It's On!"}));
        }
    });
});

app.route('/api/listLightGroups').get((req, res) => {
    console.log("List Light Groups");
    api.groups(function(err, response) {
        if (err) res.send(err);
        try{
            console.log(response);
            res.send(response);
        }
        catch(exc) {
            res.send(err);
        }
    });
});

app.route('/api/toggleLightGroup/:lightGroupId').get((req, res) => {
    // Capture Light Id To Toggle
    var lightGroupId = req.params.lightGroupId;

    // Check Current Status Of Light
    api.getGroup(lightGroupId, function(err, result) {
        if (err) throw err;
        
        // If The Light Is On, Turn It Off
        if(result.lastAction.on){
            api.setGroupLightState(lightGroupId, state.off(), function(err, result) {
                if (err) throw err;
            });

            res.send(JSON.stringify({response: "Light Group Was On, Now It's Off!"}));
        } else {
            api.setGroupLightState(lightGroupId, state.on(), function(err, result) {
                if (err) throw err;
            });

            res.send(JSON.stringify({response: "Light Group Was Off, Now It's On!"}));
        }
    });
});



/**********************************************************************/
/*                              API Config                            */
/**********************************************************************/
app.listen(8000, () => {
    console.log('Server started on port 8000!');
});