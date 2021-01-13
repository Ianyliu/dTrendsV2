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
       aLayer.enabled = false;

       let apkArr = [];
        // Create the placemark and its label.
       csvData[i].forEach(function (e, j) {
           let lat = parseFloat(e.lat);
           let lon = parseFloat(e.lon);
           let imgSource = "";

           //Handle the string is based on the type we determine
           if (dType === 'Country') {
               aLayer.layerType = 'Country_Placemarks';
               imgSource = 'images/flags/' + e.iconCode + '.png';
           } else if (dType === 'Weather Station') {
               aLayer.layerType = 'Weather_Station_Placemarks';
               imgSource = 'images/sun.png';
           } else {
               console.log("Read layer type in error");
           }

           // create AgroSphere placemark
           let agroPK = new imagePK(lat, lon, imgSource);
           if (e.country !== "undefined" && e.country !== undefined) {
               agroPK.pk.userProperties.country = e.country;
           } else if (e.stationName !== "undefined" && e.stationName !== undefined) {
               agroPK.pk.userProperties.country = e.stationName.charAt(0) + e.stationName.charAt(1);
               agroPK.pk.userProperties.stationName = e.stationName;
               console.log(agroPK.pk.userProperties.country)
               console.log(agroPK.pk.userProperties.stationName);
           }

           apkArr.push(agroPK.pk);

           if (j === csvData[i].length - 1) {
               // add AgroSphere placemark onto AgroSphere Placemark Layer.
               newGlobe.redraw();
               aLayer.addRenderables(apkArr);
               newGlobe.addLayer(aLayer);
           }
       })
    }
});