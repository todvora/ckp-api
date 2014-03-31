var fs = require('fs');

module.exports.loadRoutes = function (app, folder) {
    if (!folder) {
        folder = __dirname + '/routes/';
    }
    var files = fs.readdirSync(folder);
    files.forEach(function (file) {
        fs.stat(folder + file, function (err, stat) {
            if (stat && stat.isDirectory()) {
                module.exports.loadRoutes(app, folder + file + '/');
            } else {
                var dot = file.lastIndexOf('.');
                if (file.substr(dot + 1) === 'js') {
                    var name = file.substr(0, dot);
                    console.log("Included route:" + folder + name);
                    require(folder + name)(app);
                }
            }
        });
    });
};

module.exports.getIp = function () {
    var ip = process.env.OPENSHIFT_NODEJS_IP;
    if (typeof ip === "undefined") {
        //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
        //  allows us to run/test the app locally.
        console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
        ip = "127.0.0.1";
    }

    return ip;
};

module.exports.getPort = function () {
    return process.env.OPENSHIFT_NODEJS_PORT || 8080;
};