/**
 * Created by sajibsarkar on 11/18/17.
 */
'use strict';

var  _ = require('lodash');
var fs = require('fs');
var dataParser = require('../services/dataParser');

module.exports.upload = function (req, res, params, next) {

    let timseStart = Date.now();

    let loanFile, serviceFile, lperFile;
    if(params.loanFile && params.serviceFile){
         loanFile   = decodeURIComponent(params.loanFile); //new  Buffer(params.loanFile, 'base64');
         serviceFile = params.serviceFile.map((_serviceFile)=> decodeURIComponent(_serviceFile));
    }

    if(params.lperFile){
        lperFile = params.lperFile.map((_lperFile)=> decodeURIComponent(_lperFile));
    }

    if (loanFile && serviceFile){
        dataParser.processInputFiles({loanFile: loanFile, serviceFile: serviceFile, lperFile: lperFile}).then(function (investmentJson) {
           // next(new Error('Test  Error'));

            console.log('Total time required ', Date.now() - timseStart, 'ms');

            res.json(investmentJson);
            setImmediate(() => {
                try {
                    global.gc();
                } catch (e) {
                    console.log("You must run program with 'node --expose-gc index.js' or 'npm start'");

                }
                loanFile.path  && fs.unlinkSync(loanFile.path);
                serviceFile.path && fs.unlinkSync(serviceFile.path);
            });
        }).catch(err => {
            console.log('Error occurred ',  err);
            setImmediate(() => {
                loanFile.path  && fs.unlinkSync(loanFile.path);
                serviceFile.path && fs.unlinkSync(serviceFile.path);
            });
            next(err);
        });
    } else {
        next(new Error('Invalid Upload  Files'));
    }

};
