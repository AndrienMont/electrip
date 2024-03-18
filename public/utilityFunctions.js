window.reverseCoords = function(tab){
    var newTab = [];
    for (var i = 0; i < tab.length; i++){
        newTab.push([tab[i][1], tab[i][0]]);
    }
    return newTab;
}

window.getDistance = function(lat1, lon1, lat2, lon2){
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}