var ckp = require("./ckp");
var calendar = require("../date/calendar");

var ckpClient = new ckp.Client();

exports.Client = function () {
    var self = this;

    function doGet(spz, calendar, curr, callback) {
        var formatCurr = curr.getDate() + "." + (curr.getMonth() + 1) + "." + curr.getFullYear();
        ckpClient.search(spz, formatCurr, function (result) {
            if(Array.isArray(result) && result.length == 0) {
                curr.setMonth(curr.getMonth() - 1);
            } else {
                var from = calendar.getUtcDate(new Date(result.date_from));
                if(result.date_till == null) {
                    var till = calendar.getUtcDate(new Date());
                } else {
                    var till = calendar.getUtcDate(new Date(result.date_till));
                }



                calendar.addInterval(from, till, result);
                curr.setTime(from.getTime());
                curr.setMonth(curr.getMonth() - 1);
            }

            if(calendar.dateFrom.getTime() > curr.getTime()) {
                callback(calendar.getAllIntervals());
            } else {
                doGet(spz, calendar, curr, callback);
            }
        });
    };

    self.search = function (spz, date, callback) {
        var curr = calendar.getUtcDate(new Date());
        var cal = new calendar.Calendar(calendar.createDate(2009,1,1), new Date(curr.getTime()));
        doGet(spz, cal, curr, callback);
    };
};