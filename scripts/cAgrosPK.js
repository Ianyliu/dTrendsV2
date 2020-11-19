requirejs([
    './globeObject'
    , './imgPKobject'
    ,'./csvData'
    ,'./jquery-csv-1.0.11'
], function (newGlobe, imagePK,csvData) {
    "use strict";

    let aLayer;

    //Data type list
    let dataTypes = ['Country', 'Weather Station'];

    dataTypes.forEach(async function (el, index){
        await genPLPK(el, index, csvData);

        if (index == dataTypes.length - 1) {
            newGlobe.redraw();
        }
    })

   function genPLPK(dType, i, csvData) {
        // create placemark layer for AgroSphere
       aLayer = new WorldWind.RenderableLayer(dType + " PK");
       aLayer.enabled = true;

       let apkArr = [];
        // Create the placemark and its label.
       csvData[i].forEach(function (e, j) {
           let lat = parseFloat(e.lat);
           let lon = parseFloat(e.lon);
           let imgSource = "";

           //Handle the string is based on the type we determine
           if (dType == 'Country') {
               aLayer.layerType = 'Country_Placemarks';
               imgSource = '/flags/' + e.iconCode + '.png';
           } else if (dType == 'Weather Station') {
               aLayer.layerType = 'Weather_Station_Placemarks';
               imgSource = '/images/sun.png';
           } else {
               console.log("Read layer type in error");
           }

           // create AgroSphere placemark
           let agroPK = new imagePK(lat, lon, imgSource);
           agroPK.pk.userProperties.country = e.country;
           agroPK.pk.userProperties.stationName = e.stationName;

           apkArr.push(agroPK.pk);
           if (j == csvData[i].length - 1) {
               // add AgroSphere placemark onto AgroSphere Placemark Layer.
               newGlobe.redraw();
               aLayer.addRenderables(apkArr);
               newGlobe.addLayer(aLayer);
           }
       })
    }
});