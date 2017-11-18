/**
 * Created by sajibsarkar on 11/18/17.
 */
'use strict';

var  _ = require('lodash');
var fs = require('fs');
var path  = require('path');
var dataParser = require('../services/dataParser');

module.exports.upload = function (req, res, params, next) {

    //console.log(req);
    let loanFile, serviceFile;
    _.forEach(req.files, function (file) {
        file  =   file[0];
        //console.log(file);
        if (file.fieldname === 'loanFile'){
            loanFile = file;
        } else  if (file.fieldname === 'serviceFile'){
            serviceFile = file;
        }
    });

    if (loanFile && serviceFile){
        dataParser.processInputFiles({loanFile: loanFile, serviceFile: serviceFile}).then(function (investmentFileReadStream) {
            console.log('Output generated  at outputs  folder' );
            let outputFilePath = path.join(__dirname, '/../outputs/investments.json');
            console.log('Process Done.', outputFilePath);
            fs.createReadStream(outputFilePath).pipe(res);
            setImmediate(() =>{
                fs.unlinkSync(loanFile.path);
                fs.unlinkSync(serviceFile.path);
            });
        }).catch(err => {
            console.log('Error occured ',  err);
            setImmediate(() =>{
                fs.unlinkSync(loanFile.path);
                fs.unlinkSync(serviceFile.path);
            });
            next(err);
        });
    } else {
        next(new Error('Invalid Upload  Files'));
    }

};



module.exports.download = function (req, res, params, next) {
    let outputFilePath = path.join(__dirname, '/../outputs/investments.json');
    console.log('Process Done.', outputFilePath);
    setImmediate(function () {
        let ms = Date.now();
        res.download(outputFilePath, `Investments-${ms}.json`);
    });

};