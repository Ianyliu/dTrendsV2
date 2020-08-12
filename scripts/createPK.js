define([
    './globeObject'
    ,'./pkObject'
], function (newGlobe, pkObject){
    "use strict";


    //let pLayer;
    function createPK(date, type, flag) {
        console.log(date, type, flag);

        // define color for active case
        let colorStr = "rgb(249,145,10) rgb(249,145,10) rgb(249,145,10)";

        // request the data for placemarks with given date and country
        $.ajax({
            url: '/1dData',
            type: 'GET',
            data: {date: date},
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    resp.data.forEach(function (el, i) {
                        if (flag !== "init") {
                            // initiated by Home.js
                            // delete all other unnecessary placemarks
                            deletePK(date, el.CountryName);
                        }
                        /*pLayer = new WorldWind.RenderableLayer(el.CountryName);
                        pLayer.enabled = true;
                        pLayer.layerType = 'H_PKLayer';
                        pLayer.continent = el.ContinentName;*/

                        //create placemarks
                        console.log(newGlobe.layers);
                        let cConfirmed = el.Color_Confirmed.split(' ');
                        let cDeath = el.Color_Death.split(' ');
                        let cRecovered = el.Color_Recovered.split(' ');
                        let cActive = colorStr.split(' ');

                        let confirmedPK = new pkObject(cConfirmed, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                        let deathPK = new pkObject(cDeath, el.Latitude, el.Longitude, sizePK(el.DeathNum));
                        let recoveredPK = new pkObject(cRecovered, el.Latitude, el.Longitude, sizePK(el.RecovNum));
                        let activePK = new pkObject(cActive, el.Latitude, el.Longitude, sizePK(el.CaseNum-el.DeathNum-el.RecovNum));

                        confirmedPK.pk.userProperties.Date = el.Date;
                        confirmedPK.pk.userProperties.Type = "Confirmed Cases";
                        confirmedPK.pk.userProperties.dName = el.DisplayName;

                        deathPK.pk.userProperties.Date = el.Date;
                        deathPK.pk.userProperties.Type = "Deaths";
                        deathPK.pk.userProperties.dName = el.DisplayName;

                        recoveredPK.pk.userProperties.Date = el.Date;
                        recoveredPK.pk.userProperties.Type = "Recoveries";
                        recoveredPK.pk.userProperties.dName = el.DisplayName;

                        activePK.pk.userProperties.Date = el.Date;
                        activePK.pk.userProperties.Type = "Active Cases";
                        activePK.pk.userProperties.dName = el.DisplayName;

                        // disable all the placemarks except requested date
                        confirmedPK.pk.enabled = true;
                        deathPK.pk.enabled = false;
                        recoveredPK.pk.enabled = false;
                        activePK.pk.enabled = false;

                        let countryN = el.CountryName.replace(/ /g,"_");

                        // find the placemark layer in newGlobe.layers, otherwise create a new renderable layer
                        let pLayer = newGlobe.layers.find(({displayName}) => displayName === el.CountryName);
                        console.log(el.CountryName);

                        // if (flag !== "init") {
                        //     pLayer.removeAllRenderables();
                        // }
                        // if (pLayer) {
                        //     pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);
                        // }



                        // add current placemark layer onto worldwind layer obj
                        //newGlobe.addLayer(pLayer);
                        newGlobe.redraw();

                        /*if (el.Date == d) {
                            switch (type) {
                                case "Confirmed":
                                    confirmedPK.pk.enabled = true;
                                case "Death":
                                    deathPK.pk.enabled = true;
                                case "Recovered":
                                    recoveredPK.pk.enabled = true;
                                case "Active":
                                    activePK.pk.enabled = true;
                            }
                        }*/


                        //add placemarks onto placemark layer
                        if (!pLayer) {
                            console.log("Country layer can not find!");
                        } else {
                            pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);
                            console.log(pLayer);
                            newGlobe.redraw();
                        }
                    })
                }
            }
        })
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

    function deletePK(da, co) {
        // locate pLayer
        let dpLayer = newGlobe.layers.find(({displayName}) => displayName === co);
        // console.log(dpLayer);
        //
        if (!dpLayer) {
            console.log("No country layer found!");
        } else {
            dpLayer.renderables.forEach(function (e,i) {
                if (e.userProperties.Date !== da[0]) {
                    dpLayer.removeRenderable(e);
                }
            })
            newGlobe.redraw();
        }

        // newGlobe.layers.forEach(function (elem, index) {
        //     if (elem instanceof WorldWind.RenderableLayer) {
        //         elem.renderables.forEach(function (d) {
        //             if (d instanceof WorldWind.Placemark) {
        //                 if (d.userProperties.Date == da) {
        //                     console.log(d);
        //                     d.removeAllRenderables();
        //                 }
        //             }
        //         })
        //     }
        // });
    }

    return createPK;
});
