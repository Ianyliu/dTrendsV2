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

    // let firstDate, lastSecondDate;
    app.get('/validateDate', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let validDateQuery = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19 GROUP BY SUBSTRING(RID,1,10);";
        let validDateQuery = "SELECT Date From dtrends.covid_19 GROUP BY Date order by Date;";
        con_DT.query(validDateQuery, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // firstDate = results[0].Date;
                // lastSecondDate = results[results.length - 1].Date;

                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/rr', function (req, res) {
        console.log("function")
        res.setHeader("Access-Control-Allow-Origin", "*");

        let countryQ = "select * from dtrends.continent where CountryName= ?";
        con_DT.query(countryQ, [req.query.country], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false,  "data": results});
            }
        });
    });

    app.get('/1dData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let oneDaysQ = "select * from dtrends.covid_19 where Date >= ? AND Date <= ? order by CountryName, Date;";
        con_DT.query(oneDaysQ, [req.query.date[0], req.query.date[1]], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/majorData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let majorQ = "select * from dtrends.covid_19 where Date < ? order by CountryName, Date";
        con_DT.query(majorQ, req.query.Date, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/lastData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let lastQ = "select * from dtrends.covid_19 where Date = ? order by CountryName, Date";
        con_DT.query(lastQ, req.query.Date, function (err, results) {
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

        let allQ = "select * from dtrends.covid_19 order by CountryName, Date";
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

        con_DT.query("SELECT Date From dtrends.covid_19 GROUP BY Date;", function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results[results.length-1].newRID);
                res.json({"error": false, "data": results});
            }
        });

    });

    app.get('/allCountry', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        let countryQ = "select CountryName, ContinentName from dtrends.covid_19 group by CountryName;";
        con_DT.query(countryQ, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                // console.log(results);
                res.json({"error": false, "data": results});
            }
        });
    });

    app.post('/byCountry', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        // console.log(req.body);

        let pkQ = "select * from dtrends.covid_19 where CountryName = ?;";
        con_DT.query(pkQ, req.body.country, function (err, results) {
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

        // let stat1 = "SELECT LayerType, DisplayName, Color_Confirmed, SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19;";
        let statAll = "SELECT LayerType, DisplayName, Color_Confirmed, Date From dtrends.covid_19;";

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

    app.get('/chartData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        let dName = req.query.dName;
        let dTo = req.query.dateTo;
        let dFrom = req.query.dateFrom;

        // let stat1 = "SELECT LayerType, DisplayName, Color_Confirmed, SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19;";
        let statAll = "SELECT * From dtrends.covid_19 WHERE DisplayName = '" + dName + "' AND Date >= '" + dFrom + "' AND Date <= '" + dTo + "';";

        con_DT.query(statAll, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "data": results});
            }
        });
    });

    app.get('/allLayerMenu', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        // let stat1 = "SELECT CaseNum, LayerType, FirstLayer, SecondLayer, DisplayName, Latitude, Longitude, CityName, StateName, CountryName, ContinentName, RID, Color_Confirmed FROM dtrends.covid_19 WHERE SUBSTRING(RID, 1, 10)= '" + controlDate + "' GROUP BY DisplayName;";
        let stat1 = "SELECT CaseNum, LayerType, FirstLayer, SecondLayer, DisplayName, Latitude, Longitude," +
            " CityName, StateName, CountryName, ContinentName, RID, Color_Confirmed FROM dtrends.covid_19 " +
            "WHERE Date= '" + req.query.RID + "' GROUP BY DisplayName;";
        let stat2 = "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));";
        // let stat3 = "SELECT SUBSTRING(RID, 1, 10) AS newRID From dtrends.covid_19;";
        let stat3 = "SELECT Date From dtrends.covid_19;";
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