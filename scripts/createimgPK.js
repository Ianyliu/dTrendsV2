define([
    './globeObject',
    './imgPKobject',
    './jquery-csv-1.0.11'
    // ,'./initPL'
], function (newGlobe, imagePK) {
    "use strict";

    let aLayer;
    let pLayer;

    function createimgPK(date, type, flag, countries, continents) {

        let csvdata = loadCSVData();

        // generatePlacemarkLayer(csvdata);

        //create agrosphere placemark
        let dataTypes = ['Country', 'Weather Station'];

        // //Common features
        // let pinLibrary = WorldWind.configuration.baseUrl +
        //     "images/pushpins/",
        //     placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
        //     highlightAttributes;
        // placemarkAttributes.imageScale = 1;
        // placemarkAttributes.imageOffset = new WorldWind.Offset(
        //     WorldWind.OFFSET_FRACTION, 0.3,
        //     WorldWind.OFFSET_FRACTION, 0.0);
        // placemarkAttributes.imageColor = WorldWind.Color.WHITE;
        // placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
        //     WorldWind.OFFSET_FRACTION, 0.5,
        //     WorldWind.OFFSET_FRACTION, 1.0);
        // placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;
        // placemarkAttributes.drawLeaderLine = true;
        // placemarkAttributes.leaderLineAttributes.outlineColor =
        //     WorldWind.Color.RED;

        // Define the images we'll use for the placemarks.
        // let images = [
        //     "plain-black.png", "plain-blue.png", "plain-brown.png",
        //     "plain-gray.png", "plain-green.png", "plain-orange.png",
        //     "plain-purple.png", "plain-red.png", "plain-teal.png",
        //     "plain-white.png", "plain-yellow.png", "castshadow-black.png",
        //     "castshadow-blue.png", "castshadow-brown.png",
        //     "castshadow-gray.png",
        //     "castshadow-green.png", "castshadow-orange.png",
        //     "castshadow-purple.png", "castshadow-red.png",
        //     "castshadow-teal.png", "castshadow-white.png"
        // ];

        for (let i = 0; i < dataTypes.length; i++) {
            // let placemarkLayer = new WorldWind.RenderableLayer(dataTypes[i] +
            //     " Placemarks");
            //Create the pins

            for (let j = 0; j < csvdata[i].length; j++) {
                // Create the placemark and its label.
                // let placemark = new WorldWind.Placemark(new WorldWind.Position(parseFloat(csvData[i][j].lat),
                //     parseFloat(csvData[i][j].lon), 1e2), true, null);
                //create placemark layer
                if (j === 0) {
                    aLayer = new WorldWind.RenderableLayer(dataTypes[i]);
                    aLayer.enabled = true;
                    // newGlobe.redraw();
                }
                // aLayer.layerType = 'H_PKLayer';

                let lat = parseFloat(csvdata[i][j].lat);
                let lon = parseFloat(csvdata[i][j].lon)
                let labelString = '';
                let imgsource = "";
                let userobject;

                let type = dataTypes[i];

                //Handle the string is based on the type we determine
                if (type === 'Country') {
                    labelString = csvdata[i][j].country + ' - ' +
                        csvdata[i][j].code3;
                    imgsource = '/flags/' + csvdata[i][j].iconCode + '.png';
                    userobject = {
                        code3: csvdata[i][j].code3,
                        country: csvdata[i][j].country
                    };
                } else if (type === 'Weather Station') {
                    let stationName = parseFloat(csvdata[i][j].station)
                    labelString = csvdata[i][j].code3;
                    imgsource = '/images/sun.png';

                }
                // console.log(imgsource);
                let agroPK = new imagePK(lat, lon, type, labelString, imgsource)
                agroPK.enabled = true;

                aLayer.addRenderable(agroPK);

                if (j === csvdata[i].length-1){
                    newGlobe.addLayer(aLayer);
                    newGlobe.redraw();
                }


                // newGlobe.redraw();
                // newGlobe.addLayer(agroPK);
                // agroPK.enabled = true;
                // //
                // // placemark.label = labelString;
                // // placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                //
                // // Create the placemark attributes for this placemark.
                // //the attributes differ only by their image URL.
                // // placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                // placemarkAttributes.imageSource =
                //     pinLibrary + images[9 - 2 * i];
                // //Use flag if it is a country
                // if (dataTypes[i] == 'Country') {
                //     //Image would be a flag
                //     placemarkAttributes.imageSource = './flags/' +
                //         csvData[i][j].iconCode + '.png';
                //     placemark.userObject = {
                //         code3: csvData[i][j].code3,
                //         country: csvData[i][j].country
                //     };
                // } else if (dataTypes[i] == 'Weather Station') {
                //     placemarkAttributes.imageSource =
                //         'images/sun.png';
                // }

                // placemark.attributes = placemarkAttributes;
                //
                // // Create the highlight attributes for this placemark.
                // //Note that the normal attributes are specified as
                // // the default highlight attributes so all properties are
                // //identical except the image scale. You could
                // // vary the color, image, or other property to control
                // //the highlight representation.
                // highlightAttributes = new
                // WorldWind.PlacemarkAttributes(placemarkAttributes);
                // highlightAttributes.imageScale = 3;
                // placemark.highlightAttributes = highlightAttributes;
                //
                // //Attach the type to it
                // placemark.type = dataTypes[i];
                // //Make it so the labels are visible from 10e6
                // placemark.eyeDistanceScalingLabelThreshold = 10e6;
                // placemark.eyeDistanceScalingThreshold = 5e6;
                //
                // // Add the placemark to the layer.
                // placemarkLayer.addRenderable(placemark);
                // console.log(agroplacemark)
            }
            //Before adding to the layer, attach a type to it
            // placemarkLayer.type = dataTypes[i];

            // Add the placemarks layer to the World Window's layer list.
            // wwd.addLayer(placemarkLayer);


        }


    }

    function sizePK(num) {
        let magnitude = 0;
        if (num > 0 && num <= 5) {
            magnitude = 0.05;
        } else if (num > 5 && num <= 25) {
            magnitude = 0.07;
        } else if (num > 25 && num <= 75) {
            magnitude = 0.13;
        } else if (num > 75 && num <= 150) {
            magnitude = 0.17;
        } else if (num > 150 && num <= 250) {
            magnitude = 0.22;
        } else if (num > 250 && num <= 350) {
            magnitude = 0.25;
        } else if (num > 350 && num <= 600) {
            magnitude = 0.28;
        } else if (num > 600 && num <= 1100) {
            magnitude = 0.3;
        } else if (num > 1100 && num <= 2500) {
            magnitude = 0.40;
        } else if (num > 2500 && num <= 7500) {
            magnitude = 0.45;
        } else if (num > 7500 && num <= 11000) {
            magnitude = 0.5;
        } else if (num > 11000) {
            magnitude = 0.6;
        }

        return magnitude
    }

    function deletePK() {
        for (let i = 6; i < newGlobe.layers.length - 1; i++) {
            newGlobe.removeLayer(newGlobe.layers[i]);
        }
    }

    function loadCSVData() {
        let csvList = ['csvdata/countries.csv',
            'csvdata/weatherstations.csv'
        ];
        //Find the file
        let csvString = "";

        let csvData = [];
        let i = 0;
        for (i = 0; i < csvList.length; i++) {
            let csvRequest = $.ajax({
                async: false,
                url: csvList[i],
                success: function (file_content) {
                    csvString = file_content;
                    csvData.push($.csv.toObjects(csvString));
                    // console.log($.csv.toObjects(csvString))
                }
            });
        }
        return csvData;
    }

    //Generates the placemark layers
    //The types are predetermined in order
    //This assumes the CSV data is loaded in order too obviously
    //Assumption is dataType 1 maps to csvData 1
    function generatePlacemarkLayer(csvData) {
        //Data type list
        let dataTypes = ['Country', 'Weather Station'];

        // //Common features
        // let pinLibrary = WorldWind.configuration.baseUrl +
        //     "images/pushpins/",
        //     placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
        //     highlightAttributes;
        // placemarkAttributes.imageScale = 1;
        // placemarkAttributes.imageOffset = new WorldWind.Offset(
        //     WorldWind.OFFSET_FRACTION, 0.3,
        //     WorldWind.OFFSET_FRACTION, 0.0);
        // placemarkAttributes.imageColor = WorldWind.Color.WHITE;
        // placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
        //     WorldWind.OFFSET_FRACTION, 0.5,
        //     WorldWind.OFFSET_FRACTION, 1.0);
        // placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;
        // placemarkAttributes.drawLeaderLine = true;
        // placemarkAttributes.leaderLineAttributes.outlineColor =
        //     WorldWind.Color.RED;

        // Define the images we'll use for the placemarks.
        // let images = [
        //     "plain-black.png", "plain-blue.png", "plain-brown.png",
        //     "plain-gray.png", "plain-green.png", "plain-orange.png",
        //     "plain-purple.png", "plain-red.png", "plain-teal.png",
        //     "plain-white.png", "plain-yellow.png", "castshadow-black.png",
        //     "castshadow-blue.png", "castshadow-brown.png",
        //     "castshadow-gray.png",
        //     "castshadow-green.png", "castshadow-orange.png",
        //     "castshadow-purple.png", "castshadow-red.png",
        //     "castshadow-teal.png", "castshadow-white.png"
        // ];

        let i = 0;
        for (i = 0; i < dataTypes.length; i++) {
            // let placemarkLayer = new WorldWind.RenderableLayer(dataTypes[i] +
            //     " Placemarks");
            //Create the pins
            let j = 0;
            for (j = 0; j < csvData[i].length; j++) {
                // Create the placemark and its label.
                // let placemark = new WorldWind.Placemark(new WorldWind.Position(parseFloat(csvData[i][j].lat),
                //     parseFloat(csvData[i][j].lon), 1e2), true, null);
                let lat = parseFloat(csvData[i][j].lat);
                let lon = parseFloat(csvData[i][j].lon)
                let labelString = '';
                let imgsource = "";
                let userobject;

                let type = dataTypes[i];

                //Handle the string is based on the type we determine
                if (type == 'Country') {
                    labelString = csvData[i][j].country + ' - ' +
                        csvData[i][j].code3;
                    imgsource = '/flags/' + csvData[i][j].iconCode + '.png';
                    userobject = {
                        code3: csvData[i][j].code3,
                        country: csvData[i][j].country
                    };
                } else if (type == 'Weather Station') {
                    labelString = csvData[i][j].code3;
                    imgsource = '/images/sun.png';

                }
                console.log('Placemark Info')
                console.log(lat)
                console.log(lon)
                console.log(imgsource)
                console.log((labelString))

                let agroPK = new imagePK(lat, lon, type, labelString, imgsource)
                newGlobe.addLayer(agroPK);
                newGlobe.redraw();
                // //
                // // placemark.label = labelString;
                // // placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                //
                // // Create the placemark attributes for this placemark.
                // //the attributes differ only by their image URL.
                // // placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                // placemarkAttributes.imageSource =
                //     pinLibrary + images[9 - 2 * i];
                // //Use flag if it is a country
                // if (dataTypes[i] == 'Country') {
                //     //Image would be a flag
                //     placemarkAttributes.imageSource = './flags/' +
                //         csvData[i][j].iconCode + '.png';
                //     placemark.userObject = {
                //         code3: csvData[i][j].code3,
                //         country: csvData[i][j].country
                //     };
                // } else if (dataTypes[i] == 'Weather Station') {
                //     placemarkAttributes.imageSource =
                //         'images/sun.png';
                // }

                // placemark.attributes = placemarkAttributes;
                //
                // // Create the highlight attributes for this placemark.
                // //Note that the normal attributes are specified as
                // // the default highlight attributes so all properties are
                // //identical except the image scale. You could
                // // vary the color, image, or other property to control
                // //the highlight representation.
                // highlightAttributes = new
                // WorldWind.PlacemarkAttributes(placemarkAttributes);
                // highlightAttributes.imageScale = 3;
                // placemark.highlightAttributes = highlightAttributes;
                //
                // //Attach the type to it
                // placemark.type = dataTypes[i];
                // //Make it so the labels are visible from 10e6
                // placemark.eyeDistanceScalingLabelThreshold = 10e6;
                // placemark.eyeDistanceScalingThreshold = 5e6;
                //
                // // Add the placemark to the layer.
                // placemarkLayer.addRenderable(placemark);
                // console.log(agroplacemark)
            }
            //Before adding to the layer, attach a type to it
            // placemarkLayer.type = dataTypes[i];

            // Add the placemarks layer to the World Window's layer list.
            // wwd.addLayer(placemarkLayer);


        }

    }

    return createimgPK;
});

