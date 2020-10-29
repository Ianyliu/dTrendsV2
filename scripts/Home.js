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
    ,'csvData'
    , 'cAgrosPK'
], function (newGlobe, dataAll, LayerManager, Chart, createPK, controls, csvD) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);

    newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));

    createPK([dataAll.arrDate[0].Date, dataAll.arrDate[dataAll.arrDate.length - 1].Date], "Confirmed", "init");

    let fromDate = $('.fromdatepicker');
    let toDate = $('.todatepicker');
    let curDate = $("#currentdatepicker");

    const firstL = ['Disease Projection','Food Security']
    const diseasesecondL = ["COVID-19", "Influenza A", "Influenza B"];
    const foodsecondL = ["Agrosphere","ECMWF Forecasts","Sentinel Satellite Data"]
    const thirdL = ["Country", "Crops", "Weather"]

    const influenzaA = [
        "H1N1", "H2N2", "H3N2", "H5N1", "H7N7",
        "H1N2", "H9N2", "H7N2", "H7N3", "H10N7",
        "H7N9","H6N1", "Not Determined"
    ];
    const influenzaB = [
        "Yamagata",
        "Victoria",
        "Not Determined"
    ]
    const ecmwf_forecasts = ["Temperature", "Precipitation", "Wind"]
    const dataTypes = ['Country', 'Weather Station'];
    let countryL = []

    const satellite_data = [
        "Agriculture",
        "False Color (Urban)",
        "False Color (Vegetation)",
        "Geology",
        "Moisture Index",
        "Natural Color (True Color)",
        "NDVI"
    ]
    const cropsL = [
        'Production',
        'Price',
        'Livestock',
        'Emissions',
        'Pesticides',
        'Fertilizer',
        'Yield'
    ];

    const weatherL = [
        'GraphsandWeather',
        'YearlyTemperature',
        'MonthlyTemperature',
        'YearlyPrecipitation',
        'MonthlyPrecipitation'
    ]

    for (let i = 0; i < dataTypes.length; i++) {
        for (let j = 0; j < csvD[i].length; j++) {
            if (dataTypes[i] === 'Country') {
                countryL.push(csvD[i][j].country)
            } else if (dataTypes[i] === 'Weather Station') {
            } else {
                console.log("Read layer type in error");
            }
        }
    }

    //All the event listeners
    $(document).ready(function () {

        // let parentMenu = document.getElementById("accordion");

        // controls.createFirstLayer('Disease Projection')
        // controls.createFirstLayer('Food Security')

        // for (let i = 0; i < firstL.length; i++) {
        //     controls.createFirstLayer(firstL[i])
        // }

        console.log(newGlobe.layers)

        for (let i = 0; i < firstL.length; i++) {
            controls.createFirstLayer(firstL[i]);
            if (firstL[i] === 'Disease Projection') {
                for (let j = 0; j < diseasesecondL.length; j++) {
                    controls.createSecondLayer(firstL[i],diseasesecondL[j]);
                    if (diseasesecondL[j] === "Influenza A") {
                        for (let h = 0; h < influenzaA.length; h++) {
                            controls.createThirdLayer(firstL[i],diseasesecondL[j],influenzaA[h]);
                            controls.influenza();
                        }
                    } else if (diseasesecondL[j] === "Influenza B") {
                        for (let h = 0; h < influenzaB.length; h++) {
                            controls.createThirdLayer(firstL[i],diseasesecondL[j],influenzaB[h]);
                        }
                    } else if (diseasesecondL[j] === "COVID-19") {
                        controls.createThirdLayer(firstL[i],diseasesecondL[j],"COVID-19");
                        controls.covid19();
                    } else {
                        throw error
                    }
                }
            }
            else if (firstL[i] === 'Food Security') {
                for (let j = 0; j < foodsecondL.length; j++) {
                    controls.createSecondLayer(firstL[i],foodsecondL[j]);
                    if (foodsecondL[j] === 'Agrosphere') {
                        for (let h = 0; h < thirdL.length; h++) {

                            controls.createThirdLayers(firstL[i],foodsecondL[j], thirdL[h]);
                            if (thirdL[h] === "Country") {
                                for (let k = 0; k <countryL.length; k++) {
                                    controls.createFourthLayer(firstL[i],foodsecondL[j], thirdL[h],countryL[k]);
                                }
                            } else if (thirdL[h] === "Crops") {
                                for (let k = 0; k <cropsL.length; k++) {
                                    controls.createFourthLayer(firstL[i],foodsecondL[j], thirdL[h],cropsL[k]);
                                }
                            } else if (thirdL[h] === "Weather") {
                                for (let k = 0; k <weatherL.length; k++) {
                                    controls.createFourthLayer(firstL[i],foodsecondL[j], thirdL[h],weatherL[k]);
                                }
                            } else {
                                throw error
                            }
                        }
                    } else if (foodsecondL[j] === 'ECMWF Forecasts') {
                        for (let h = 0; h < ecmwf_forecasts.length; h++) {
                            controls.createThirdLayer(firstL[i],foodsecondL[j],ecmwf_forecasts[h]);
                        }
                    } else if (foodsecondL[j] === 'Sentinel Satellite Data') {
                        for (let h = 0; h < satellite_data.length; h++) {
                            controls.createThirdLayer(firstL[i],foodsecondL[j],satellite_data[h]);
                        }
                    } else {
                        throw error
                    }
                }
            } else {
                throw error
            }
        }

        $("#FoodSecurity-Agrosphere").find("input").on("click", function (e) {
            $("#Country-alltoggle ").change(function(){
                //Shows/hides menu below, sets country placemarks' layer to .enabled and toggles all the toggles beneath it
                let toggle = this;
                let countries = document.getElementsByClassName('countries-check');
                let findLayerIndex = newGlobe.layers.findIndex(ele =>  ele.displayName === 'Country_PK');
                console.log(this.value);
                // console.log(toggle.checked);
                if (toggle.checked === true) {
                    console.log('checked');
                    $(".countries-check").prop("checked", true);
                    console.log(countries.value);
                    console.log(countries.checked);
                    togglePK(countries.value,true);
                    console.log(newGlobe.layers)
                    console.log(findLayerIndex);
                    newGlobe.layers[findLayerIndex].enabled = true;
                    document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("class","in");
                    document.getElementById("FoodSecurity-Agrosphere-Country").style.visibility = 'visible';
                    $("#FoodSecurity-Agrosphere-Country").css("height", "");
                    document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("aria-expanded","true");
                } else if(toggle.indeterminate === true) {
                    alert('Error!');
                } else if(toggle.checked === false) {
                    $(".countries-check").prop("checked", false);
                    console.log(countries.value);
                    console.log(countries.checked);
                    togglePK(countries.value,false);
                    console.log('unchecked');
                    console.log(newGlobe.layers)
                    console.log(findLayerIndex);
                    newGlobe.layers[findLayerIndex].enabled = false;

                    document.getElementById("FoodSecurity-Agrosphere-Country").style.height = '0px';
                    document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("class","collapsing");
                    document.getElementById("FoodSecurity-Agrosphere-Country").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-Agrosphere-Country").removeAttribute("class","collapsing");
                    document.getElementById("FoodSecurity-Agrosphere-Country").removeAttribute("class","in");
                    document.getElementById("FoodSecurity-Agrosphere-Country").setAttribute("aria-expanded","false");
                }
            });
            $("#Weather-alltoggle ").change(function(){
                //Shows/hides menu below, sets weather placemarks' layer to .enabled
                let toggle = this;
                // let countries = document.getElementsByClassName('countries-check');
                let findLayerIndex = newGlobe.layers.findIndex(ele =>  ele.displayName === 'Weather_Station_PK');
                console.log(this.value);
                // console.log(toggle.checked);
                if (toggle.checked === true) {
                    // console.log('checked');
                    // $(".countries-check").prop("checked", true);
                    // console.log(countries.value);
                    // console.log(countries.checked);
                    // togglePK(countries.value,true);
                    // console.log(newGlobe.layers)
                    // console.log(findLayerIndex);
                    newGlobe.layers[findLayerIndex].enabled = true;
                    document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("class","in");
                    document.getElementById("FoodSecurity-Agrosphere-Weather").style.visibility = 'visible';
                    $("#FoodSecurity-Agrosphere-Weather").css("height", "");
                    document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("aria-expanded","true");
                } else if(toggle.indeterminate === true) {
                    alert('Error!');
                } else if(toggle.checked === false) {
                    // $(".countries-check").prop("checked", false);
                    // console.log(countries.value);
                    // console.log(countries.checked);
                    // togglePK(countries.value,false);
                    // console.log('unchecked');
                    // console.log(newGlobe.layers)
                    // console.log(findLayerIndex);
                    newGlobe.layers[findLayerIndex].enabled = false;
                    document.getElementById("FoodSecurity-Agrosphere-Weather").style.height = '0px';
                    document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("class","collapsing");
                    document.getElementById("FoodSecurity-Agrosphere-Weather").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-Agrosphere-Weather").removeAttribute("class","collapsing");
                    document.getElementById("FoodSecurity-Agrosphere-Weather").removeAttribute("class","in");
                    document.getElementById("FoodSecurity-Agrosphere-Weather").setAttribute("aria-expanded","false");
                }
            });

            $("#Crops-alltoggle ").change(function(){
                //Shows/hides menu below
                let toggle = this;

                if (toggle.checked === true) {

                    document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("class","in");
                    document.getElementById("FoodSecurity-Agrosphere-Crops").style.visibility = 'visible';
                    $("#FoodSecurity-Agrosphere-Crops").css("height", "");
                    document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("aria-expanded","true");
                } else if(toggle.indeterminate === true) {
                    alert('Error!');
                } else if(toggle.checked === false) {
                    document.getElementById("FoodSecurity-Agrosphere-Crops").style.height = '0px';
                    document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("class","collapsing");
                    document.getElementById("FoodSecurity-Agrosphere-Crops").style.visibility = 'hidden';
                    document.getElementById("FoodSecurity-Agrosphere-Crops").removeAttribute("class","collapsing");
                    document.getElementById("FoodSecurity-Agrosphere-Crops").removeAttribute("class","in");
                    document.getElementById("FoodSecurity-Agrosphere-Crops").setAttribute("aria-expanded","false");
                }
            });
            $(".countries-check").change(function(){
                let toggle = this;
                console.log(this.value);
                console.log(this.checked)
                togglePK(toggle.value, toggle.checked);
            });
            console.log('clicked')
        });

        $("#FoodSecurity--Agrosphere--Country").find("input").on("click", function (e) {
            $(".countries-check").change(function(){
                let toggle = this;
                console.log(this.value);
                console.log(this.checked)
                togglePK(toggle.value, toggle.checked);
            });
            console.log('clicked')
        });

        $(".countries-check").change(function(){
            let toggle = this;
            console.log(this.value);
            console.log(this.checked)
            togglePK(toggle.value, toggle.checked);
        });

        $("#COVID-19-checkbox").on("click", function (e) {
            // if (this.checked) {
                controls.covid19();
            // }
        });

        // $("#DiseaseProjection").on("click", function (e) {
        //     controls.onDiseaseClick(e);
        // });


        $('#accordion').find("a").on('click', function(e){
            console.log(e);
            let divid = e.target.hash + '';
            let atag = this;
            let dataParent = atag.getAttribute('data-parent');

            document.getElementById(divid.substring(1)).style.visibility = 'visible';
            // console.log(divid)
            // console.log(this.nextElementSibling)

            // console.log($('#accordion').find("a"))
            // if() {
            //     console.log('hey!!!')
            //     console.log(divid.substring(1) + "-a")
            // }

            $('#accordion').find("a[aria-expanded='true']")
                .not("a[data-parent='#accordion']")
                .not(this)
                .not(document.getElementById(divid.substring(1) + "-a" ))
                .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
                .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
                .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
                .addClass('collapsed');



            let hrefvalue = $('#accordion').find("a[aria-expanded='true']")
                .not("a[data-parent='#accordion']")
                .not(this)
                .not(document.getElementById(divid.substring(1) + "-a" ))
                .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
                .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
                .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
                .attr("href");
            console.log(hrefvalue);

            if (hrefvalue !== undefined && hrefvalue !== '#FoodSecurity-Agrosphere') {
                console.log(hrefvalue);
                document.getElementById(hrefvalue.substring(1)).setAttribute("class","collapsing");
                document.getElementById(hrefvalue.substring(1)).removeAttribute("class","collapsing");
                document.getElementById(hrefvalue.substring(1)).style.visibility = 'hidden';
                document.getElementById(hrefvalue.substring(1)).removeAttribute("class","in");
                document.getElementById(hrefvalue.substring(1)).setAttribute("aria-expanded","false");
                document.getElementById(hrefvalue.substring(1)).style.height = '0px';

            }

            // $("a[aria-expanded='true']")
            //     .not("a[data-parent='#accordion']")
            //     .not(this)
            //     .not(document.getElementById(divid.substring(1) + "-a" ))
            //     .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
            //     .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
            //     .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
            //     .closest('div').removeClass('in');
            //
            // $("a[aria-expanded='true']")
            //     .not("a[data-parent='#accordion']")
            //     .not(this)
            //     .not(document.getElementById(divid.substring(1) + "-a" ))
            //     .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
            //     .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
            //     .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
            //     .next('div').removeClass('in');

            $('#accordion').find("a[aria-expanded='true']")
                .not("a[data-parent='#accordion']")
                .not(this)
                .not(document.getElementById(divid.substring(1) + "-a" ))
                .not(document.getElementById("FoodSecurity-Agrosphere-Country-a"))
                .not(document.getElementById("FoodSecurity-Agrosphere-Crops-a"))
                .not(document.getElementById("FoodSecurity-Agrosphere-Weather-a"))
                .attr('aria-expanded','false');
            // if ("a[data-toggle='collapse']" !== e) {
            //     console.log(this)
            //     console.log("not");
            // } else {
            //     console.log('yes')
            // }

            // $('.in').not(divid).removeClass('in');
                // $('.in').find('.galleryImageInput')
                // $('.in').attr('name', 'galleryImage[]');

            // $("a[aria-expanded='true']").not(this).next('div').removeClass('in');
            // $("a[aria-expanded='true']").not(this).closest('div').removeClass('in');
            // $("a[data-toggle='collapse']").not(this).next('div').removeClass('in');
            // $("a[data-toggle='collapse']").not(this).closest('div').removeClass('in');
            // $("a[data-toggle='collapse']").not(this).setAttribute('aria-expanded','false')
            // $("a[data-toggle='collapse']").not(this).next('div').removeClass('in');
            // $("div[class='in']").not(document.getElementById(divid )).not(document.getElementsByClassName('panel-group' )).removeClass('in');
            // $("div[class='in']").not(document.getElementById(divid )).removeClass('in');
            // $("div[class='in']").not(document.getElementById(divid )).setAttribute('aria-expanded','false');
            // let divID = e.getAttribute("href");
            // console.log(divID)
            // console.log(typeof divID);
            //alert('clicked');
        });


        //Initialize projection menu
        layerManager.createProjectionList();
        $("#projectionDropdown").find(" li").on("click", function (e) {
            layerManager.onProjectionClick(e);
        });

        layerManager.diseaseList();
        layerManager.agrosList();
        layerManager.synchronizeLayerList();
        layerManager.continentList();
        layerManager.categoryList();

        //sets date picker values
        fromDate.val(dataAll.arrDate[0].Date);
        toDate.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);
        curDate.val(dataAll.arrDate[dataAll.arrDate.length - 1].Date);

        //when user changes the date, globe will redraw to show the placemarks of current day
        curDate.change(function () {
            controls.updateCurr(curDate.val());
        });

        //when user changes the 'From' date, updates starting date for timelapse
        fromDate.change(function () {
            controls.onFrom();
        });

        //loads initial case numbers
        controls.initCaseNum();

        //load slider functionalities
        controls.dateSlider();
        controls.rangeSlider();
        controls.infectionSlider();
        controls.opacitySlider();

        //load dialog boxes for filter options and edit mode
        controls.filterOptionDialog();
        controls.editDialog();

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

        // //dropdown menu for diseases and influenzas
        // $("#diseaseDropdown").find("li").on("click", function (e) {
        //     controls.onDiseaseClick(e);
        // });
        //
        // $("#agrosphereDropdown").find("li").on("click", async function (e) {
        //     await controls.onAgrosphereClick(e);
        //     $(".countries-check").click(function(){
        //         let toggle = this;
        //         togglePK(toggle.value, toggle.checked)
        //     });
        // });

        //dropdown menu for placemark category
        $("#categoryList").find("li").on("click", function (e) {
            controls.onCategory(e);
        });

        //dropdown menu for continent selection
        $("#continentList").find("li").on("click", function (e) {
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


        //first click on date slider prompts filter option popup
        // $("#slider-range").one("click", function () {
        //     $("#filter").click();
        // })

        //far right of date slider overlay; opens dialog when filter is selected
        $('#filter').click(function () {
            $("#dialog").dialog("open");
        });

        //prompts date range adjustments
        $('#edit').click(function () {
            controls.edit();
        })

        $('#fullLoad').click(function () {
            controls.fullLoad();
        })

        //selecting placemark creates pop-up
        newGlobe.addEventListener("click", controls.handleMouseCLK);

    });

    async function togglePK(countryN, status){
        // use countryN to look pk
        if (countryN !== undefined || status !== undefined) {
            let findLayerIndex = await newGlobe.layers.findIndex(ele =>  ele.displayName === 'Country_PK');
            console.log(newGlobe.layers)
            console.log(findLayerIndex);
            let findPKIndex = await newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.country === countryN);

            console.log(findPKIndex);

            //turn on/off the pk
            if (findPKIndex >= 0) {
                newGlobe.layers[findLayerIndex].renderables[findPKIndex].enabled = status;
                newGlobe.redraw();


                newGlobe.goTo(new WorldWind.Position(
                    newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.latitude,
                    newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.longitude,
                    newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.altitude
                ));
            }
        } else {
            // throw error;
        }
    }

});
