var ckp = require("../lib/parser/ckp");
var client = new ckp.Client();

module.exports = function (app) {
    app.get('/api', function (req, res) {
        var regno = req.query["regno"];
        var date = req.query["date"];
        client.search(regno, date, function (results) {
            res.set('Content-Type', "text/javascript; charset=utf-8");
            res.render('api',
                {
                    data: results
                }
            );
        });
    });
}