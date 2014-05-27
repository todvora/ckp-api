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

    function plainOrArray(array) {
        if(array != null && array.length > 0) {
            if(array.length > 1) {
                return array;
            } else {
                return array[0];
            }
        }
        return null;
    }

    function parseCompanyDetails(lines) {
        var name= lines.shift();
        var tel = [];
        var email = [];
        var web = [];
        var fax = [];
        var label = null;
        lines.forEach(function (elem) {
            if (label == null) {
                label = elem;
            } else {
                if (label == "tel.:") {
                    tel.push(elem);
                } else if (label == "e-mail:") {
                    email.push(elem);
                } else if (label == "fax:") {
                    fax.push(elem);
                } else if (label == "WWW:") {
                    web.push(elem);
                }
                label = null;
            }
        });
        return {
            'name': name,
            'tel': plainOrArray(tel),
            'email': plainOrArray(email),
            'web': plainOrArray(web),
            'fax': plainOrArray(fax)
        };
    }

    var loadPage = function loadPage(url, callback) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(null, body);
            } else {
                callback({message:"Failed to load CKP.cz website."}, null);
            }
        })
    };

    self.setPageLoader = function(loader){
        loadPage = loader;
    };

    var parseRow = function($, row, url) {
        var cells = $(row).find("td");
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
            entry["company"] = parseCompanyDetails(companyLines);
            entry["url"] = url;
            return entry;
        } else {
            return null;
        }
    };

    var formatResults = function(results, url) {
        return {
            'results': results,
            'count': results.length,
            'url': url,
            'time': new Date().toISOString()
        }
    };


    self.search = function (spz, date, callback) {
        var url = constructSearchUrl(spz, date);
        loadPage(url, function (error, body) {

            if(error) {
                callback(error, null);
                return;
            }

            var $ = cheerio.load(body);

            var rows = $($("table#print_header").next().next().find("tr[class=backgr]"));

            if(rows.length <= 1) { // only header, no data
                callback(null, formatResults([], url));
            } else if(rows.length == 2) { // standard, one header and one data row
                callback(null, formatResults([parseRow($, rows[1], url)], url));

            } else { // more than two rows, inconsistent CKP data, more vehicles for same registration number
                var results = [];
                for(i = 1; i < rows.length; i++)  {
                    results.push(parseRow($, rows[i], url));
                }
                callback(null, formatResults(results, url));
            }
        });
    };


};
