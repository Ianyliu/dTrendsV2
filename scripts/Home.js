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
    , 'cAgrosPK'
], function (newGlobe, dataAll, LayerManager, Chart, createPK, controls) {
    "use strict";

    let layerManager = new LayerManager(newGlobe);

    newGlobe.goTo(new WorldWind.Position(30.5928, 114.3055, 11000000));

    console.log(newGlobe.layers);

    createPK([dataAll.arrDate[0].Date, dataAll.arrDate[dataAll.arrDate.length - 1].Date], "Confirmed", "init");

    let fromDate = $('.fromdatepicker');
    let toDate = $('.todatepicker');
    let curDate = $("#currentdatepicker");

    //All the event listeners
    $(document).ready(function () {

        //generates layer menu
        layerManager.synchronizeLayerList();

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

        //dropdown menu for diseases and influenzas
        $("#diseaseDropdown").find("li").on("click", function (e) {
            controls.onDiseaseClick(e);
        });

        $("#agrosphereDropdown").find("li").on("click", async function (e) {
            await controls.onAgrosphereClick(e);
            $(".countries-check").click(function(){
                let toggle = this;
                togglePK(toggle.value, toggle.checked)
            });
        });

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
        let findLayerIndex = await newGlobe.layers.findIndex(ele =>  ele.displayName === 'Country_Placemarks');
        let findPKIndex = await newGlobe.layers[findLayerIndex].renderables.findIndex(pk => pk.country === countryN);

        //turn on/off the pk
        newGlobe.layers[findLayerIndex].renderables[findPKIndex].enabled = status;
        newGlobe.redraw();

        newGlobe.goTo(new WorldWind.Position(
            newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.latitude,
            newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.longitude,
            newGlobe.layers[findLayerIndex].renderables[findPKIndex].position.altitude
        ));
    }

});
