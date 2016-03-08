// Your JavaScript goes here...
function parse() {
    var request = new XMLHttpRequest();
    var messages = document.getElementById("messages");
    var data;
    request.open("GET", "data.json", true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            data = JSON.parse(request.responseText);
            for (var i = 0; i < data.length; i++) {
                var newmessage = document.createElement("p");
                var sender = document.createElement("p");
                newmessage.setAttribute("class", "msg");
                sender.setAttribute("class", "sender");
                newmessage.innerHTML = data[i].content;
                sender.innerHTML = data[i].username;
                messages.appendChild(newmessage);
                messages.appendChild(sender);
            }
        }
    };
    request.send(null);
}