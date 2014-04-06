var ckp = require("../lib/parser/ckp");
var client = new ckp.Client();
var aggregator = require("../lib/parser/aggregator");
var aggregatorClient = new aggregator.Client();


module.exports = function (app) {
    app.get('/api', function (req, res) {
        var regno = req.query["regno"];
        var date = req.query["date"];
        aggregatorClient.search(regno, date, function (results) {
            res.set('Content-Type', "text/javascript; charset=utf-8");
            res.render('api',
                {
                    data: results
                }
            );
        });
    });
}