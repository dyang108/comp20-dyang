var loc;
var login = "ABEL_RIVERA";
var map;
var infowindow = new google.maps.InfoWindow();
var closest = null;
var customMapType = new google.maps.StyledMapType([
    {
        stylers: [
            {hue: '#C4EE8B'},
            {visibility: 'simplified'},
            {gamma: 0.5},
            {weight: 0.5}
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            {visibility: 'off'}
        ]
    },
    {
        featureType: 'water',
        stylers: [
            {color: '#5fade7'}
        ]
    }
]);

var my_marker = {
    url: "my_marker.png",
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(12, 12),
    scaledSize: new google.maps.Size(24, 24)
};

var person_image = {
    url: "person_icon.png",
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(12, 12),
    scaledSize: new google.maps.Size(24, 24)
};

var landmark_image = {
    url: "landmark.png",
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(12, 12),
    scaledSize: new google.maps.Size(24, 24)
};

function loadmap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            loc = {
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
            };
            
            map = new google.maps.Map(document.getElementById("map"), {
                center: loc,
                mapTypeControl: false,
                streetViewControl: false,
                zoom: 15
            });
            
            map.mapTypes.set('map_style', customMapType);
            map.setMapTypeId('map_style');

            var marker = new google.maps.Marker({
                position: loc,
                map: map,
                icon: my_marker,
                title: login
            });

            makeRequest();
            google.maps.event.addListener(marker, 'click', openMyInfo);
            infowindow.setContent("<p class='marker_title'>It's me, " + 
                marker.title + "! I just logged in!</p>");
            infowindow.open(map, marker);
        });
    } else {
        alert("Your browser does not support geolocation");
    }

}

function makeRequest() {
    var request = new XMLHttpRequest();
    var data;
    var params;
    params = "login=" + login + "&lat=" + loc.lat + "&lng=" + loc.lng;

    request.open("POST", 
        "https://ancient-hollows-75857.herokuapp.com/sendLocation", true);
    request.setRequestHeader("Content-type", 
        "application/x-www-form-urlencoded");

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            data = JSON.parse(request.responseText);
            if (data.error) {
                /* error on return */
            } else {
                parseResponse(data);
            }

        }
    };

    request.send(params);
}

function parseResponse(data) {
    var person, person_marker, landmark, landmark_marker, dist; 

    for (var i = 0; i < data.people.length; i++) {
        person = data.people[i];
        if (person.login === login) {
            continue;
        }

        person_marker = new google.maps.Marker({
            position: { lat: person.lat, lng: person.lng },
            map: map,
            icon: person_image,
            title: person.login
        });
        google.maps.event.addListener(person_marker, 'click', openPersonInfo);
    }
    for (var j = 0; j < data.landmarks.length; j++) {
        landmark = data.landmarks[j];

        dist = calcDist({ 
            lat: landmark.geometry.coordinates[1],
            lng: landmark.geometry.coordinates[0]
        });
        if (dist > 1) {
            continue;
        }
        landmark_marker = new google.maps.Marker({
            position: { lat: landmark.geometry.coordinates[1], 
                        lng: landmark.geometry.coordinates[0] },
            map: map,
            icon: landmark_image,
            title: landmark.properties.Location_Name,
            details: landmark.properties.Details
        });
        google.maps.event.addListener(landmark_marker, 'click', 
            openLandmarkInfo);

        if (closest === null || dist < closest.dist) {
            closest = { 
                dist: dist, 
                title: landmark_marker.title, 
                coords: {
                    lat: landmark_marker.getPosition().lat(), 
                    lng: landmark_marker.getPosition().lng()
                }
            };
        }
    }
}

function openPersonInfo() {
    infowindow.setContent("<p class='marker_title'>" + this.title + 
        "</p><p class='distance'>is " + calcDist({
            lat: this.getPosition().lat(), 
            lng: this.getPosition().lng()
        }).toFixed(4) + " miles away.</p>");
    infowindow.open(map, this);
}

function openMyInfo() {
    var contentstring = "<p class='marker_title'>It's me, " + this.title + 
        "!</p>";
    if (closest !== null) {
        contentstring = contentstring + "<p>The nearest landmark is " +
        closest.title + ", <br>which is " + closest.dist.toFixed(4) + 
        " miles away.</p>";
    } else {
        contentstring = contentstring + "<p>There are no landmarks within one mile of your location</p>";
    }
    
    infowindow.setContent(contentstring);
    infowindow.open(map, this);

    var pathtolandmark = [
        loc, closest.coords
    ];

    var path = new google.maps.Polyline({
        path: pathtolandmark,
        geodesic: true,
        strokeColor: '#EE8BC4',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    path.setMap(map);
}

function openLandmarkInfo() {
    infowindow.setContent(this.details);
    infowindow.open(map, this);
}

function calcDist(pos) {
    var R = 3959; // miles
    var firstlat = toRad(loc.lat);
    var secondlat = toRad(pos.lat);
    var latdiff = toRad(pos.lat - loc.lat);
    var lngdiff = toRad(pos.lng - loc.lng);
    var a = Math.sin(latdiff / 2) * Math.sin(latdiff / 2) +
            Math.cos(firstlat) * Math.cos(secondlat) *
            Math.sin(lngdiff / 2) * Math.sin(lngdiff / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c);
}

function toRad(num) {
    return num * Math.PI / 180;
}