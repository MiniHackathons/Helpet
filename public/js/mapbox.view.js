var MapboxView = (function(opts){
    "use strict";
    const accessToken = opts.token;
    mapboxgl.accessToken = accessToken;
    
    const map = new mapboxgl.Map({
        container: opts.el,
        style: "mapbox://styles/mapbox/streets-v9",
        center: [-70.221799, -18.0031498],
        zoom: 15
    });

    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    map.addControl(new mapboxgl.NavigationControl());
    
    let marker;
    let currentMarkers = [];

    const app = {
        getMap(){
            return map;
        },
        initAddMarkerEvent(){
            map.on("click",(e) => {
                if(marker) marker.remove();
                let el = document.createElement("div");
                el.className = "marker marker--encontrado" ;
                el.style.width =  "48px";
                el.style.height = "48px";
        
                let coordinates = [e.lngLat.lng, e.lngLat.lat];

                marker = new mapboxgl.Marker(el, {
                        offset: [-48 / 2, -48 / 2]
                    })
                    .setLngLat(coordinates)
                    .addTo(map);
            });
        },
        fetchPostTypeMap(type = 0){
            this.removeAllMarkers();
            fetch(`/mapa/json?type=${type}`)
                .then( res => res.json())
                .then( posts => {    
                    let pointsFound = [],
                        pointFound = {};
                    for(let i = 0, post; post = posts[i]; i++) {
                        pointFound = {
                            type: post.type,
                            id: post._id,
                            photo: post.photo,
                            latitude: post.latitude,
                            longitude: post.longitude,
                            properties: {
                                iconSize: [48, 48]
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [post.longitude, post.latitude]
                            }
                        }
                        pointsFound.push(pointFound);
                    }
                    return pointsFound;
                }).then((points)=> points.forEach( point => this.createNewMarker(point)))
        },
        genLayoutMarker(data){

            let el = document.createElement("div");
            el.className = (data.type == 1) ? "marker marker--encontrado" : "marker marker--perdido";
            if(data.photo) el.style.backgroundImage = `url(${data.photo})`;
            el.style.width = data.properties.iconSize[0]? (data.properties.iconSize[0]+ 'px'):'48px';
            el.style.height = data.properties.iconSize[1]? (data.properties.iconSize[1]+ 'px'):'48px';
    
            if(data.id) {
                el.addEventListener("click", function() {
                    location.hash = "#"+data.id;
                });
            }
            return el;
        },
        createNewMarker(data){
            let type = data.type,
                id = data.id,
                photo = data.photo,
                latitude = data.latitude || data.lat,
                longitude = data.longitude || data.lng;
            // Create a new marker in Mapbox instance
            let marker = new mapboxgl.Marker(this.genLayoutMarker(data), {
                    offset: [-data.properties.iconSize[0] / 2, -data.properties.iconSize[1] / 2]
                })
                .setLngLat(data.geometry.coordinates)
                .addTo(map);
            currentMarkers.push(marker);
        },
        removeAllMarkers() {
            currentMarkers.forEach((marker) => {
                marker.remove();
            });
        },
        clearMap(){
            map.remove();
        },
        searchLocation(address){
            fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + address)
                .then((res) => res.json())
                .then((res) => {
                    let coordinates = [res.results[0].geometry.location.lng,res.results[0].geometry.location.lat]
                })
                .then(this.createNewMarker)
        },
        getCurrentMarker(){
            return marker;
        }
    }
    return app;
});