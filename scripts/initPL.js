requirejs([
    './newGlobe'
    ,'./dataAll'
    ,'./createPK'
], function (newGlobe, dataAll, createPK){
    "use strict";

    let pLayer;
    let curDate = dataAll.arrDate[dataAll.arrDate.length - 1].Date;

    dataAll.arrCountry.forEach(function (el, i) {
        //create placemark layer
        pLayer = new WorldWind.RenderableLayer(el.CountryName);
        pLayer.enabled = true;
        pLayer.layerType = 'H_PKLayer';
        pLayer.continent = el.ContinentName;

        // add current placemark layer onto worldwind layer obj
        newGlobe.addLayer(pLayer);
        // newGlobe.redraw();

        //create initial placemarks
        createPK(curDate, el.CountryName, "Confirmed", "init");
    })
});