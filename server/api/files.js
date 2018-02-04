/**
 * Created by sajibsarkar on 11/18/17.
 */
'use strict';

var  _ = require('lodash');
var fs = require('fs');
var path  = require('path');
var dataParser = require('../services/dataParser');
var awsService = require('../services/awsService');

module.exports.upload = function (req, res, params, next) {

    let loanFile, serviceFile;
    if(params.loanFile && params.serviceFile){
         loanFile   = decodeURIComponent(params.loanFile); //new  Buffer(params.loanFile, 'base64');
         serviceFile = params.serviceFile.map((_serviceFile)=> decodeURIComponent(_serviceFile));
    }

    if (loanFile && serviceFile){
        dataParser.processInputFiles({loanFile: loanFile, serviceFile: serviceFile}).then(function (investmentJson) {
           // next(new Error('Test  Error'));
            //console.log('investmentJson', investmentJson);
            res.json(investmentJson);
            setImmediate(() => {
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
