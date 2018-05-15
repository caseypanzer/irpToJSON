/**
 * Created by sajib sarkar on 11/18/17.
 */
'use strict';

var  _ = require('lodash');
var fs = require('fs');
var dataParser = require('../services/dataParser');



module.exports.upload = function (req, res, params, next) {

    let timseStart = Date.now();
    let loanFile= [], serviceFile =[], lperFile=[];

    if(req.files &&  Array.isArray(req.files)){
        req.files.map(function (_file) {
           // console.log('_file', _file);
            if(/^loanFile/.test(_file.fieldname)){
                loanFile.push(_file);
            } else if(/^serviceFile/.test(_file.fieldname)){
                serviceFile.push(_file);
            } else if(/^lperFile/.test(_file.fieldname)){
                lperFile.push(_file);
            }
        });
    }

    if (loanFile.length > 0 && serviceFile.length > 0){
        dataParser.processInputFiles({loanFile: loanFile, serviceFile: serviceFile, lperFile: lperFile}).then(function (investmentJson) {
            params  = null;
            loanFile    = null;
            serviceFile = null;
            lperFile    = null;
            console.log('Total time required ', Date.now() - timseStart, 'ms');
            //_cleanMemory();
            _removeFile(req.files);
            res.json(investmentJson);
        }).catch(err => {
            console.log('Error occurred ',  err);
            _removeFile(req.files);
            next(err);
        });
    } else {
      _removeFile(req.files);
        next(new Error('Invalid Upload  Files'));
    }

};


function _cleanMemory() {
    setImmediate(() => {
        try {
            global.gc();
        } catch (e) {
            console.log("You must run program with 'node --expose-gc index.js' or 'npm start'");
        }
    });
}


function _removeFile(allFiles) {

    if(!allFiles){
        return false;
    }
    setImmediate(function () {
        if(allFiles && !Array.isArray(allFiles)){
            allFiles = [allFiles];
        }

        allFiles.map(function (_file) {
            if (_file && _file.path) {
                fs.unlink(_file.path, (e) => {
                    if (e) console.log(e)
                });
            }
        });
    });
}
