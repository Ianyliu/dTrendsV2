requirejs([
    './globeObject'
    , './imgPKobject'
    ,'./csvData'
    ,'./jquery-csv-1.0.11'
], function (newGlobe, imagePK,csvData) {
    "use strict";

    // load csv data
    let csvFiles = [
        '../csvdata/countries.csv',
        '../csvdata/weatherstations.csv'
    ];

    //Data type list
    let dataTypes = ['Country', 'Weather Station'];

    genPLPK(dataTypes, csvData);

    console.log(csvData)

    function genPLPK(layerType, csvData) {
        // create placemark layer for AgroSphere
        for (let i = 0; i < layerType.length; i++) {
            let aLayer = new WorldWind.RenderableLayer(layerType[i] + " PK");
            aLayer.enabled = true;
            // console.log(aLayer);

            // Create the placemark and its label.
            for (let j = 0; j < csvData[i].length; j++) {
                let lat = parseFloat(csvData[i][j].lat);
                let lon = parseFloat(csvData[i][j].lon);
                let labelString = '';
                let imgsource = "";
                let userobject;
                let stationName;
                let country;

                //Handle the string is based on the type we determine
                if (layerType[i] === 'Country') {
                    // labelString = csvData[i][j].country + ' - ' + csvData[i][j].code3;
                    imgsource = '/flags/' + csvData[i][j].iconCode + '.png';
                    aLayer.layerType = 'Country_Placemarks';
                    userobject = {
                        code3: csvData[i][j].code3,
                        country: csvData[i][j].country
                    };
                    country = csvData[i][j].country;
                    //console.log(country)
                    //console.log(csvData[i][j].code3)
                } else if (layerType[i] === 'Weather Station') {
                    // labelString = csvData[i][j].code3;
                    aLayer.layerType = 'Weather_Station_Placemarks'
                    imgsource = '/images/sun.png';
                    userobject = {
                        code3: csvData[i][j].code3,
                        country: csvData[i][j].stationName
                    };
                    stationName = csvData[i][j].stationName;
                    country = stationName.slice(0, 5);
                } else {
                    console.log("Read layer type in error");
                }

                // create AgroSphere placemark
                let agroPK = new imagePK(lat, lon, layerType[i], aLayer.layerType, imgsource)
                    agroPK.placemark.country = country;
                    agroPK.placemark.stationName = stationName;
                 //console.log(agroPK.placemark.country)
                //console.log(agroPK.placemark.stationName)
                // add AgroSphere placemark onto AgroSphere Placemark Layer.
                aLayer.addRenderable(agroPK.placemark);
                // Add the placemarks layer to the World Window's layer list.
                if (j === csvData[i].length - 1) {
                    newGlobe.addLayer(aLayer);
                    newGlobe.redraw();
                    // console.log(newGlobe.layers);
                }
            }
        }
    }
});