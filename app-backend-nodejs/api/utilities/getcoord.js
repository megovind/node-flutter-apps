const geoLib = require("geolib");

const findThePreciseDistance = (point, centerPoint, range) => {
    console.log("gotinn");

    let data = point; //JSON.parse(JSON.stringify(point));
    let result = data.map(fromLatLng => {
        let distance = geoLib.getPreciseDistance(
            { latitude: fromLatLng.location.lat, longitude: fromLatLng.location.lng },
            {
                latitude: centerPoint.location.lat,
                longitude: centerPoint.location.lng
            }
        );
        let conv = distance * 0.001;
        let res = Math.ceil(conv * 1000) / 1000;
        fromLatLng.distance = Math.round(res);

        if (res <= range) {
            return fromLatLng;
        }
    });

    return result;
};

exports.getCoordsInDistance = (point, centerPoint, radius, distance) => {
    console.log("getcoord");

    let filterData = point.filter(fromLatLng => {
        console.log(fromLatLng);

        return geoLib.isPointWithinRadius(
            { latitude: fromLatLng.location.lat, longitude: fromLatLng.location.lng },
            {
                latitude: centerPoint.location.lat,
                longitude: centerPoint.location.lng
            },
            radius
        );
    });
    return findThePreciseDistance(filterData, centerPoint, distance);
};
