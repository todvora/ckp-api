var fs = require("fs");
var path = require("path");

var ckp = require("../../../lib/parser/ckp");


describe(__filename, function () {

    var client = new ckp.Client();

    // mock for page loading - load only static files provided with test
    client.setPageLoader(function (url, callback) {


        filename = path.resolve(__dirname, "ckp_no_data.html");
        fs.readFile(filename, function (err, data) {
            if (err) throw err;
            callback(null, data);
        });
    });


    it("should parse CKP search page with no result data", function (done) {
        client.search("2K2063", "27.5.2014", function (error, results) {
            expect(results).toBeDefined();
            expect(results.count).toBe(0);
            expect(results.results.length).toBe(0);
            done();
        });
    });
});