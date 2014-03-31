var fs = require("fs");
var path = require("path");

var ckp = require("../../../lib/parser/ckp");


describe(__filename, function () {

    var client = new ckp.Client();

    // mock for page loading - load only static files provided with test
    client.setPageLoader(function (url, callback) {


        filename = path.resolve(__dirname, "ckp_page.html");
        fs.readFile(filename, function (err, data) {
            if (err) throw err;
            callback(data);
        });
    });


    it("should parse CKP search page", function (done) {
        client.search("9A99330", "30.3.2014", function (results) {
            expect(results.spz).toEqual("9A99330");
            expect(results.type).toEqual("OSOBNÍ AUTOMOBILY");
            expect(results.manufacturer).toEqual("OPEL");
            expect(results.period).toEqual("24.3.2014 - neuvedeno");
            expect(results.company.name).toEqual("ČSOB POJIŠŤOVNA, A.S.");
            expect(results.company.tel).toEqual("800100777");
            expect(results.company.email).toEqual("info@csobpoj.cz");
            expect(results.company.web).toEqual("http://www.csobpoj.cz");
            done();
        });
    });
});