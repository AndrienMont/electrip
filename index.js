var express = require('express');
var app = express();
var http = require('http').Server(app);
var soap = require('soap');
var https = require('https');
var axios = require('axios');
var fs = require('fs');
const { start } = require('repl');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

var tripTime = 0;

const url = 'http://127.0.0.1:8080/?wsdl';

function readJSONFromFile(filePath){
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }catch(error){
        console.error('Error reading JSON file: ',error.message);
        return null;
    }
}

app.get('/findChargingStations', function(req,res){
    const chargingStations = readJSONFromFile('bornes.json');

    res.status(200).send(chargingStations);
})

app.get('/tripTime', function(req, res){
    res.status(200).send(tripTime.toString());
});

app.get('/tripTime/:distance/:vitesse/:points', function(req, res){
    const dist = req.params.distance;
    const vit = req.params.vitesse;
    const poi = req.params.points;

    soap.createClient(url, function(err,client){
        if(err){
            console.error(err);
            res.status(500).send(err);
        }else{
            client.tripTime({distance: dist, vitesse: vit, points: poi}, function(err, result){
                if(err){
                    console.error(err);
                    res.status(500).send(err);
                }else{
                    tripTime = result.tripTimeResult;
                    console.log(tripTime);
                    res.status(200).send(tripTime.toString());
                }
            });
        }
    })

});



app.get('/bornesData', async(req,res) => {
    try {
        const url = "https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/bornes-irve/exports/json?lang=fr&timezone=Europe%2FBerlin";

        const response = await axios.get(url);

        fs.writeFileSync('bornes.json', JSON.stringify(response.data));

        res.send('JSON file downloaded successfully.');
    }catch(error){
        console.error('Error downloading JSON file: ',error.message);
        res.status(500).send("Error while fecthing the bornes list.")
    }
})

//use GeocodeAutocompleteService for coordinates
app.get('/coordinates/:address', function(req, res){
    const address = req.params.address;
    
    const options = {
        method: "GET",
        hostname: "api.openrouteservice.org",
        path: "/geocode/autocomplete?api_key=5b3ce3597851110001cf6248d3e9578fa3f8437bb98495a777283f1d&text="+address,
        headers: {
            "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
        }
    };

    const request = https.request(options, function(apiRes){
        let body = '';

        apiRes.on('data', (chunk) => {
            body += chunk;
        });

        apiRes.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Headers:', JSON.stringify(res.headers));
            console.log('Response:', body);
            res.status(200).send(body);
        });

    });

    request.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    request.end();
});

app.get('/route/:startLat/:startLong/:endLat/:endLong', function(req, res){
    const startLat = req.params.startLat;
    const startLong = req.params.startLong;
    const endLat = req.params.endLat;
    const endLong = req.params.endLong;

    const start = startLong+","+startLat;
    const end = endLong+","+endLat;

    const options = {
        method: "GET",
        hostname: "api.openrouteservice.org",
        path: "/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d3e9578fa3f8437bb98495a777283f1d&start="+start+"&end="+end,
        headers: {
            "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
        }
    };

    const request = https.request(options, function(apiRes){
        let body = '';

        apiRes.on('data', (chunk) => {
            body += chunk;
        });

        apiRes.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Headers:', JSON.stringify(res.headers));
            console.log('Response:', body);
            res.status(200).send(body);
        });

    });

    request.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    request.end();
});


app.get('/vehicles', async (req, res) => {
    const urlVehi = 'https://api.chargetrip.io/graphql';

    const graphQuery = `
    query {
        vehicleList (size : 20){
            naming {
                make
                model
                version
            },
            media {
                image {
                    url
                }
            },
            battery {
                usable_kwh
                full_kwh
            },
            adapters {
                standard
                power
                max_electric_power
                time
                speed
            },
            body {
                seats
            },
            range {
                chargetrip_range {
                    best
                    worst
                }
            },
            routing {
                fast_charging_support
            }
        }
    }
    `;

    const headers = {
        'x-client-id' : '65aa740d0117350bae37ac78',
        'x-app-id' : '65aa740d0117350bae37ac7a'
    };

    try {
        const response = await axios.post(urlVehi, {query : graphQuery}, {headers});

        const data = response.data.data;
        res.json(data);
    }catch(err){
        console.error(err);
        res.status(500).send("Error while fecthing the vehicles list.")
    }
});