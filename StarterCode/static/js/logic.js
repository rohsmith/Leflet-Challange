//Using Leaflet we will grab our tile layers
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//tile layer 2
var grayscaleMap = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//tile layer 3
var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


let basemaps = {
    Default: defaultMap,
    Grayscale: grayscaleMap,
    Topography: topoMap

};

//Default location when running
var myMap = L.map ("map", {
    center: [33.614047,-43.102483],
    zoom: 3,
    layers: [defaultMap, grayscaleMap, topoMap]
});

defaultMap.addTo(myMap);


let tectonicPlates = new L.layerGroup();

let earthquakes = new L.layerGroup();

d3.json ("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(function(earthquakeData){
        //function to give color to data points
        function dataColor(depth){
            if (depth > 90)
                return "red";
            else if (depth > 70)
                return "#f74402";
            else if (depth > 50)
                return "#f76d02";
            else if (depth > 30)
                return "#f79e02";
            else if (depth > 10)
                return "#caf702";
            else 
                return "#69f702";
        }
    
        function radiusSize (mag){
            if (mag == 0)
                return 1;
            else
                return mag * 5;
        }

        function dataStyle (feature){
            return {
                opacity: 0.5,
                fillOpacity: 0.5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: "000000",
                radius: radiusSize(feature.properties.mag),
                weight: 0.5
            }
        }

        L.geoJson(earthquakeData,{
            pointToLayer: function (feature,latLng) {
                return L.circleMarker(latLng);
            },
            style: dataStyle,
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                    Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                    Location: <b>${feature.properties.place}</b></br>`);
            }
        }).addTo(earthquakes);

        earthquakes.addTo(myMap);
    });

//Use Json to read tectonic plate data
d3.json ("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    .then(function(plateData){
         L.geoJson(plateData,{
            color: "black",
            weight: 1
        }).addTo(tectonicPlates);
    });
    
tectonicPlates.addTo(myMap);

let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquake Data": earthquakes
}

//Create toggle with control
L.control
    .layers(basemaps,overlays)
    .addTo(myMap);

//add legend to the map
let legend = L.control({
    position: "bottomright"
});

legend.onAdd = function(){
    //div to let legened appear on page
    let div = L.DomUtil.create("div","info legend");

    let intervals = [-10, 10, 30, 50, 70, 90];

    let colors = [
        "#69f702",
        "#caf702",
        "#f79e02",
        "#f76d02",
        "#f74402",
        "red"
    ]

    for (var i = 0; i < intervals.length; i ++){
        div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i>"
        +intervals[i]
        +(intervals[i +1]? "km - " +intervals[i+1] + "km"+ "<br>":"+");
    }
    return div;
};

legend.addTo(myMap);
