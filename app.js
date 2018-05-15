/**
 * Created by sajibsarkar on 4/13/17.
 */
'use strict';


//var Env = require('./ENV');
//Env.loadEnvProperties();
process.env.TZ = "America/New_York";
const url = require('url');


const express = require('express'),
    _ = require('lodash'),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    methodOverride = require('method-override'),
    compress = require('compression'),
    morgan = require('morgan'),
    helmet = require('helmet'),
    multer = require('multer'),
    upload = multer({dest: "./server/uploads/", preservePath:true});

let app = module.exports = express();

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
}


app.use(helmet());
app.disable('x-powered-by');
app.disable('X-XSS-Protection');
app.disable('csp');
app.set('port', process.env.PORT || 4444);
app.use(express.static(path.join(__dirname, 'dist')));
app.use(morgan('dev'));
app.use(compress());
app.use(bodyParser.urlencoded({limit: '100mb', type: 'application/x-www-form-urlencoded', extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '10mb', type: 'application/json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

const webpackOptions = {
    contentBase: './dist',
    hot: true,
    host: 'localhost'
};

//webpackDevServer.addDevServerEntrypoints(config, webpackOptions);

/*
let compiler = webpack(webPackconfig);
app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webPackconfig.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));
*/


app.post('/api/files/upload', upload.any(), function (req, res, next) {
    _processApiRequest(req, res, 'files', 'upload', true, next);
});

app.get('/api/:service/', function (req, res, next) {
    _processApiRequest(req, res, req.params.service, 'query', false, next);
});

app.post('/api/:service/', function (req, res, next) {
    _processApiRequest(req, res, req.params.service, 'create', true, next);
});

app.get('/api/:service/:method', function (req, res, next) {
    _processApiRequest(req, res, req.params.service, req.params.method, false, next);
});

app.post('/api/:service/:method', function (req, res, next) {
    _processApiRequest(req, res, req.params.service, req.params.method, true, next);
});
// Redirect all non api requests to the index
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.get('*', function (req, res) {
    if (req.xhr) {
        res.status(404);
        res.json({message: 'Requested Resource  does not exists!'});
    } else {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});


app.use(function (err, req, res, next) {
    if (!res.headersSent) {
      console.log("Error : ", err);
        res.status(400).json({code: err.code, message: err.message || 'Unexpected error occurred.'});
    }
});

let httpClient = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


/***
 * Handling Daylight Saving
 * @returns {number}
 */

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};


function _processApiRequest(req, res, service, method, isPostRequest, next) {
    try {

        let parameters = url.parse(req.url, true).query;

        //Handle get and post parameters the same
        if (isPostRequest === true) {
            if (req.body) {
                parameters = req.body.data ? req.body.data : req.body;
            }
        }

        if (typeof parameters === 'string') {
            parameters = JSON.parse(parameters, true);
        }
        let apiHandler = require('./server/api/' + service);
        try {
            if (apiHandler && apiHandler[method]) {
                apiHandler[method](req, res, parameters, next);
            }
        } catch (ex) {
            next(ex);
        }
    } catch (err) {
        console.log('error at _processApiRequest', err);
        res.status(404).send({
            success: false
        });
    }
}
