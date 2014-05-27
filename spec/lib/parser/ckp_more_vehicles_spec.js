var fs = require("fs");
var path = require("path");

var ckp = require("../../../lib/parser/ckp");


describe(__filename, function () {

    var client = new ckp.Client();

    // mock for page loading - load only static files provided with test
    client.setPageLoader(function (url, callback) {


        filename = path.resolve(__dirname, "ckp_more_vehicles.html");
        fs.readFile(filename, function (err, data) {
            if (err) throw err;
            callback(data);
        });
    });


    it("should parse CKP search page with inconsistent data - more vehicles, same reg. number", function (done) {
        client.search("5P55555", "23.5.2014", function (results) {
            expect(results.length).toEqual(3);

            var first = results[0];
            expect(first.spz).toEqual("5P55555");
            expect(first.manufacturer).toEqual("PEUGEOT");
            expect(first.type).toEqual("OSOBNÍ AUTOMOBILY");
            expect(first.period).toEqual("1.8.2013 - neuvedeno");
            expect(first.company.name).toEqual("ČSOB POJIŠŤOVNA, A.S.");
            expect(first.company.tel).toEqual("800100777");
            expect(first.company.email).toEqual("info@csobpoj.cz");
            expect(first.company.web).toEqual("http://www.csobpoj.cz");
            expect(first.company.fax).toBeNull();
            expect(first.url).toEqual("https://ic.ckp.cz/ICwww/servlet?_page=resultSPZ&lngID=1&rpn=5P55555&date=23.5.2014");

            var second = results[1];
            expect(second.spz).toEqual("5P55555");
            expect(second.manufacturer).toEqual("ŠKODA");
            expect(second.type).toEqual("OSOBNÍ AUTOMOBILY");
            expect(second.spz).toEqual("5P55555");
            expect(second.period).toEqual("6.6.2012 - neuvedeno");
            expect(second.company.name).toEqual("ČESKÁ PODNIKATELSKÁ POJIŠŤOVNA, A.S., VIENNA INSURANCE GROUP");
            expect(second.company.tel).toEqual("841444555");
            expect(second.company.email).toEqual("info@cpp.cz");
            expect(second.company.web).toEqual("http://www.cpp.cz");
            expect(second.company.fax).toBeNull();
            expect(second.url).toEqual("https://ic.ckp.cz/ICwww/servlet?_page=resultSPZ&lngID=1&rpn=5P55555&date=23.5.2014");

            var third = results[2];
            expect(third.spz).toEqual("5P55555");
            expect(third.manufacturer).toEqual("MERCEDES-BENZ");
            expect(third.type).toEqual("OSOBNÍ AUTOMOBILY");
            expect(third.spz).toEqual("5P55555");
            expect(third.period).toEqual("10.10.2012 - 9.10.2014");
            expect(third.company.name).toEqual("KOOPERATIVA, POJIŠŤOVNA, A.S., VIENNA INSURANCE GROUP");
            expect(third.company.tel).toEqual(['841105105', '272112111']);
            expect(third.company.email).toEqual(['info@koop.cz', 'greencard@koop.cz']);
            expect(third.company.web).toEqual("http://www.koop.cz");
            expect(third.company.fax).toEqual("272112148");
            expect(third.url).toEqual("https://ic.ckp.cz/ICwww/servlet?_page=resultSPZ&lngID=1&rpn=5P55555&date=23.5.2014");

            done();
        });
    });
});

