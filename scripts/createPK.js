define([
    './globeObject',
    './canvasPKobject',
    './imgPKobject',
    './DataArray'
    // ,'./initPL'
], function (newGlobe, pkObject,imagePK){
    "use strict";


    let pLayer;
    function createPK(date, type, flag, countries, continents,DataArray) {

        // request the data for placemarks with given date and country
        $.ajax({
            url: '/1dData',
            type: 'GET',
            data: {date: date, countries: countries, continents: continents},
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    if (flag !== "init") {
                        // initiated by Home.js
                        // delete all other unnecessary placemarks
                        deletePK();
                    }
                    resp.data.forEach(function (el, i) {
                        if (i === 0) {
                            //create placemark layer
                            pLayer = new WorldWind.RenderableLayer(el.CountryName);
                            pLayer.enabled = true;
                            pLayer.layerType = 'H_PKLayer';
                            pLayer.continent = el.ContinentName;
                        }

                        //define colors for the placemarks
                        let colorC = "1 0 0";
                        let colorD = "0 0 0";
                        let colorR = "0.4 1 0.2 ";
                        let colorA = "0.9 0.6 0";

                        //color arrays
                        let cConfirmed = colorC.split(' ');
                        let cDeath = colorD.split(' ');
                        let cRecovered = colorR.split(' ');
                        let cActive = colorA.split(' ');

                        let confirmedPK = new pkObject(cConfirmed, el.Latitude, el.Longitude, sizePK(el.CaseNum));
                        let deathPK = new pkObject(cDeath, el.Latitude, el.Longitude, sizePK(el.DeathNum));
                        let recoveredPK = new pkObject(cRecovered, el.Latitude, el.Longitude, sizePK(el.RecovNum));
                        let activePK = new pkObject(cActive, el.Latitude, el.Longitude, sizePK(el.CaseNum-el.DeathNum-el.RecovNum));

                        confirmedPK.pk.userProperties.Date = el.Date;
                        confirmedPK.pk.userProperties.Type = "Confirmed Cases";
                        confirmedPK.pk.userProperties.dName = el.DisplayName;
                        confirmedPK.pk.userProperties.Number = el.CaseNum;

                        deathPK.pk.userProperties.Date = el.Date;
                        deathPK.pk.userProperties.Type = "Deaths";
                        deathPK.pk.userProperties.dName = el.DisplayName;
                        deathPK.pk.userProperties.Number = el.DeathNum;

                        recoveredPK.pk.userProperties.Date = el.Date;
                        recoveredPK.pk.userProperties.Type = "Recoveries";
                        recoveredPK.pk.userProperties.dName = el.DisplayName;
                        recoveredPK.pk.userProperties.Number = el.RecovNum;

                        activePK.pk.userProperties.Date = el.Date;
                        activePK.pk.userProperties.Type = "Active Cases";
                        activePK.pk.userProperties.dName = el.DisplayName;
                        activePK.pk.userProperties.Number = el.CaseNum-el.DeathNum-el.RecovNum;

                        // disable all the placemarks except requested date
                        if (el.Date === resp.data[resp.data.length - 1].Date) {
                            confirmedPK.pk.enabled = true;
                            deathPK.pk.enabled = false;
                            recoveredPK.pk.enabled = false;
                            activePK.pk.enabled = false;
                        } else {
                            confirmedPK.pk.enabled = false;
                            deathPK.pk.enabled = false;
                            recoveredPK.pk.enabled = false;
                            activePK.pk.enabled = false;
                        }

                        // add current placemark layer onto worldwind layer obj
                        newGlobe.redraw();

                        pLayer.addRenderables([confirmedPK.pk, deathPK.pk, recoveredPK.pk, activePK.pk]);

                        //add placemarks onto placemark layer
                        if (i !== resp.data.length - 1) {
                            if (el.CountryName !== resp.data[i+1].CountryName) {
                                // add current placemark layer onto worldwind layer obj
                                newGlobe.addLayer(pLayer);
                                newGlobe.redraw();

                                //create new placemark layer for next country
                                pLayer = new WorldWind.RenderableLayer(resp.data[i + 1].CountryName);
                                pLayer.enabled = true;
                                pLayer.layerType = 'H_PKLayer';
                                pLayer.continent = resp.data[i + 1].ContinentName;
                            }
                        } else {
                            // add current placemark layer onto worldwind layer obj
                            newGlobe.addLayer(pLayer);
                            newGlobe.redraw();
                        }

                    })
                }
            }
        })

        //Loading the files (raw data)
        let countryData =
            new DataArray(loadCSVData('csvdata/countries.csv'), {});
        let stationData =
            new DataArray(loadCSVData('csvdata/weatherstations.csv'), {});
        let agriDef = new DataArray(loadCSVData('csvdata/cropAcros.csv'));

        loadCountryLayer(newGlobe, countryData);
        loadWeatherLayer(newGlobe, stationData);

        function loadCSVData(csvAddress) {
            //Find the file
            let csvString = "";

            let csvData = [];
            let i = 0;
            let csvRequest = $.ajax({
                async: false,
                url: csvAddress,
                success: function(file_content) {
                    csvString = file_content;
                    csvData = $.csv.toObjects(csvString);
                }
            });
            return csvData;
        }

        /**
         * Loads weather stations CSV Data Array into Array of Weather Stations
         * @param {DataArray} csvData contains the weather station location and
         * details.
         * @returns {Array<GlobalDataPoint>} A datastructure that maps a value
         * to a location.
         */

        function loadWeatherStation(csvData) {
            let i = 0;
            let temp = [];
            for (i = 0; i < csvData.values.length; i++) {
                temp.push(new GlobalDataPoint(csvData.values[i].stationName,
                    csvData.values[i].lat, csvData.values[i].lon, {
                        icon_code: '',
                        type: 'Weather Station'
                    }));
            }
            return temp;
        }

        /**
         * Loads the weather station layer
         * @param {WorldWindow} wwd is the  world window of the globe
         * @param {Array<DataLayer>} weatherDataArray is
         * an array containing the WMS Layers that needs to be loaded
         */

        function loadWeatherLayer(wwd, weatherDataArray) {
            let weatherLayer = new DataLayer('Weather Station');
            let weatherData = loadWeatherStation(weatherDataArray);
            weatherLayer.loadFlags(weatherData, 'images/sun', '.png',
                null, null);
            console.log(weatherLayer);
            wwd.addLayer(weatherLayer.layer);
        }


        function loadCountries(countryDataArray) {
            let i = 0;
            let temp = [];
            for (i = 0; i < countryDataArray.values.length; i++) {
                temp.push(new GlobalDataPoint(countryDataArray.values[i].country,
                    countryDataArray.values[i].lat,
                    countryDataArray.values[i].lon, {
                        code_2: countryDataArray.values[i].code2,
                        code_3: countryDataArray.values[i].code3,
                        icon_code: countryDataArray.values[i].iconCode,
                        name: countryDataArray.values[i].country,
                        type: 'Country'
                    }));
            }
            return temp;
        }

        function loadCountryLayer(wwd, countryDataArray) {
            let countryLayer = new DataLayer('Countries');
            let countryData = loadCountries(countryDataArray);
            countryLayer.loadFlags(countryData, './flags/', '.png', null, null);
            wwd.addLayer(countryLayer.layer);
            return countryLayer;
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

    return createPK;
});
