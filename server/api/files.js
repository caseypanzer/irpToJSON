/**
 * Created by sajibsarkar on 11/18/17.
 */
'use strict';

var  _ = require('lodash');
var fs = require('fs');
var dataParser = require('../services/dataParser');

module.exports.upload = function (req, res, params, next) {

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
            investmentJson.Investments.forEach(function (item) {
                if(item.loanId.toString() === '305950001'){
                   // console.log('investmentJson', item);
                }
            })

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
