var fs = require("fs");
var path = require("path");

var ckp = require("../../../lib/parser/ckp");


describe(__filename, function () {

    var client = new ckp.Client();

    // mock for page loading - load only static files provided with test
    client.setPageLoader(function (url, callback) {


        filename = path.resolve(__dirname, "more_contacts.html");
        fs.readFile(filename, function (err, data) {
            if (err) throw err;
            callback(data);
        });
    });


    it("should parse CKP search page with more contact details", function (done) {
        client.search("9A99330", "30.3.2014", function (results) {
            expect(results.company.name).toEqual("ALLIANZ POJIŠŤOVNA, A.S.");
            expect(results.company.tel).toEqual(["800170000", "224405111"]);
            expect(results.company.fax).toEqual("242455512");
            expect(results.company.email).toEqual(["international.claims@allianz.cz","hlaseni-motor@allianz.cz"]);
            expect(results.company.web).toEqual("http://www.allianz.cz");
            done();
        });
    });
});