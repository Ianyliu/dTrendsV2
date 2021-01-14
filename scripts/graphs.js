define([
    './globeObject'
    , './dataAll'
    , './csvData'
    , './LayerManager'
    , './covidPK'
    ,'./controls'
], function (newGlobe, dataAll,csvD, LayerManager, covidPK) {
    "use strict";

    let agriData = convertArrayToDataSet(csvD.csv2[0]);
    let atmoData = convertArrayToDataSet(csvD.csv2[1]);
    let priceData = convertArrayToDataSet(csvD.csv2[2]);
    let liveData = convertArrayToDataSet(csvD.csv2[3]);
    let emissionAgriData = convertArrayToDataSet(csvD.csv2[4]);
    let atmoDataMonthly = convertArrayToDataSet(csvD.csv2[5]);
    let pestiData = convertArrayToDataSet(csvD.csv2[6]);
    let fertiData = convertArrayToDataSet(csvD.csv2[7]);
    let yieldData = convertArrayToDataSet(csvD.csv2[8]);
    let refugeeData = convertArrayToDataSet(csvD.csv2[9]);

    /**
     * Given a csv data array, convert the segment into objects
     *
     * @param csvData - in the format of id, paramatertype, year1 value,
     * year2 value...
     * @returns {Array of objects containing the ids and an array of year-
     *          value pairs}
     */
    function convertArrayToDataSet(csvData) {
        console.log(csvData);
        //Create the temporary object
        let objectList = [];
        let i = 0;
        for (i = 1; i < csvData.length; i++) {
            //Create the object
            let tempObject = {};
            let needPushToObj;
            //First instance or can't find it
            if ((objectList.length === 0) ||
                (findDataBaseName(objectList, csvData[i][0]) === 0)) {

                //Give it a name assuming it is the first things
                tempObject.code3 = csvData[i][0]

                //Give it a start time
                tempObject.startTime = csvData[0][2];
                tempObject.endTime = csvData[0][csvData[i].length - 1];

                //Give it a data array
                tempObject.dataValues = [];

                needPushToObj = true;
            } else {
                //We found it
                tempObject = findDataBaseName(objectList, csvData[i][0]);
                needPushToObj = false;
            }
            let j = 0;
            //Data values contain a type and its year
            let dataValueObject = {};
            dataValueObject.timeValues = [];
            for (j = 1; j < csvData[i].length; j++) {
                //Attach things to the tempObject dataValues
                if (j === 1) {
                    //Its the type name
                    dataValueObject.typeName = csvData[i][1];
                } else {
                    //Append the item to the value
                    let timeValue = {};
                    timeValue.year = csvData[0][j];

                    //Check if the data exist
                    let value = csvData[i][j];
                    if (value !== "") {
                        //Parse it
                        timeValue.value = parseFloat(value);
                    } else {
                        timeValue.value = "";
                    }
                    dataValueObject.timeValues.push(timeValue);
                }
            }
            tempObject.dataValues.push(dataValueObject);
            //Check to push to obj list
            if (needPushToObj) {
                objectList.push(tempObject);
            }
        }
        return objectList;
    }

    function findDataBaseName(inputArray, name) {
        let i = 0;
        for (i = 0; i < inputArray.length; i++) {
            //Find if the name exists
            if (inputArray[i].code3 === name) {
                return inputArray[i];
            }
        }
        return 0;
    }

})