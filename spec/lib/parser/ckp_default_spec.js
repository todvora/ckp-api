var fs = require("fs");
var path = require("path");

var ckp = require("../../../lib/parser/ckp");


describe(__filename, function () {

    var client = new ckp.Client();

    // mock for page loading - load only static files provided with test
    client.setPageLoader(function (url, callback) {


        filename = path.resolve(__dirname, "ckp_default.html");
        fs.readFile(filename, function (err, data) {
            if (err) throw err;
            callback(null, data);
        });
    });


    it("should parse CKP search page", function (done) {
        client.search("9A99330", "30.3.2014", function (error, results) {
            expect(error).toBeNull();
            expect(results).toBeDefined();
            console.log(error);
            console.log(results);
            expect(results.count).toBe(1);
            expect(results.results.length).toBe(1);
            var result = results.results[0];
            expect(result.spz).toEqual("9A99330");
            expect(result.type).toEqual("OSOBNÍ AUTOMOBILY");
            expect(result.manufacturer).toEqual("OPEL");
            expect(result.period).toEqual("24.3.2014 - neuvedeno");
            expect(result.date_from).toEqual("2014-3-24");
            expect(result.company.name).toEqual("ČSOB POJIŠŤOVNA, A.S.");
            expect(result.company.tel).toEqual("800100777");
            expect(result.company.email).toEqual("info@csobpoj.cz");
            expect(result.company.web).toEqual("http://www.csobpoj.cz");
            done();
        });
    });
});