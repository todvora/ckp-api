var aggregator = require("../lib/parser/aggregator");
var analytics = require("../lib/analytics/analytics");
var config = require('../appconfig');


var aggregatorClient = new aggregator.Client();

var CACHE_SIZE = 50;
var CACHE = {};

module.exports = function (app) {
    function render(req, res, results) {
        res.set('Content-Type', "text/javascript; charset=utf-8");
        res.render('api',
            {
                data: results
            }
        );
    }

    app.get('/api', function (req, res) {
        var regno = req.query["regno"];
        analytics.logRequest(config.analyticsCode, req);
        if(typeof CACHE[regno] !== "undefined") {
            render(req, res, CACHE[regno]);
        } else {
            var callback = function (error, results) {
                if (error) {
                    res.send(500, { 'message': error.message, 'data':error.data});
                } else {
                    CACHE[regno] = results;
                    if (CACHE.length > CACHE_SIZE) {
                        CACHE.shift()
                    }
                    render(req, res, results);
                }
            };

            aggregatorClient.search(regno, callback);
        }
    });
};