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

        let agrosphereCat = [
            'Crops',
            'Countries',
            'Weather Stations'
        ]

        let agrosphereDropdown = $("#agrosphereDropdown");

        let agrosphereOptions = $('<button class="btn btn-info btn-block agrotoggle" type="button" data-toggle="">Agrosphere<span class="caret"></span></button>');

        agrosphereDropdown.append(agrosphereOptions);

        let ulItem3 = $('<div class="">');
        agrosphereDropdown.append(ulItem3);

        for (let i = 0; i < agrosphereCat.length; i++) {
            let agrosphereItem = $('<p>' + agrosphereCat[i] + '</p>'+ '<label class="switch">\n' +
                '  <input type="checkbox">\n' +
                '  <span class="slider round"></span>\n' +
                '</label>');
            ulItem3.append(agrosphereItem);
        }

        ulItem3 = $('</div>');
        agrosphereDropdown.append(ulItem3);
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