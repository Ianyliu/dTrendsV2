define(['./WorldWindShim'], function (WorldWind) {

    let arrDate = [];
    // let arrAll = [];
    let arrCountry = [];

    // collect all the valid dates
    $.ajax({
        url: '/validateDate',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            if (!resp.error) {
                arrDate = resp.data;
            }
        }
    });

    // collect all placemark data
    $.ajax({
        url: '/allCountry',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (resp) {
            if (!resp.error) {
                arrCountry = resp.data;
            }
        }
    });

    return {arrDate, arrCountry}
});
