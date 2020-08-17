requirejs.config({
    waitSeconds: 0,
    baseUrl: "scripts"
});

requirejs([
    'globeObject'
    , 'dataAll'
    , 'LayerManager'
    , '3rdPartyLibs/Chart-2.9.3.min.js'
    , 'createPK'
    , 'controls'
    //, 'initPL'
], function (newGlobe, dataAll, LayerManager, Chart, createPK, controls) {
    "use strict";

    // dataAll.arrCountry.forEach(function (ele, index) {
    //     let myWorker = new Worker("../scripts/workerPL.js");
    //
    //     myWorker.onmessage = function (event) {
    //         newGlobe.addLayer(event.data);
    //         newGlobe.redraw();
    //     };
    //
    //     myWorker.postMessage({
    //         currentDate: dataAll.arrDate[dataAll.arrDate.length - 1].Date,
    //         Country: ele.CountryName
    //     }); // Start the worker.
    // });

    // let myWorker = new Worker("../scripts/customPL_Worker.js");
    //
    // myWorker.onmessage = function (event) {
    //     console.log("Yes");
    //     if (event.data === 'Worker Loaded') {
    //         postMessage('Hi');
    //     }
    // };



    let layerManager = new LayerManager(newGlobe);

    newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));

    // let l;
    // let play = false;
    //
    // let categoryS = "Confirmed Cases";
    let fromDate = $('.fromdatepicker');
    let toDate = $('.todatepicker');
    let curDate = $("#currentdatepicker");
    // let i = 0;
    //
    // let numC = 0;
    // let numD = 0;
    // let numR = 0;
    // let numA = 0;

    //All the event listeners
    $(document).ready(function () {

        //generates layer menu
        layerManager.synchronizeLayerList();

        //sets date picker values
        fromDate.val(dataAll.arrDate[0].Date);
        toDate.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
        curDate.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);

        //loads initial case numbers
        controls.initCaseNum();

        //overlays sub dropdown menus
        $('.dropdown-submenu a.test').on("click", function(e) {
            $(this).next('ul').toggle();

            e.stopPropagation();
            e.preventDefault();
        })

        controls.subDropdown();

        //sets date picker format; disables all dates without data available
        flatpickr(".date", {
            defaultDate: dataAll.arrDate[dataAll.arrDate.length - 1].Date,
            minDate: dataAll.arrDate[0].Date,
            maxDate: dataAll.arrDate[dataAll.arrDate.length - 1].Date,
            inline: false,
            dateFormat: "Y-m-d",
            time_24hr: true
        });

        $("#popover").popover({html: true, placement: "top", trigger: "hover"});

        //resets the globe to original position and placemarks
        $('#globeOrigin').click(function () {
            controls.enableAllToggle();
            newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));
        });

        //enables all placemarks
        $('#refresh').click(function () {
            controls.enableAllToggle();
        });

        //disables all placemarks
        $('#clear').click(function () {
            controls.closeAllToggle();
        });

        //enables and disables the navigation controls
        $('#navControls').click(function () {
            controls.onNav();
        })

        //dropdown menu for diseases and influenzas
        $("#diseaseDropdown").find(" li").on("click", function (e) {
            controls.onDiseaseClick(e);
        });

        //dropdown menu for placemark category
        $("#categoryList").find(" li").on("click", function (e) {
            controls.onCategory(e);
        });

        //dropdown menu for continent selection
        $("#continentList").find(" li").on("click", function (e) {
            controls.onContinent(e);
        });

        //timelapse: start button
        $('#toggleTL').click(function () {
            $('#pauseTL').show();
            $('#toggleTL').hide();

            curDate.val(fromDate.val());

            controls.timelapse();
        });

        //timelapse: stop button
        $('#stopTL').click(function () {
            controls.clearI();

            $('#playTL').hide();
            $('#pauseTL').hide();
            $('#toggleTL').show();

            curDate.val(fromDate.val());
        });

        //timelapse: pause button
        $('#pauseTL').click(function () {
            $('#pauseTL').hide();
            $('#playTL').show();

            controls.pause();
        });

        //timelapse: play button
        $('#playTL').click(function () {
            $('#pauseTL').show();
            $('#playTL').hide();

            controls.pause();
        });

        let setOpacity = function (value) {
            newGlobe.Opacity = value;
            newGlobe.surfaceOpacity = newGlobe.Opacity;
        };

        //load slider functionalities
        controls.sliderRange();
        controls.doubleSlider();

        //first click on date slider prompts filter option popup
        $("#slider-range").one("click", function () {
            $("#filter").click();
        })

        //far right of date slider overlay; opens dialog when filter is selected
        $('#filter').click(function () {
            $("#dialog").dialog("open");
        });

        //prompts date range adjustments
        $('#edit').click(function () {
            controls.edit();
        })

        $('#fullLoad').click(function () {
            if ($('input#fullLoad').is(':checked')) {
                $('.filterFrom').val(dataAll.arrDate[0].Date);
                $('.filterTo').val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
                $('.filterFrom, .filterTo').css('background-color', 'lightgray');
                $('.filterFrom, .filterTo').prop('disabled', true);
                $('#filterContinents').val('all_continents');
                $('#filterContinents').prop('disabled', true);
            } else {
                $('.filterFrom, .filterTo').css('background-color', 'white');
                $('.filterFrom, .filterTo').prop('disabled', false);
                $('#filterContinents').prop('disabled', false);
            }
        })

        $( function() {
            $( "#hInfectionSlider" ).slider({
                // animate: 3000,
                // range: true,
                min: 5,
                max: 300,
                values: [5,300],
                slide: function( event, ui ) {
                    // console.log("slider");
                    $( "#hInfectionsValue" ).text( ui.values[0] + " to " + ui.values[1] + " Locations");

                    updateHIS(ui.values[0], ui.values[1]);
                }
            });
            $( "#hInfectionsValue" ).text($("#hInfectionSlider").slider("values", 0) + " to " + $("#hInfectionsSlider").slider("values", 1) + " Locations");
        } );

        $( function() {
            $( "#opacitySlider" ).slider({
                value: 100,
                animate: true,
                slide: function( event, ui ) {
                    // console.log("slider");
                    $( "#opacitySliderValue" ).text(ui.value + "% opacity");
                },
                stop: function(event, ui) {
                    setOpacity(ui.value / 100);
                }
            });

        } );

        // $("#slider-range").change(function () {
        //     console.log("change");
        //     updateCurr($( "#amount" ).val());
        // });

        //now when user picks the date, globe will redraw to show the placemarks of that day
        $('#currentdatepicker').change(function () {
            updateCurr(curDate.val());
        });

        $('.fromdatepicker').change(function () {
            onFrom();
        });


        // newGlobe.addEventListener("mousemove", handleMouseMove);

        newGlobe.addEventListener("click", handleMouseCLK);


    });

    let onCurrent = function () {
        let currentD = $("#currentdatepicker").val();

        numC = 0;
        numD = 0;
        numR = 0;
        numA = 0;

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

        $('#conConfirmed').text(numC);
        $('#conDeaths').text(numD);
        $('#conRecoveries').text(numR);
        $('#conActive').text(numA);
    };

    let onFrom = function () {
        for(let j = 0; j < dataAll.arrDate.length -1; j++) {
            if (dataAll.arrDate[j].Date === fromDate.val()) {
                i = j;
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

        //turn off all the placemark layers, and then turn on the layers with continent name selected.

        let letLong = [
            {cont: 'North America', lat: 40.7306, long: -73.9352},
            {cont: 'South America', lat: -14.235, long: -51.9253},
            {cont: 'Asia', lat: 30.9756, long: 112.2707},
            {cont: 'Europe', lat: 51, long: 9},
            {cont: 'Africa', lat: 9.082, long: 8.6753},
            {cont: 'Oceania', lat: -37.8136, long: 144.9631},
            {cont: 'All Continents', lat: 30.9756, long: 112.2707}
        ];

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

    //under first left tab; used to switch between diseases/influenzas
    let onDiseaseClick = function (event) {
        let projectionName = event.target.innerText || event.target.innerHTML;
        $("#diseaseDropdown").find("button").html(projectionName + ' <span class="caret"></span>');

        if (projectionName === "COVID-19") {
            covid19();
        } else {
            influenzaA();
        }
        // newGlobe.redraw();
    };

    let updateCurr = function (currentD) {
        
        numC = 0;
        numD = 0;
        numR = 0;
        numA = 0;

        curDate.val(currentD);
        //createPK([currentD,currentD], categoryS, "not init")

        newGlobe.layers.forEach(function (elem, index) {
            if (elem instanceof WorldWind.RenderableLayer) {
                elem.renderables.forEach(function (d) {
                    if (d instanceof WorldWind.Placemark) {
                        if (d.userProperties.Date == currentD) {
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

        $('#conConfirmed').text(numC);
        $('#conDeaths').text(numD);
        $('#conRecoveries').text(numR);
        $('#conActive').text(numA);
    }

    let updateHIS = function (v1, v2) {
         let sortLayers = [];
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

        for (let k = 0; k < sortLayers.length; k++) {
            if (k >= v1 && k <= v2) {
                sortLayers[k].enabled = true;
            } else {
                sortLayers[k].enabled = false;
            }
        }
    }

    let timelapse = function () {
        l = setInterval(function () {
            if (!play) {
                // console.log("start");
                $('#currentdatepicker').val(dataAll.arrDate[i].Date);
                let val = new Date(dataAll.arrDate[i].Date).getTime()/1000;
                $( "#slider-range" ).slider( "value", val );
                $( "#amount" ).val(dataAll.arrDate[i].Date);
                // console.log(val);
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
                if (toDate.val() === dataAll.arrDate[i].Date) {
                    $('#currentdatepicker').val(dataAll.arrDate[i].Date);
                    // console.log(dataAll.arrDate[i].Date);
                    // console.log("end");
                    $('#pauseTL').hide();
                    $('#toggleTL').show();
                    clearInterval(l)
                }
            }


        }, 1000)
    };

    let pause = function () {
        play = !play;
    };

    let covid19 = function () {
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

    let influenzaA = function () {
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

    let influenzaB = function () {
        for (let i = 0, len = newGlobe.layers.length; i < len; i++) {
            let layer = newGlobe.layers[i];
            let layerButton = $('#' + layer.displayName + '');
            if (layer.layerType === "H_PKLayer" || layer.layerType === "INB_PKLayer") {
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
                // console.log(layerButton);
            }


        }

    }

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
                // console.log(layerButton);
            }
        }

    }

    function handleMouseCLK(e) {
        let x = e.clientX,
            y = e.clientY;
        let pickListCLK = newGlobe.pick(newGlobe.canvasCoordinates(x, y));

        pickListCLK.objects.forEach(function (value) {
            let pickedPM = value.userObject;
            if (pickedPM instanceof WorldWind.Placemark) {
                sitePopUp(pickedPM);
            }
        })
    }

    function sitePopUp(PM) {
        let popupBodyItem = $("#popupBody");
        popupBodyItem.children().remove();

        let popupBodyName = $('<p class="site-name"><h4>' + PM.userProperties.dName + '</h4></p>');
        let popupBodyDesc = $('<p class="site-description">' + "Total Cases = Active + Deceased + Recoveries" + '</p><br>');
        let br = $('<br><br>');

        //add buttons here
        let button0 = document.createElement("button");
        button0.id = button0.value = "1";
        button0.textContent = "Current";
        button0.className = "chartsB";
        button0.onclick = function () {chartDFun(button0, PM)};
        let button1 = document.createElement("button");
        button1.id = button1.value = "7";
        button1.textContent = "Past 7 Days";
        button1.className = "chartsB";
        button1.onclick = function () {chartDFun(button1, PM)};
        let button2 = document.createElement("button");
        button2.id = button2.value = "14";
        button2.textContent = "Past 2 Weeks";
        button2.className = "chartsB";
        button2.onclick = function () {chartDFun(button2, PM)};
        let button3 = document.createElement("button");
        button3.id = button3.value = "30";
        button3.textContent = "Past 1 Month";
        button3.className = "chartsB";
        button3.onclick = function () {chartDFun(button3, PM)};
        let button4 = document.createElement("button");
        button4.id = button4.value = "63";
        button4.textContent = "Past 2 Months";
        button4.className = "chartsB";
        button4.onclick = function () {chartDFun(button4, PM)};

        popupBodyItem.append(popupBodyName);
        popupBodyItem.append(popupBodyDesc);
        popupBodyItem.append(button0);
        popupBodyItem.append(button1);
        popupBodyItem.append(button2);
        popupBodyItem.append(button3);
        popupBodyItem.append(button4);
        popupBodyItem.append(br);

        let modal = document.getElementById('popupBox');
        let span = document.getElementById('closeIt');

        modal.style.display = "block";

        span.onclick = function () {
            modal.style.display = "none";
        };

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }

        //load chart data
        button0.click();
    }

    function chartDFun(objButton, PM) {
        // get button value to reset chart duration time
        let pDate = dataAll.arrDate[dataAll.arrDate.length-1].Date;
        let d0 = new Date(""+ pDate + "")
        let dFrom = $.format.date(d0.setDate(d0.getDate() - objButton.id + 1), "yyyy-MM-dd");
        let dTo = dataAll.arrDate[dataAll.arrDate.length - 1].Date;

        // disable this button and enable previous button disabled
        $(".chartsB").prop('disabled', false);
        $("#"+objButton.value).prop('disabled', true);
        $("#chartText").html(objButton.textContent);

        // set label date value
        let lArr = [];
        let d1 = new Date("" + pDate + "");

        if (objButton.value === "1") {
            lArr.push(pDate);
        } else if (objButton.value === "7") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 5), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
            )
        } else if (objButton.value === "14") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 12), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd")
            )
        } else if (objButton.value === "30") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 26), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
            )
        } else if (objButton.value === "63") {
            lArr.push($.format.date(d1.setDate(d1.getDate() - 61), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6 ), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
                ,$.format.date(d1.setDate(d1.getDate() + 1), "MM-dd") + "_" + $.format.date(d1.setDate(d1.getDate() + 6), "MM-dd")
            )
        }

        // refresh the chart canvas and data
        let cCanvas = document.getElementById("stackedChart");
        if (!!cCanvas) {
            cCanvas.remove();
            cCanvas = document.createElement("canvas");
            cCanvas.id = "stackedChart";
            cCanvas.height = 300;
        } else {
            cCanvas = document.createElement("canvas");
            cCanvas.id = "stackedChart";
            cCanvas.height = 300;
        }

        let ctx = cCanvas.getContext('2d');
        let popupBody = $("#popupBody");
        popupBody.append(cCanvas);

        $.ajax({
            url: '/chartData',
            type: 'GET',
            data: {dateFrom: dFrom, dateTo: dTo, dName: PM.userProperties.dName,},
            dataType: 'json',
            async: false,
            success: function (resp) {
                if (!resp.error) {
                    //let cArr = [];
                    let dArr = [];
                    let rArr = [];
                    let aArr = [];
                    //let colorA = [];

                    // console.log(resp.data.length);
                    for (i = 0; i < resp.data.length -1; i++) {
                        //cArr.push(resp.data[i].CaseNum);
                        dArr.push(resp.data[i].DeathNum);
                        rArr.push(resp.data[i].RecovNum);
                        aArr.push(resp.data[i].CaseNum - resp.data[i].DeathNum - resp.data[i].RecovNum);
                        /*if (i !== 0 && aArr[i-1] < aArr[i]) {
                            colorA.push("#9a0000");
                        } else if (i !== 0 && aArr[i-1] > aArr[i]) {
                            colorA.push("#1ee31e");
                        } else {
                            colorA.push("#2e5468");
                        }*/
                    }

                    let myChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: lArr,
                            datasets: [
                             /*{
                                label: 'Confirmed Cases',
                                backgroundColor: "#caf270",
                                data: cArr,
                            }, {
                                label: 'Increase in Active Cases',
                                backgroundColor: "#9a0000"
                            }*/
                            {
                                label: 'Active Cases',
                                backgroundColor: "#45c498",
                                data: aArr,
                            }, {
                                label: 'Deceased',
                                backgroundColor: "#ead04b",
                                data: dArr,
                            }, {
                                label: 'Recoveries',
                                backgroundColor: "#035992",
                                data: rArr,
                            }],
                        },
                        options: {
                            tooltips: {
                                displayColors: true,
                                callbacks:{
                                    mode: 'x',
                                },
                            },
                            scales: {
                                xAxes: [{
                                    stacked: true,
                                    gridLines: {
                                        display: false,
                                    }
                                }],
                                yAxes: [{
                                    stacked: true,
                                    ticks: {
                                        beginAtZero: true,
                                    },
                                    type: 'linear',
                                }]
                            },
                            responsive: true,
                            maintainAspectRatio: true,
                            legend: { position: 'bottom' },
                        }
                    })
                }
            }
        });
    }
});
