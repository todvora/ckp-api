var aggregator = require("../lib/parser/aggregator");
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
        var date = req.query["date"];
        if(typeof CACHE[regno] !== "undefined") {
            render(req, res, CACHE[regno]);
        } else {
            var callback = function (results) {
                CACHE[regno] = results;
                if (CACHE.length > CACHE_SIZE) {
                    CACHE.shift()
                }
                render(req, res, results);
            };
            var errorCallback = function(message, errorData) {
                console.log("error handling callback");
                console.log(message);
                console.log(errorData);
                res.send(500, { 'message': message, 'data':errorData });
            };
            aggregatorClient.search(regno, date, callback, errorCallback);
        }
    });
};