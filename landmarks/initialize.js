var loc;
var map;
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
            stylers: [{visibility: 'off'}]
          },
          {
            featureType: 'water',
            stylers: [{color: '#5fade7'}]
          }
       ]);

window.onload = function init() {
    loadmap();
};

var image = {
    url: "curr_loc.png",
    // This marker is 20 pixels wide by 32 pixels high.
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
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
                zoom: 17
            });
            
            map.mapTypes.set('map_style', customMapType);
            map.setMapTypeId('map_style');

            var marker = new google.maps.Marker({
                position: loc,
                map: map,
                icon: image,
                title: "It's me!"
            });

            makeRequest();
        });
    } else {
        alert("Your browser does not support geolocation");
    }

}

function makeRequest() {
    var request = new XMLHttpRequest();
    var data;
    var params = loc;
    params.login = "joe";
    // params = JSON.stringify(params);

    request.open("POST", "https://defense-in-derpth.herokuapp.com/sendLocation", true);
    // request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");

    request.onreadystatechange = function () {
        console.log(request.readyState);
        if (request.readyState == 4 && request.status == 200) {
            data = request.responseText;
            if (data.error) {
                console.log(data);
            }
        }
    };
    request.send(params);
}
