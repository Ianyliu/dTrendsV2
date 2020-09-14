/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports LayerManager
 */
define([
    './WorldWindShim'
    ],function (WorldWind) {
    "use strict";

    /**
     * Constructs a layer manager for a specified {@link WorldWindow}.
     * @alias LayerManager
     * @constructor
     * @classdesc Provides a layer manager to interactively control layer visibility for a World Window.
     * @param {WorldWindow} WorldWindow The World Window to associated this layer manager with.
     */
    let LayerManager = function (WorldWindow) {
        let thisExplorer = this;

        this.wwd = WorldWindow;

        this.roundGlobe = this.wwd.globe;

        this.createProjectionList();
        $("#projectionDropdown").find(" li").on("click", function (e) {
            thisExplorer.onProjectionClick(e);
        });

        this.createProjectionList2();

        this.synchronizeLayerList();

        this.continentList();

        this.categoryList();

        $("#searchBox").find("button").on("click", function (e) {
            thisExplorer.onSearchButton(e);
        });

        this.geocoder = new WorldWind.NominatimGeocoder();
        this.goToAnimator = new WorldWind.GoToAnimator(this.wwd);
        $("#searchText").on("keypress", function (e) {
            thisExplorer.onSearchTextKeyPress($(this), e);
        });

        //
        //this.wwd.redrawCallbacks.push(function (WorldWindow, stage) {
        //    if (stage == WorldWind.AFTER_REDRAW) {
        //        thisExplorer.updateVisibilityState(WorldWindow);
        //    }
        //});
    };

    LayerManager.prototype.onProjectionClick = function (event) {
        let projectionName = event.target.innerText || event.target.innerHTML;
        $("#projectionDropdown").find("button").html(projectionName + ' <span class="caret"></span>');

        if (projectionName === "3D") {
            if (!this.roundGlobe) {
                this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
            }

            if (this.wwd.globe !== this.roundGlobe) {
                this.wwd.globe = this.roundGlobe;
            }
        } else {
            if (!this.flatGlobe) {
                this.flatGlobe = new WorldWind.Globe2D();
            }

            if (projectionName === "Equirectangular") {
                this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
            } else if (projectionName === "Mercator") {
                this.flatGlobe.projection = new WorldWind.ProjectionMercator();
            }

            if (this.wwd.globe !== this.flatGlobe) {
                this.wwd.globe = this.flatGlobe;
            }
        }

        this.wwd.redraw();
    };

    LayerManager.prototype.onLayerClick = function (layerButton) {
        let layerName = layerButton.text();

        // Update the layer state for the selected layer.
        for (let i = 6, len = this.wwd.layers.length; i < len; i++) {
            let layer = this.wwd.layers[i];
            if (layer.hide) {
                continue;
            }

            if (layer.displayName === layerName) {
                layer.enabled = !layer.enabled;
                this.wwd.goTo(new WorldWind.Position(layer.renderables[0].position.latitude, layer.renderables[0].position.longitude, 14000000));
                if (layer.enabled) {
                    layerButton.addClass("active");
                    layerButton.css("color", "white");
                } else {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }
                this.wwd.redraw();
                break;
            }
        }
    };

    LayerManager.prototype.synchronizeLayerList = function () {
        let layerListItem = $("#layerList");

        layerListItem.find("button").off("click");
        layerListItem.find("button").remove();


        // Synchronize the displayed layer list with the World Window's layer list.
        for (let i = 6, len = this.wwd.layers.length; i < len; i++) {
            let layer = this.wwd.layers[i];
            // console.log(layer);
            if (layer.hide) {
                continue;
            }
            // console.log(layer.renderables[0].userProperties.layerName);

            if (layer.displayName.includes(' ')) {
                layer.displayName = layer.displayName.replace(/ /g, '_');
            }

            let layerItem = $('<button class="list-group-item btn btn-block" id="' + layer.displayName + '" style="color: white">' + layer.displayName + '</button>');
            layerListItem.append(layerItem);

            if (layer.showSpinner && Spinner) {
                let opts = {
                    scale: 0.9
                };
                let spinner = new Spinner(opts).spin();
                layerItem.append(spinner.el);
            }

            if (layer.enabled) {
                layerItem.addClass("active");
                layerItem.css("color", "white");
            } else {
                layerItem.removeClass("active");
                layerItem.css("color", "black");
            }
            if (layer.showSpinner && Spinner) {
                let opts = {
                    scale: 0.9
                };
                let spinner = new Spinner(opts).spin();
                layerItem.append(spinner.el);
            }
            if (layer.enabled) {
                layerItem.addClass("active");
                layerItem.css("color", "white");
            } else {
                layerItem.removeClass("active");
                layerItem.css("color", "black");
            }
        }

        let self = this;
        layerListItem.find("button").on("click", function (e) {
            self.onLayerClick($(this));
        });
    };

    //LayerManager.prototype.updateVisibilityState = function (WorldWindow) {
    //    let layerButtons = $("#layerList").find("button"),
    //        layers = WorldWindow.layers;
    //
    //    for (let i = 0; i < layers.length; i++) {
    //        let layer = layers[i];
    //        for (let j = 0; j < layerButtons.length; j++) {
    //            let button = layerButtons[j];
    //
    //            if (layer.displayName === button.innerText) {
    //                if (layer.inCurrentFrame) {
    //                    button.innerHTML = "<em>" + layer.displayName + "</em>";
    //                } else {
    //                    button.innerHTML = layer.displayName;
    //                }
    //            }
    //        }
    //    }
    //};


    LayerManager.prototype.createProjectionList = function () {
        let projectionNames = [
            "3D",
            "Equirectangular",
            "Mercator"
        ];
        let projectionDropdown = $("#projectionDropdown");

        let dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">3D<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);

        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < projectionNames.length; i++) {
            let projectionItem = $('<li><a >' + projectionNames[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);


    };

    LayerManager.prototype.continentList = function () {
        let contiLists = [
            "All Continents",
            "North America",
            "Europe",
            "South America",
            "Asia",
            "Africa",
            "Oceania",
        ];
        let projectionDropdown = $("#continentList");

        let dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">Please Select Continent<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);

        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < contiLists.length; i++) {
            let projectionItem = $('<li><a>' + contiLists[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);

    };

    LayerManager.prototype.categoryList = function () {
        let category = [
            "Confirmed Cases",
            "Deaths",
            "Recoveries",
            "Active Cases"
        ];
        let projectionDropdown = $("#categoryList");

        let dropdownButton = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">Confirmed Cases<span class="caret"></span></button>');
        projectionDropdown.append(dropdownButton);
        projectionDropdown.find("button").css("background-color","red");
        let ulItem = $('<ul class="dropdown-menu">');
        projectionDropdown.append(ulItem);

        for (let i = 0; i < category.length; i++) {
            let projectionItem = $('<li><a>' + category[i] + '</a></li>');
            ulItem.append(projectionItem);
        }

        ulItem = $('</ul>');
        projectionDropdown.append(ulItem);

    };

    LayerManager.prototype.createProjectionList2 = function () {
        let diseaseNames = [
            "COVID-19",
            "Influenza A",
            "Influenza B"
        ];

        let diseaseDropdown = $("#diseaseDropdown");

        let diseaseOptions = $('<button class="btn btn-info btn-block dropdown-toggle" type="button" data-toggle="dropdown">COVID-19<span class="caret"></span></button>');

        diseaseDropdown.append(diseaseOptions);

        let ulItem2 = $('<ul class="dropdown-menu">');
        diseaseDropdown.append(ulItem2);

        for (let i = 0; i < diseaseNames.length; i++) {
            let diseaseItem = $('<li><a >' + diseaseNames[i] + '</a></li>');
            ulItem2.append(diseaseItem);
        }

        ulItem2 = $('</ul>');
        diseaseDropdown.append(ulItem2);

        //Agrosphere Menu
        const agrosphereCat = [
            'Crops',
            'Countries',
            'WeatherStations'
        ]

        let agrosphereDropdown = $("#agrosphereDropdown");

        let agrosphereOptions = $('<button class="btn btn-info btn-block agrotoggle" type="button" data-toggle="">Agrosphere<span class="caret"></span></button>');

        agrosphereDropdown.append(agrosphereOptions);

        let ulItem3 = $('<div id="agrosphere-dropdowndiv" style="visibility: hidden; display: none">');
        agrosphereDropdown.append(ulItem3);

        for (let i = 0; i < agrosphereCat.length; i++) {
            let agrosphereItem = $('<label class="switch" style="display: block;"'+' id="label-'+ agrosphereCat[i] + '">' +
                '  <input type="checkbox" id="' + agrosphereCat[i] + '-switch" class="agroswitch">'+
                '<span class="slider round">' +
                '<span style="margin-left: 40px" id="' + agrosphereCat[i] + '">' + agrosphereCat[i] + '</span></label>' + '<div id ="' + agrosphereCat[i]+ 'Dropdown" style="visibility: hidden; display: none"></div><br><br><br>');
            ulItem3.append(agrosphereItem);//'<p style="display: block;"' +' id="'+ agrosphereCat[i] + '-text">'+ agrosphereCat[i] +
                    }

        ulItem3 = $('</div>');
        agrosphereDropdown.append(ulItem3);

        //Crops Menu

        let cropsDropdown = $("#CropsDropdown");

        const cropsmenu = [
            'Production',
            'Price',
            'Livestock',
            'Emissions',
            'Pesticides',
            'Fertilizer',
            'Yield'
        ]

        for (let i = 0; i < cropsmenu.length; i++) {
            let cropsItem = $('<p style="display: block;"' +' id="'+ cropsmenu[i] + '-text">'+ cropsmenu[i] + '</p>'+ '<label class="switch" style="display: block;"'+' id="label-'+ cropsmenu[i] + '">' +
                '  <input type="checkbox" id="' + cropsmenu[i] + '-switch"'+ ' class="cropscheckbox">' +
                '  <span class="slider round"></span>\n' +
                '</label>');
            cropsDropdown.append(cropsItem);
        }

        //Country Menu

        let countryDropdown = $("#CountriesDropdown");

        const countrymenu = [
            "Afghanistan",
            "Albania",
            "Algeria",
            "American Samoa",
            "Andorra",
            "Angola",
            "Anguilla",
            "Antarctica",
            "Antigua and Barbuda",
            "Argentina",
            "Armenia",
            "Aruba",
            "Australia",
            "Austria",
            "Azerbaijan",
            "Bahamas (the)",
            "Bahrain",
            "Bangladesh",
            "Barbados",
            "Belarus",
            "Belgium",
            "Belize",
            "Benin",
            "Bermuda",
            "Bhutan",
            "Bolivia (Plurinational State of)",
            "Bonaire, Sint Eustatius and Saba",
            "Bosnia and Herzegovina",
            "Botswana",
            "Bouvet Island",
            "Brazil",
            "British Indian Ocean Territory (the)",
            "Brunei Darussalam",
            "Bulgaria",
            "Burkina Faso",
            "Burundi",
            "Cabo Verde",
            "Cambodia",
            "Cameroon",
            "Canada",
            "Cayman Islands (the)",
            "Central African Republic (the)",
            "Chad",
            "Chile",
            "China",
            "Christmas Island",
            "Cocos (Keeling) Islands (the)",
            "Colombia",
            "Comoros (the)",
            "Congo (the Democratic Republic of the)",
            "Congo (the)",
            "Cook Islands (the)",
            "Costa Rica",
            "Croatia",
            "Cuba",
            "Curaçao",
            "Cyprus",
            "Czechia",
            "Côte d'Ivoire",
            "Denmark",
            "Djibouti",
            "Dominica",
            "Dominican Republic (the)",
            "Ecuador",
            "Egypt",
            "El Salvador",
            "Equatorial Guinea",
            "Eritrea",
            "Estonia",
            "Eswatini",
            "Ethiopia",
            "Falkland Islands (the) [Malvinas]",
            "Faroe Islands (the)",
            "Fiji",
            "Finland",
            "France",
            "French Guiana",
            "French Polynesia",
            "French Southern Territories (the)",
            "Gabon",
            "Gambia (the)",
            "Georgia",
            "Germany",
            "Ghana",
            "Gibraltar",
            "Greece",
            "Greenland",
            "Grenada",
            "Guadeloupe",
            "Guam",
            "Guatemala",
            "Guernsey",
            "Guinea",
            "Guinea-Bissau",
            "Guyana",
            "Haiti",
            "Heard Island and McDonald Islands",
            "Holy See (the)",
            "Honduras",
            "Hong Kong",
            "Hungary",
            "Iceland",
            "India",
            "Indonesia",
            "Iran (Islamic Republic of)",
            "Iraq",
            "Ireland",
            "Isle of Man",
            "Israel",
            "Italy",
            "Jamaica",
            "Japan",
            "Jersey",
            "Jordan",
            "Kazakhstan",
            "Kenya",
            "Kiribati",
            "Korea (the Democratic People's Republic of)",
            "Korea (the Republic of)",
            "Kuwait",
            "Kyrgyzstan",
            "Lao People's Democratic Republic (the)",
            "Latvia",
            "Lebanon",
            "Lesotho",
            "Liberia",
            "Libya",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Macao",
            "Madagascar",
            "Malawi",
            "Malaysia",
            "Maldives",
            "Mali",
            "Malta",
            "Marshall Islands (the)",
            "Martinique",
            "Mauritania",
            "Mauritius",
            "Mayotte",
            "Mexico",
            "Micronesia (Federated States of)",
            "Moldova (the Republic of)",
            "Monaco",
            "Mongolia",
            "Montenegro",
            "Montserrat",
            "Morocco",
            "Mozambique",
            "Myanmar",
            "Namibia",
            "Nauru",
            "Nepal",
            "Netherlands (the)",
            "New Caledonia",
            "New Zealand",
            "Nicaragua",
            "Niger (the)",
            "Nigeria",
            "Niue",
            "Norfolk Island",
            "Northern Mariana Islands (the)",
            "Norway",
            "Oman",
            "Pakistan",
            "Palau",
            "Palestine, State of",
            "Panama",
            "Papua New Guinea",
            "Paraguay",
            "Peru",
            "Philippines (the)",
            "Pitcairn",
            "Poland",
            "Portugal",
            "Puerto Rico",
            "Qatar",
            "Republic of North Macedonia",
            "Romania",
            "Russian Federation (the)",
            "Rwanda",
            "Réunion",
            "Saint Barthélemy",
            "Saint Helena, Ascension and Tristan da Cunha",
            "Saint Kitts and Nevis",
            "Saint Lucia",
            "Saint Martin (French part)",
            "Saint Pierre and Miquelon",
            "Saint Vincent and the Grenadines",
            "Samoa",
            "San Marino",
            "Sao Tome and Principe",
            "Saudi Arabia",
            "Senegal",
            "Serbia",
            "Seychelles",
            "Sierra Leone",
            "Singapore",
            "Sint Maarten (Dutch part)",
            "Slovakia",
            "Slovenia",
            "Solomon Islands",
            "Somalia",
            "South Africa",
            "South Georgia and the South Sandwich Islands",
            "South Sudan",
            "Spain",
            "Sri Lanka",
            "Sudan (the)",
            "Suriname",
            "Svalbard and Jan Mayen",
            "Sweden",
            "Switzerland",
            "Syrian Arab Republic",
            "Taiwan",
            "Tajikistan",
            "Tanzania, United Republic of",
            "Thailand",
            "Timor-Leste",
            "Togo",
            "Tokelau",
            "Tonga",
            "Trinidad and Tobago",
            "Tunisia",
            "Turkey",
            "Turkmenistan",
            "Turks and Caicos Islands (the)",
            "Tuvalu",
            "Uganda",
            "Ukraine",
            "United Arab Emirates (the)",
            "United Kingdom of Great Britain and Northern Ireland (the)",
            "United States Minor Outlying Islands (the)",
            "United States of America (the)",
            "Uruguay",
            "Uzbekistan",
            "Vanuatu",
            "Venezuela (Bolivarian Republic of)",
            "Viet Nam",
            "Virgin Islands (British)",
            "Virgin Islands (U.S.)",
            "Wallis and Futuna",
            "Western Sahara",
            "Yemen",
            "Zambia",
            "Zimbabwe",
            "Åland Islands"
        ]

        for (let i = 0; i < countrymenu.length; i++) {
            let countryItem = $('<p style="display: block;"' +' id="'+ countrymenu[i] + '-text">'+ countrymenu[i] + '</p>'+ '<label class="switch" style="display: block;"'+' id="label-'+ countrymenu[i] + '">' +
                '  <input type="checkbox" id="' + countrymenu[i] + '-switch"'+ ' class="countrycheckbox">' +
                '  <span class="slider round"></span>\n' +
                '</label>');
            countryDropdown.append(countryItem);
        }

        //Weatherstation Menu

        let weatherDropdown = $("#WeatherStationsDropdown");

        const weathermenu = [
            'GraphsandWeather',
            'YearlyTemperature',
            'MonthlyTemperature',
            'YearlyPrecipitation',
            'MonthlyPrecipitation'
        ]

        for (let i = 0; i < weathermenu.length; i++) {
            let weatherItem = $('<p style="display: block;"' +' id="'+ weathermenu[i] + '-text">'+ weathermenu[i] + '</p>'+ '<label class="switch" style="display: block;"'+' id="label-'+ weathermenu[i] + '">' +
                '  <input type="checkbox" id="' + weathermenu[i] + '-switch"'+ ' class="weathercheckbox">' +
                '  <span class="slider round"></span>\n' +
                '</label>');
            weatherDropdown.append(weatherItem);
        }

        //
        // let weatherOptions = $('#WeatherStations-switch');
        //
        // weatherDropdown.append(weatherOptions);
        //
        // let ulItem5 = $('<div id="weather-dropdowndiv" class="" style="visibility: hidden; display: none">');
        // weatherDropdown.append(ulItem5);
        //
        // for (let i = 0; i < weathermenu.length; i++) {
        //     let weatherItem = $('<p style="display: block;"' +' id="'+ weathermenu[i] + '-text">'+ weathermenu[i] + '</p>'+ '<label class="switch" style="display: block;"'+' id="label-'+ weathermenu[i] + '">' +
        //         '  <input type="checkbox" id="' + weathermenu[i] + '-switch">'+
        //         '  <span class="slider round"></span>\n' +
        //         '</label>');
        //     ulItem5.append(weatherItem);
        // }
        //
        // ulItem5 = $('</div>');
        // cropsDropdown.append(ulItem5);


    };

    LayerManager.prototype.onSearchButton = function (event) {
        this.performSearch($("#searchText")[0].value)
    };

    LayerManager.prototype.onSearchTextKeyPress = function (searchInput, event) {
        if (event.keyCode === 13) {
            searchInput.blur();
            this.performSearch($("#searchText")[0].value)
        }
    };

    LayerManager.prototype.performSearch = function (queryString) {
        if (queryString) {
            let thisLayerManager = this,
                latitude, longitude;

            if (queryString.match(WorldWind.WWUtil.latLonRegex)) {
                let tokens = queryString.split(",");
                latitude = parseFloat(tokens[0]);
                longitude = parseFloat(tokens[1]);
                thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
            } else {
                this.geocoder.lookup(queryString, function (geocoder, result) {
                    if (result.length > 0) {
                        latitude = parseFloat(result[0].lat);
                        longitude = parseFloat(result[0].lon);

                        WorldWind.Logger.log(
                            WorldWind.Logger.LEVEL_INFO, queryString + ": " + latitude + ", " + longitude);

                        thisLayerManager.goToAnimator.goTo(new WorldWind.Location(latitude, longitude));
                    }
                });
            }
        }
    };

    return LayerManager;
});