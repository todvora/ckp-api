
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var appconfig = require('./appconfig');

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));


appconfig.loadRoutes(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//  Set the environment variables we need.
var ipaddress = appconfig.getIp();
var port = appconfig.getPort();

app.set('port', port);

http.createServer(app).listen(port, ipaddress, function () {
    console.log('Express server listening on port ' + port);
});