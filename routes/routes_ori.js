// routes/routes.js
const mysql = require('mysql');
const serverConfig = require('../config/serverConfig');
// const geoServer = serverConfig.geoServer;

const con_DT = mysql.createConnection(serverConfig.commondb_connection);

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        // res.render('homepage.ejs');
        res.render('homepage.ejs', {
        })
    });

    app.get('/validateDate', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let validDateQuery = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrends.layers GROUP BY SUBSTRING(RID,1,10);";
        let validDateQuery = "SELECT Date From dtrends.layers GROUP BY Date order by Date;";
        con_DT.query(validDateQuery, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let allQ = "select * from dtrends.layers order by CountryName, Date";
        con_DT.query(allQ, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/timelapseAll', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        con_DT.query("SELECT Date From dtrends.layers GROUP BY Date;", function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results[results.length-1].newRID);
                res.json({"error": false, "data": results});
            }
        });

    });

    app.get('/allPKLayers', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let PKLayersQ = "select CountryName, ContinentName from dtrends.layers group by CountryName;";
        con_DT.query(PKLayersQ, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allPKs', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let pkQ = "select * from dtrends.layers where CountryName = ?;";
        con_DT.query(pkQ, req.query.country, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allLayers', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let stat1 = "SELECT LayerType, DisplayName, Color_Confirmed, SUBSTRING(RID, 1, 10) AS newRID From dtrends.layers;";
        let statAll = "SELECT LayerType, DisplayName, Color_Confirmed, Date From dtrends.layers;";

        con_DT.query(statAll, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allLayerMenu', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let stat1 = "SELECT CaseNum, LayerType, FirstLayer, SecondLayer, DisplayName, Latitude, Longitude, CityName, StateName, CountryName, ContinentName, RID, Color_Confirmed FROM dtrends.layers WHERE SUBSTRING(RID, 1, 10)= '" + controlDate + "' GROUP BY DisplayName;";
        let stat1 = "SELECT CaseNum, LayerType, FirstLayer, SecondLayer, DisplayName, Latitude, Longitude," +
            " CityName, StateName, CountryName, ContinentName, RID, Color_Confirmed FROM dtrends.layers " +
            "WHERE Date= '" + req.query.RID + "' GROUP BY DisplayName;";
        let stat2 = "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));";
        // let stat3 = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrends.layers;";
        let stat3 = "SELECT Date From dtrends.layers;";
        let stat4 = stat2 + stat1 + stat3;

        con_DT.query(stat4, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results[1]);
                res.json({"error": false, "data": results[1]});
            }
        });
    });
};