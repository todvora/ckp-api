var ckp = require("./ckp");
var calendar = require("../date/calendar");

var ckpClient = new ckp.Client();

exports.Client = function () {
    var self = this;

    var isObject = function(obj) {
        return obj === Object(obj);
    };

    function doGet(spz, calendar, curr, callback) {
        var formatCurr = curr.getDate() + "." + (curr.getMonth() + 1) + "." + curr.getFullYear();
        ckpClient.search(spz, formatCurr, function (error, result) {

            if(error) {
                callback(error, null);
                return;
            }


            if(!isObject(result)) {
                callback({message: 'Unknown error'}, null);
                return;
            }

            if(result.count == 0) {
                curr.setMonth(curr.getMonth() - 1);
            } else if(result.count == 1) {

                var vehicleInfo = result.results[0];

                var from = calendar.getUtcDate(new Date(vehicleInfo.date_from));
                var till = null;
                if(vehicleInfo.date_till == null) {
                    till = calendar.getUtcDate(new Date());
                } else {
                    till = calendar.getUtcDate(new Date(vehicleInfo.date_till));
                }

                calendar.addInterval(from, till, vehicleInfo);
                curr.setTime(from.getTime());
                curr.setMonth(curr.getMonth() - 1);
            } else if(result.count > 1) {
                callback({message: 'Result contains more than one vehicle', 'data': result}, null);
                return;
            }

            if(calendar.dateFrom.getTime() > curr.getTime()) {
                callback(null, calendar.getAllIntervals());
            } else {
                doGet(spz, calendar, curr, callback);
            }
        });
    }

    self.search = function (spz, date, callback) {
        var curr = calendar.getUtcDate(new Date());
        var cal = new calendar.Calendar(calendar.createDate(2009,1,1), new Date(curr.getTime()));
        doGet(spz, cal, curr, callback);
    };
};