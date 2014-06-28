var request = require('request');
var uuid = require('node-uuid');

exports.logRequest = function (trackingCode, req) {

    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    };

    var createParams = function (trackingCode, req) {
        var params = {};
        params.v = "1"; // version
        params.t = "pageview"; // hit type
        params.cid = uuid.v4(); // user id, generated guid
        params.tid = trackingCode; // Tracking ID
        params.uip = getClientAddress(req); // IP address of user
        params.ua = req.headers['user-agent'];
        params.dh = req.headers['host']; // hostname
        params.dp = req.url; // path
        return params;
    };

    request.post("http://www.google-analytics.com/collect", {form: createParams(trackingCode, req)});
};