var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var handlebars = require("express-handlebars");
var session = require('express-session');
var routes = require('./routes/core.routes');
var config = require("./config");
var helpers = require('handlebars-helpers')();
var expressGit = require("express-git2");
var db = require('./src/GitBoost/Sqllite/db');

var app = express();

db.init();

app.use(session({ secret: 'this is my appppppppp' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(__dirname + '/themes/' + config.app.theme));
app.set('views', __dirname + '/themes/'+ config.app.theme+'/hbs');

// view engine setup
app.set('view engine', '.hbs');
app.engine('.hbs', handlebars({ extname: '.hbs' , partialsDir: './themes/'+ config.app.theme+'/hbs' , helpers : helpers}));

/*
app.use(function (req, res, next)
{
    next();
});*/


/**
 * Load all routes in core.routes.
 */
var path = {};
for (var key in routes) {
    var controller = require('./src/GitBoost/Controller/' + routes[key].controller);

    for (var action in controller)
    {
        var url = routes[key].url;

        var renderPage = routes[key].view;
        var actionPage = controller[action];

        if (path[url] == undefined)
            path[url] = Object.assign({}, path[url], { 'render': renderPage, 'action': {} });

        path[url].action[action.toUpperCase()] = actionPage;

        app[action](url, function (req, res, next) {

            function _render(result) {
                var sessionData = Object.assign(result, { 'session': req.session });
                sessionData = Object.assign(sessionData, req.objRet);
                sessionData = Object.assign(sessionData, { 'user': req.session.user });

                if (app.get('port')  != 3000 )
                    sessionData = Object.assign(sessionData, { 'debug': true });

                res.render(path[req.route.path].render, sessionData);
            }
            var result = path[req.route.path].action[req.method](req, res, next, _render);
            if (result != undefined && result != null) {
                _render(result);
            }
        });
    }
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    if ( req.originalUrl.startsWith("/git/") == false)
    {
        res.status(err.status || 500);
        res.render('error.hbs', {
            message: err.message,
            stack : err.stack,
            error: {}
        });        
    }
    else
        next();
});


app.use("/git", expressGit.serve(config.git.repositories[0], {
	auto_init: false,
	serve_static: true,
	authorize: function (service, req, next) {
		// Authorize a service
		next();
	}
}));

app.on('post-receive', function (repo, changes) {
	// Do something after a push
	next();
});


app.set('port', process.env.PORT || 1337);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});