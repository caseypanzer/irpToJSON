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

    debugger;
   // console.log(typeof params);
    //console.log(Object.keys(params));
    let loanFile, serviceFile;
    /*_.forEach(req.files, function (file) {
        file  =   file[0];
        //console.log(file);
        if (file.fieldname === 'loanFile'){
            loanFile = file;
        } else  if (file.fieldname === 'serviceFile'){
            serviceFile = file;
        }
    });
*/
    if(params.loanFile){
         loanFile   = decodeURIComponent(params.loanFile); //new  Buffer(params.loanFile, 'base64');
        serviceFile = decodeURIComponent(params.serviceFile);
    }

    if (loanFile && serviceFile){
        dataParser.processInputFiles({loanFile: loanFile, serviceFile: serviceFile}).then(function (investmentJson) {
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


module.exports.initiateFileUpload  =  function (req, res, params, next) {
    console.log(params);

    awsService.initiateUpload(params).then(result  =>{
        res.json(result);
    }).catch(err  =>  next(err));
};


module.exports.download = function (req, res, params, next) {
    let outputFilePath = path.join(__dirname, '/../outputs/investments.json');
    console.log('Process Done.', outputFilePath);
    setImmediate(function () {
        let ms = Date.now();
        res.download(outputFilePath, `Investments-${ms}.json`);
    });
};