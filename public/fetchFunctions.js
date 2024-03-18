window.getVehicles = function(){
    fetch('/vehicles')
    .then(response => response.text())
    .then(data => {
        // document.getElementById("vehicles").innerHTML = data;
        jsonData = JSON.parse(data);
        var vehiclesContainer = document.getElementById("vehiclesList");
        jsonData.vehicleList.forEach(function(vehicle){
            var vehicleDiv = document.createElement("div");
            vehicleDiv.classList.add("vehicleCard");
            vehicleDiv.innerHTML = `
                <img src="${vehicle.media.image.url}" alt="${vehicle.naming.make} ${vehicle.naming.model}">
                <div>
                    <h2>${vehicle.naming.make} ${vehicle.naming.model} ${vehicle.naming.version || ''}</h2>
                    <p>Seats: ${vehicle.body.seats}</p>
                    <p>Usable Battery: ${vehicle.battery.usable_kwh} kWh</p>
                    <p>Chargetrip Range: ${vehicle.range.chargetrip_range.best} - ${vehicle.range.chargetrip_range.worst} miles</p>
                    <p>Fast Charging Support: ${vehicle.routing.fast_charging_support ? 'Yes' : 'No'}</p>
                </div>
            `;
            vehicleDiv.addEventListener('click', function(){
                selectedChargeTripRange = (vehicle.range.chargetrip_range.best + vehicle.range.chargetrip_range.worst) / 2; 
                console.log(selectedChargeTripRange);
                resetSelection();
                vehicleDiv.style.backgroundColor = "#82b08f";
            });
            vehiclesContainer.appendChild(vehicleDiv);
        })
    })
    .catch(error => {
        console.log(error);
    });
}

window.getBornes = function(latlngs, selectedChargeTripRange){
    fetch('/bornesData')
    .then(response => response.text())
    .then(data =>{
        console.log(data);

        return fetch("/findChargingStations");
    })
    .then(response => response.text())
    .then(data => {
        jsonData = JSON.parse(data);
        console.log(jsonData);
        console.log(latlngs);
        console.log(selectedChargeTripRange);
        chargingStations = findChargingStations(latlngs, selectedChargeTripRange, jsonData);
        console.log(chargingStations);
    })
    .catch(error => {
        console.error("Error fetching charging stations: ", error);
    });
    
}

window.getCoords = function(){
    const pos = document.getElementById("start").value.toString();

    const url = '/coordinates/'+pos+'/';

    fetch(url)
    .then(response => response.text())
    .then(data => {
        jsonData = JSON.parse(data);
        const coordinates = jsonData.features[0].geometry.coordinates;
        const latitude = coordinates[1];
        const longitude = coordinates[0];

        document.getElementById("coordsD").innerHTML = "Latitude : " + latitude.toString() + " Longitude : " + longitude.toString();

        latD = latitude;
        longD = longitude;
    })
    .catch(error => {
        console.log(error);
    });

    const arr = document.getElementById("end").value.toString();

    const url2 = '/coordinates/'+arr+'/';

    fetch(url2)
    .then(response => response.text())
    .then(data => {
        // console.log(data);
        jsonData = JSON.parse(data);
        const coordinates = jsonData.features[0].geometry.coordinates;
        const latitude = coordinates[1];
        const longitude = coordinates[0];

        document.getElementById("coordsA").innerHTML = "Latitude : " + latitude.toString() + " Longitude : " + longitude.toString();

        latA = latitude;
        longA = longitude;
    })
    .catch(error => {
        console.log(error);
    });
}

