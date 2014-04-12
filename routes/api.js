var ckp = require("../lib/parser/ckp");
var client = new ckp.Client();
var aggregator = require("../lib/parser/aggregator");
var aggregatorClient = new aggregator.Client();

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
        var date = req.query["date"];
        if(typeof CACHE[regno] !== "undefined") {
            render(req, res, CACHE[regno]);
        } else {
            aggregatorClient.search(regno, date, function (results) {
                CACHE[regno] = results;
                if(CACHE.length > 50) {
                    CACHE.shift()
                }
                render(req, res, results);
            });
        }
    });
}