define(['./jquery-csv-1.0.11'], function () {
    "use strict";

    // load csv data
    let csvFiles = [
        '../csvdata/countries.csv',
        '../csvdata/weatherstations.csv',
        '../csvdata/cropAcros.csv'
    ];

    function loadCSVdata(csvList) {
        //Find the file
        let csvString = "";
        let csvData = [];
        for (let i = 0; i < csvList.length; i++) {
            $.ajax({
                async: false,
                url: csvList[i],
                success: function (file_content) {
                    csvString = file_content;
                    csvData.push($.csv.toObjects(csvString));
                    // console.log($.csv.toObjects(csvString))
                }
            });
        }

        return csvData;
    }

    return loadCSVdata(csvFiles)
});