define([
    './globeObject'
    ,'./dataAll'
    ,'./LayerManager'
    ,'./createPK'
], function (newGlobe, dataAll, LayerManager,createPK) {
    "use strict";

    let categoryS = "Confirmed Cases";

    let fromDate = $('.fromdatepicker');
    let toDate = $('.todatepicker');
    let curDate = $("#currentdatepicker");

    let i = 0;
    let l;

    let play = false;

    let numC = 0;
    let numD = 0;
    let numR = 0;
    let numA = 0;

    //underinitial load for case numbers
    let initCaseNum = function () {
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date == curDate.val()) {
                            if (d.userProperties.Type == "Confirmed Cases") {
                                numC += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Deaths") {
                                numD += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Recoveries") {
                                numR += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Active Cases") {
                                numA += d.userProperties.Number;
                            }
                        }
                    }
                });
            }
            if (index == newGlobe.layers.length - 1) {
                newGlobe.redraw()
            }
        });

        $('#conConfirmed').text(numC);
        $('#conDeaths').text(numD);
        $('#conRecoveries').text(numR);
        $('#conActive').text(numA);
    }

    //overlays sub dropdown menus over other items
    let subDropdown = function () {
        $(".dropdown").on("show.bs.dropdown", function() {
            let $btnDropDown = $(this).find(".dropdown-toggle");
            let $listHolder = $(this).find(".dropdown-menu");
            let subMenu = $(this).find(".dropdown-submenu");
            let subMenu2 = subMenu.find(".dropdown-menu");
            //reset position property for DD container
            $(this).css("position", "static");
            $listHolder.css({
                "top": ($btnDropDown.offset().top + $btnDropDown.outerHeight(true)) + "px",
                "left": $btnDropDown.offset().left + "px"
            });
            subMenu2.css({
                "left": $listHolder.outerWidth(true) + "px"
            });

            $listHolder.data("open", true);
        });
        //add BT DD hide event
        $(".dropdown").on("hidden.bs.dropdown", function() {
            var $listHolder = $(this).find(".dropdown-menu");
            $listHolder.data("open", false);
        });
    }

    //enables placemarks for current date; used when current date is changed based on date picker or date slider
    let updateCurr = function (currentD) {

        //reset case numbers
        numC = 0;
        numD = 0;
        numR = 0;
        numA = 0;

        curDate.val(currentD);

        createPK([currentD,currentD], categoryS, "not init");

        //enables placemark based on the placemark properties current date and type; adds number of cases per category
        newGlobe.layers.forEach(function (elem) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date === currentD) {
                            if (d.userProperties.Type === categoryS) {
                                d.enabled = true;
                            } else {
                                d.enabled = false;
                            }
                            if (d.userProperties.Type == "Confirmed Cases") {
                                numC += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Deaths") {
                                numD += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Recoveries") {
                                numR += d.userProperties.Number;
                            } else if (d.userProperties.Type == "Active Cases") {
                                numA += d.userProperties.Number;
                            }
                        } else {
                            d.enabled = false;
                        }
                    }
                })
            }
            newGlobe.redraw()
        });

        //updates text under second right tab containing total case numbers up to current date shown
        $('#conConfirmed').text(numC);
        $('#conDeaths').text(numD);
        $('#conRecoveries').text(numR);
        $('#conActive').text(numA);
    };

    //under first left tab; used to switch display between diseases/influenzas
    let onDiseaseClick = function (event) {
        let projectionName = event.target.innerText || event.target.innerHTML;
        $("#diseaseDropdown").find("button").html(projectionName + ' <span class="caret"></span>');

        if (projectionName === "COVID-19") {
            covid19();
        } else {
            influenzaA();
        }
    };

    //under first left tab; activates COVID-19 display when selected for Disease Projection
    let covid19 = function () {
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName + '');
            if (layer.layerType === "H_PKLayer") {
                layer.enabled = !layer.enabled;
                if (!layer.enabled) {
                    layerButton.addClass("active");
                    layerButton.css("color", "white");
                } else {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }
            }

        }

        layerManager.synchronizeLayerList();
    };

    //under first left tab; activates Influenza A display when selected for Disease Projection
    let influenzaA = function () {
        //refreshes layer menu to match the disease selected
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName + '');
            if (layer.layerType === "H_PKLayer" || layer.layerType === "INA_PKLayer") {
                layer.enabled = !layer.enabled;
                if (!layer.enabled) {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                } else {
                    layer.enabled = false;
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }

                layerButton.remove();
            }

        }
    };

    //under second left tab, second dropdown menu; used to display layers filtered by cases, deaths, and recoveries
    let onCategory = function (event) {
        //grab the selection value
        categoryS = event.target.innerText || event.target.innerHTML;
        //refresh the option display
        $("#categoryList").find("button").html(categoryS + ' <span class="caret"></span>');

        //reset the button background color according to selection
        if (categoryS === "Confirmed Cases") {
            $("#categoryList").find("button").css("background-color", "red");
            $("#titleCategory").text("Highest Infections (lowest to highest)");
        } else if (categoryS === "Deaths") {
            $("#categoryList").find("button").css("background-color", "black");
            $("#titleCategory").text("Highest Deaths (lowest to highest)");
        } else if (categoryS === "Recoveries") {
            $("#categoryList").find("button").css("background-color", "#7cfc00");
            $("#titleCategory").text("Highest Recoveries (lowest to highest)");
        } else if (categoryS === "Active Cases") {
            $("#categoryList").find("button").css("background-color", "#F9910A");
            $("#titleCategory").text("Highest Active Cases (lowest to highest)");
        }

        //turn off all the placemarks, and then turn on selected placemarks
        //locate placemarks by accessing renderables member in placemark layers
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Type == categoryS) {
                            d.enabled = true;
                        } else {
                            d.enabled = false;
                        }
                    }
                });
            }
            if (index == newGlobe.layers.length - 1) {
                newGlobe.redraw()
            }
        });
    };

    //under second left tab, third dropdown menu; used to display all countries/layers in that continent
    let onContinent = function (event) {
        //grab the continent value when selected by user.
        let continentS = event.target.innerText || event.target.innerHTML;

        //refresh the option display
        $("#continentList").find("button").html(continentS + ' <span class="caret"></span>');

        let letLong = [
            {cont: 'North America', lat: 40.7306, long: -73.9352},
            {cont: 'South America', lat: -14.235, long: -51.9253},
            {cont: 'Asia', lat: 30.9756, long: 112.2707},
            {cont: 'Europe', lat: 51, long: 9},
            {cont: 'Africa', lat: 9.082, long: 8.6753},
            {cont: 'Oceania', lat: -37.8136, long: 144.9631},
            {cont: 'All Continents', lat: 30.9756, long: 112.2707}
        ];

        //turn off all the placemark layers, and then turn on the layers with continent name selected.
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                if (elem.continent != continentS) {
                    if (continentS == 'All Continents') {
                        elem.hide = false;
                        elem.enabled = true;
                    } else {
                        elem.hide = true;
                        elem.enabled = false;
                    }
                } else {
                    elem.hide = false;
                    elem.enabled = true;
                }
            }

            // refreshed the menu buttoms
            if (index == newGlobe.layers.length - 1) {
                //navigate the globe to the continent
                letLong.some(function (c) {
                    if (c.cont == continentS) {
                        newGlobe.goTo(new WorldWind.Position(c.lat, c.long, 12000000));
                        return true
                    }
                })

                layerManager.synchronizeLayerList();
            }
        })
    };

    //under second left tab; controls display of navigation tools
    let onNav = function () {
        if (newGlobe.layers[2].enabled === true && newGlobe.layers[4].enabled === true) {
            $('#navControls').css("background-color","transparent");
            newGlobe.layers[2].enabled = false;
            newGlobe.layers[4].enabled = false;
        } else if (newGlobe.layers[2].enabled === false && newGlobe.layers[4].enabled === false) {
            $('#navControls').css("background-color","#0db9f0");
            newGlobe.layers[2].enabled = true;
            newGlobe.layers[4].enabled = true;
        }
    }

    //under third left tab; plays a timelapse of the placemarks over the course of a set date range
    let timelapse = function () {
        l = setInterval(function () {
            if (!play) {
                //updates current date picker and date slider
                curDate.val(dataAll.arrDate[i].Date);
                let val = new Date(dataAll.arrDate[i].Date).getTime()/1000;
                $( "#slider-range" ).slider( "value", val );
                $( "#amount" ).val(dataAll.arrDate[i].Date);

                //enables placemark based on the user properties date and type
                newGlobe.layers.forEach(function (elem, index) {
                    if (elem instanceof WorldWind.RenderableLayer) {
                        elem.renderables.forEach(function (d) {
                            if (d instanceof WorldWind.Placemark) {
                                if (d.userProperties.Date === dataAll.arrDate[i].Date) {
                                    if (d.userProperties.Type === categoryS) {
                                        d.enabled = true;
                                    } else {
                                        d.enabled = false;
                                    }
                                } else {
                                    d.enabled = false;
                                }
                            }
                        })
                    }
                    newGlobe.redraw()
                });

                i++;

                //when date reaches 'To' date aka end of date range, stop animation
                if (toDate.val() === dataAll.arrDate[i].Date) {
                    curDate.val(dataAll.arrDate[i].Date);

                    $('#pauseTL').hide();
                    $('#toggleTL').show();

                    clearI();
                }
            }


        }, 1000)
    };

    //used for timelapse function; pauses/plays animation without restarting from the beginning of timelapse
    let pause = function () {
        play = !play;
    };

    //clears timelapse interval
    let clearI = function () {
        clearInterval(l);
    }

    //under third left tab; used to update placemarks shown based on filter boundaries
    let updateHIS = function (v1, v2) {
        let sortLayers = [];

        //enables placemark based on the placemark properties current date and type
        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date == curDate.val()) {
                            if (d.userProperties.Type === categoryS) {
                                sortLayers.push(d);
                                d.enabled = true;
                            } else {
                                d.enabled = false;
                            }
                        } else {
                            d.enabled = false;
                        }
                    }
                })
            }
            newGlobe.redraw()
        });

        //sorts all enabled placemarks based on case number from least to greatest
        sortLayers.sort(function(a, b) {
            if (a.userProperties.Number === b.userProperties.Number) {
                return 0;
            }
            if (a.userProperties.Number > b.userProperties.Number) {
                return 1;
            } else {
                return -1;
            }
        })

        //based on boundaries set using the filter slider, the placemarks are enabled or disabled
        for (let k = 0; k < sortLayers.length; k++) {
            if (k >= v1 && k <= v2) {
                sortLayers[k].enabled = true;
            } else {
                sortLayers[k].enabled = false;
            }
        }
    }

    //under third left tab; changes starting date for timelapse when 'From' date is changed
    let onFrom = function () {
        for(let j = 0; j < dataAll.arrDate.length -1; j++) {
            if (dataAll.arrDate[j].Date === fromDate.val()) {
                i = j;
            }
        }
    };

    //date slider
    let sliderRange = function() {
        $( "#slider-range" ).slider({
            min: new Date(fromDate.val()).getTime()/1000,
            max: new Date(toDate.val()).getTime()/1000,
            step: 86400,
            value: new Date(toDate.val()).getTime()/1000,
            slide: function( event, ui ) {
                //updates text
                $( "#amount" ).val( $.format.date(ui.value*1000,"yyyy-MM-dd" ));

                //update current placemark display based on slider/current date
                updateCurr($( "#amount" ).val());

                //update filter boundaries with changes in date
                updateHIS($('#hInfectionSlider').slider('values', 0), $('#hInfectionSlider').slider('values', 1));
            }
        });
        //display current date
        curDate.val($.format.date(new Date($( "#slider-range" ).slider( "value")*1000),"yyyy-MM-dd"));
        $('#amount').val($.format.date(new Date($( "#slider-range" ).slider( "value")*1000),"yyyy-MM-dd"));
    };

    //range slider; sets date range for date slider
    let doubleSlider = function() {
        $( "#doubleSlider-range" ).slider({
            min: new Date(fromDate.val()).getTime()/1000,
            max: new Date(toDate.val()).getTime()/1000,
            step: 86400,
            values: [new Date(fromDate.val()).getTime()/1000, new Date(toDate.val()).getTime()/1000],
            slide: function( event, ui ) {
                //updates text
                $( "#amount2" ).val( $.format.date(ui.values[0]*1000,"yyyy-MM-dd" ) + " to " + $.format.date(ui.values[1]*1000,"yyyy-MM-dd" ));

                //updates date slider; date range, value, text
                $('#slider-range').slider("option", "min", $( "#doubleSlider-range" ).slider( "values", 0));
                $('#slider-range').slider("option", "max", $( "#doubleSlider-range" ).slider( "values", 1));
                $('#slider-range').slider("option", "value", $( "#doubleSlider-range" ).slider( "values", 1));
                $('#amount').val($.format.date(new Date($( "#doubleSlider-range" ).slider( "values", 1)*1000),"yyyy-MM-dd"));

                //updates date range pickers
                $('.filterFrom').val($.format.date(new Date($( "#doubleSlider-range" ).slider( "values", 0)*1000),"yyyy-MM-dd"));
                $('.filterTo').val($.format.date(new Date($( "#doubleSlider-range" ).slider( "values", 1)*1000),"yyyy-MM-dd"));
            }
        });
        //display current date range
        $('#amount2').val($.format.date(new Date($( "#doubleSlider-range" ).slider( "values", 0)*1000),"yyyy-MM-dd") + " to " + $.format.date(new Date($( "#doubleSlider-range" ).slider( "values", 1)*1000),"yyyy-MM-dd"));
    };

    //edit function to prompt date range adjustments
    let edit = function () {
        if ($('#edit').hasClass('edit-mode')) {
            $("#dialogDateRange").dialog("open");
            $('#edit').removeClass('edit-mode');
            $('#edit').css('background-color','transparent');
            $('#labelRangeSlider').css('display','none');
            $('#labelSlider').css('display','inline-block');
            $('#doubleSlider-range').css('display','none');
            $('#amount2').css('display','none');
            $('#slider-range').css('display','block');
            $('#amount').css('display','inline-block');
        } else {
            $('#edit').addClass('edit-mode');
            $('#edit').css('background-color','#55d2d5');
            $('#labelRangeSlider').css('display','inline-block');
            $('#labelSlider').css('display','none');
            $('#doubleSlider-range').css('display','block');
            $('#amount2').css('display','inline-block');
            $('#slider-range').css('display','none');
            $('#amount').css('display','none');
        }
    }

    //dialog box for filter options for date slider; contains date range picker, continent selector, and full load option
    let filterOptionDialog = function () {
        $( "#dialog" ).dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Apply": function() {
                    //changes dates across all date range pickers
                    $('#drFrom').val($("#foFrom").val());
                    $('#drTo').val($("#foTo").val());

                    //changes
                    $('#slider-range').slider("values", 0) === new Date($('#foFrom').val()).getTime()/1000;
                    $('#slider-range').slider("values", 1) === new Date($('#foTo').val()).getTime()/1000;
                    $( "#amount2" ).val( $('#foFrom' ).val() + " to " + $('#foTo').val());

                    $('#slider-range').slider("option", "min", new Date($('#foFrom').val()).getTime()/1000);
                    $('#slider-range').slider("option", "max", new Date($('#foTo').val()).getTime()/1000);
                    $('#slider-range').slider("option", "value", new Date($('#foTo').val()).getTime()/1000);
                    $('#amount').val($('#foTo').val());

                    $('#edit').removeClass('edit-mode');
                    $('#edit').css('background-color','transparent');
                    $('#labelRangeSlider').css('display','none');
                    $('#labelSlider').css('display','inline-block');
                    $('#doubleSlider-range').css('display','none');
                    $('#amount2').css('display','none');
                    $('#slider-range').css('display','block');
                    $('#amount').css('display','inline-block');

                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    }

    let editDialog = function () {
        $( "#dialogDateRange" ).dialog({
            resizable: false,
            height: "auto",
            width: 450,
            autoOpen: false,
            modal: true,
            buttons: {
                "Confirm": function() {
                    $('#foFrom').val($("#drFrom").val());
                    $('#foTo').val($("#drTo").val());

                    $('#slider-range').slider("values", 0) === new Date($('#drFrom').val()).getTime()/1000;
                    $('#slider-range').slider("values", 1) === new Date($('#drTo').val()).getTime()/1000;
                    $( "#amount2" ).val( $('#drFrom' ).val() + " to " + $('#drTo').val());

                    $('#slider-range').slider("option", "min", new Date($('#drFrom').val()).getTime()/1000);
                    $('#slider-range').slider("option", "max", new Date($('#drTo').val()).getTime()/1000);
                    $('#slider-range').slider("option", "value", new Date($('#drTo').val()).getTime()/1000);

                    createPK([$('#drFrom').val(), $('#drTo').val()], categoryS, "not init", $('#filterContinents').val());

                    $('#amount').val($('#drTo').val());

                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $('#edit').addClass('edit-mode');
                    $('#edit').css('background-color','#55d2d5');
                    $('#labelRangeSlider').css('display','inline-block');
                    $('#labelSlider').css('display','none');
                    $('#doubleSlider-range').css('display','block');
                    $('#amount2').css('display','inline-block');
                    $('#slider-range').css('display','none');
                    $('#amount').css('display','none');
                    $( this ).dialog( "close" );
                }
            }
        });
    }

    //enables all layers; if layer is disabled, force enable it
    function enableAllToggle() {
        for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            // layer.enabled = true;
            let layerButton = $('#' + layer.displayName + '');
            if (layer.displayName !== "TL") {
                layer.enabled = true;
                if (!layerButton.hasClass("active")) {
                    layerButton.addClass("active");
                    layerButton.css("color", "white");
                }
            }


        }

    }

    //disables all layers; if layer is enabled, force disable it
    function closeAllToggle() {
        for (let i = 6, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            layer.enabled = false;
            let layerButton = $('#' + layer.displayName + '');
            if (layer.displayName !== "TL") {
                if (layerButton.hasClass("active")) {
                    layerButton.removeClass("active");
                    layerButton.css("color", "black");
                }
            }
        }

    }

    return {initCaseNum, subDropdown, updateCurr, onDiseaseClick, onCategory, onContinent, onNav, timelapse, pause, clearI, updateHIS, onFrom, sliderRange, doubleSlider, edit, filterOptionDialog, editDialog, enableAllToggle, closeAllToggle}
})