document.addEventListener("onready",function() {
	const ws = new WebSocket(`ws://${location.host}`, "protocolOne");
	ws.onmessage = function(event) {
		var msg = JSON.parse(event.data);
		var notification = document.getElementById("notification").contentDocument;

		switch(msg.type){

			case "post":
				const marker = new google.maps.Marker({
					position: {
						latitude : msg.latitude,
						longitude : msg.longitude
					},
					map: map,
					title: "Se busca"
				});

				if (Notification.permission !== "granted")
					Notification.requestPermission();
				else {
					const notification = new Notification(msg.title, {
						icon: msg.photo,
						body: msg.description,
					});

					notification.onclick = function () {
						window.open("http://stackoverflow.com/a/13328397/1269037");      
					};
				}
				break;
		}
	}
});
