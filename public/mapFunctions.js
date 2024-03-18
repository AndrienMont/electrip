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
        document.getElementById("vitesse").value = spd;
        document.getElementById("distance").value = dist;
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

    // Iterate over each point of the road
    for (const point of road) {
        // Iterate over each charging station
        for (const station of chargingStations) {
            // Skip stations with missing location data
            if (!station.geo_point_borne) {
                continue;
            }

            // Calculate the distance between the current point and the charging station
            console.log(point[0], point[1], station.geo_point_borne.lat, station.geo_point_borne.lon);
            const distance = getDistance(point[0], point[1], station.geo_point_borne.lat, station.geo_point_borne.lon);

            // If the distance is within the autonomy range, add the charging station to the result
            if (distance <= autonomy) {
                result.push(station);
                // Break the loop to move to the next point on the road
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

    // Vector representing the line segment
    const segmentVector = [x2 - x1, y2 - y1];
    
    // Vector from the start point of the segment to the given point
    const pointVector = [px - x1, py - y1];
    
    // Calculate the dot product of the segment vector and the point vector
    const dotProduct = pointVector[0] * segmentVector[0] + pointVector[1] * segmentVector[1];

    // Calculate the length of the segment vector squared
    const segmentLengthSquared = segmentVector[0] * segmentVector[0] + segmentVector[1] * segmentVector[1];

    let t;
    // Avoid division by zero
    if (segmentLengthSquared !== 0) {
        // Calculate the parameter 't' which represents the projection of the point onto the segment
        t = dotProduct / segmentLengthSquared;
    } else {
        // If the segment has zero length, use t = 0
        t = 0;
    }

    // Calculate the coordinates of the projection point
    const projectedX = x1 + t * segmentVector[0];
    const projectedY = y1 + t * segmentVector[1];

    return [projectedX, projectedY];
}