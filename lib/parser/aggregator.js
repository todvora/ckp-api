var ckp = require("./ckp");
var ckpClient = new ckp.Client();

exports.Client = function () {
    var self = this;

    function filterSame(results) {
        var filtered = [];
        var tags = [];
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            if(typeof result.company !== "undefined" ) {
                var tag = result.company.name + result.period;

                if(tags.indexOf(tag) == -1) {
                    filtered.push(result);
                    tags.push(tag);
                }
            }
        }

        return filtered;
    }

    self.search = function (spz, date, callback) {
        date = new Date();
        var results = [];
        var iterations = 48;
        for (var i = 0; i < iterations; i++) {
            (function (i) {
                var curr = new Date(date.getTime());

                curr.setMonth(date.getMonth() - i);
                var formatCurr = curr.getDate() + "." + (curr.getMonth() + 1) + "." + curr.getFullYear();
                ckpClient.search(spz, formatCurr, function (result) {

                    results.push(result);
                    if (results.length == iterations) {
                        callback(filterSame(results));
                    }
                });
            })(i);

        }
    };
};