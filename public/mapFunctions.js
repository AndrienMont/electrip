window.drawRoad = function(){
    const url = '/route/'+latD+'/'+longD+'/'+latA+'/'+longA+'/';

    var latlngs = [];

    fetch(url)
    .then(response => response.text())
    .then(data => {
        // console.log(data);
        jsonData = JSON.parse(data);
        latlngs = jsonData.features[0].geometry.coordinates;
        latlngs = reverseCoords(latlngs);
        dist = jsonData.features[0].properties.summary.distance / 1000;
        timeETA = jsonData.features[0].properties.summary.duration / 3600;
        spd = dist / timeETA;
        document.getElementById("vitesse").innerHTML = "Avergae speed : " + spd.toFixed(2) + " km/h";
        document.getElementById("distance").innerHTML = "Distance : " + dist.toFixed(2) + " km";
        var polyline = L.polyline(latlngs, {color : 'red'}).addTo(map);
        L.marker(latlngs[0]).addTo(map).bindPopup('Start');
        L.marker(latlngs[latlngs.length-1]).addTo(map).bindPopup('End');
        map.fitBounds(polyline.getBounds());
        return latlngs;
    })
    .catch(error => {
        console.log(error);
    });
}

window.findChargingStations = function(road, autonomy, chargingStations) {
    const result = [];

    console.log(road);

    for (const point of road) {
        for (const station of chargingStations) {
            if (!station.geo_point_borne) {
                continue;
            }
            console.log(point[0], point[1], station.geo_point_borne.lat, station.geo_point_borne.lon);
            const distance = getDistance(point[0], point[1], station.geo_point_borne.lat, station.geo_point_borne.lon);
            if (distance <= autonomy) {
                result.push(station);
                break;
            }
        }
    }

    return result;
}

window.projectPointOnSegment = function(point, segmentStart, segmentEnd) {
    const [px, py] = point;
    const [x1, y1] = segmentStart;
    const [x2, y2] = segmentEnd;

    const segmentVector = [x2 - x1, y2 - y1];
    
    const pointVector = [px - x1, py - y1];
    
    const dotProduct = pointVector[0] * segmentVector[0] + pointVector[1] * segmentVector[1];

    const segmentLengthSquared = segmentVector[0] * segmentVector[0] + segmentVector[1] * segmentVector[1];

    let t;
    if (segmentLengthSquared !== 0) {
        t = dotProduct / segmentLengthSquared;
    } else {
        t = 0;
    }

    const projectedX = x1 + t * segmentVector[0];
    const projectedY = y1 + t * segmentVector[1];

    return [projectedX, projectedY];
}