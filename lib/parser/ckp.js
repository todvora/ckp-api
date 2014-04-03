var request = require('request');
var cheerio = require('cheerio');

exports.Client = function () {

    var self = this;

    function constructSearchUrl(spz, date) {
        return "https://ic.ckp.cz/ICwww/servlet?_page=resultSPZ&lngID=1&rpn=" + spz + "&date=" + date;
    }

    function parseDate(date) {
        date = date.trim();
        var parts = date.split(".");
        if (parts.length == 3) {
            return parts[2] + "-" + (parts[1]) + "-" + parts[0];
        } else {
            return null;
        }
    }

    var loadPage = function loadPage(url, callback) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            } else if (typeof error !== 'undefined') {
                throw new Error('error' + error);
            } else {
                throw new Error('error: Web responded with HTTP code ' + response.statusCode);
            }
        })
    };

    self.setPageLoader = function(loader){
        loadPage = loader;
    };


    self.search = function (spz, date, callback) {
        var url = constructSearchUrl(spz, date);
        loadPage(url, function (body) {
            var $ = cheerio.load(body);

            var cells = $($("table#print_header").next().next().find("tr")[2]).find("td");
            if (cells.length > 0) {
                var entry = {};
                entry["spz"] = $(cells[1]).text().trim();
                entry["type"] = $(cells[2]).text().trim();
                entry["manufacturer"] = $(cells[3]).text().trim();
                var companyText = $(cells[4]).text().trim().split("\r\n");
                entry["period"] = $(cells[5]).text().trim();
                var dateElem = entry["period"].split("-");
                entry["date_from"] = parseDate(dateElem[0]);
                entry["date_till"] = parseDate(dateElem[1]);
                var companyLines = [];
                companyText.forEach(function (elem) {
                    if (elem.trim().length > 0) {
                        companyLines.push(elem.trim());
                    }
                });
                entry["company"] = {
                    "name": companyLines[0],
                    "tel": companyLines[2],
                    "email": companyLines[4],
                    "web": companyLines[6]

                };
                entry["url"] = url;
                callback(entry);
            } else {
                callback([]);
            }
        });
    };


};
