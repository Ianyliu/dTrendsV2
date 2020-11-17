define(['./jquery-csv-1.0.11'], function () {
    "use strict";

    // load csv data
    let csvFiles = [
        '../csvdata/countries.csv',
        '../csvdata/weatherstations.csv', '../csvdata/cropAcros.csv'
    ];

    function loadCSVdata(csvList) {
        //Find the file
        let csvString = "";

        let csvData = [];
        let i = 0;
        for (i = 0; i < csvList.length; i++) {
            let csvRequest = $.ajax({
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

    function loadCSVDataArray() {
        var csvList = ['csvdata/FAOcrops.csv', 'csvdata/Atmo.csv',
            'csvdata/prices2.csv', 'csvdata/livestock.csv',
            'csvdata/emissionAll.csv', 'csvdata/Monthly_AvgData1.csv',
            'csvdata/pesti.csv', 'csvdata/ferti.csv',
            'csvdata/yield.csv', 'csvdata/refugeeout.csv'
        ];

        //Find the file
        let csvString = "";

        let csvData = [];
        let i = 0;
        //Send out request and grab the csv file content
        for (i = 0; i < csvList.length; i++) {
            var csvRequest = $.ajax({
                async: false,
                url: csvList[i],
                success: function(file_content) {
                    csvString = file_content;
                    csvData.push($.csv.toArrays(csvString));
                }
            });
        }
        return csvData;
    }

    return loadCSVdata(csvFiles)
});