/**
 * Created by sajibsarkar on 11/21/17.
 */

'use strict';

var aws = require('aws-sdk');
var  path = require('path');
var crypto = require("crypto");

aws.config.set("accessKeyId", '---');
aws.config.set("secretAccessKey", '--');

var s3 = new aws.S3({apiVersion: '2006-03-01'});



module.exports.initiateUpload = function (data, next) {

    return new Promise((resolve,  reject)  =>  {



    var originalFileName = data.originalFileName;
    var fileSize         = data.fileSize;
    var fileType         = data.fileType;



    if (!originalFileName) {
        reject({ message: 'originalFileName parameter is missing'}, null);
        return;
    }

    if (!fileSize) {
        reject({ message: 'fileSize parameter is missing'}, null);
        return;
    }

    if (!fileType) {
        reject({ message: 'fileType parameter is missing'}, null);
        return;
    }


            try {

                var remoteFilePath = module.exports.buildRemoteFilePath(data);
                var base64Policy   = module.exports.buildPolicy(data);
                var signature      = module.exports.buildSignature(base64Policy);
                var actionUri      = module.exports.buildActionUri();
                var AWSAccessKeyId = '--';
                resolve({key: remoteFilePath, policy: base64Policy, AWSAccessKeyId: AWSAccessKeyId, signature: signature, acl: 'public-read', actionUri: actionUri });
            } catch (ex) {
                console.log(ex);
                //util.log(util.inspect(ex));
                reject(ex);
            }


    });
};

exports.buildActionUri = function () {
    return ["http://", 'sajibbucket', ".s3.amazonaws.com"].join("");
};


module.exports.buildSignature = function (base64Policy) {
    var signature = crypto.createHmac("sha1", "ZRMRAJXgXStpBtB2Hb6sib5mQ4+vA7M01YtwcqfS")
        .update(new Buffer(base64Policy, "utf-8")).digest("base64");
    return signature;
};


module.exports.buildPolicy = function (data) {
    var POLICY_JSON = {
        "expiration": "2020-12-01T12:00:00.000Z",
        "conditions": [
            {"bucket": 'sajibbucket'},
            ["starts-with", "$key", ""],
            {"acl": "public-read"},
            ["starts-with", "$success_action_status", ""],
            ["starts-with", "$Content-Type", ""],
            ["content-length-range", 0, (parseInt(data.fileSize) + 1028)]
        ]
    };
    var stringPolicy = JSON.stringify(POLICY_JSON);
    return new Buffer(stringPolicy, "utf-8").toString("base64");
}

module.exports.buildRemoteFilePath = function (data) {
        var baseName = path.basename(data.originalFileName, path.extname(data.originalFileName));
        var newFileName = [baseName, "_", new Date().getTime(), path.extname(data.originalFileName)].join("");
        let remoteFilePath = [newFileName].join("").replace("//", "/");

    return remoteFilePath;
}

module.exports.buildActionUri = function (uploadkeyData) {
    return ["http://", 'sajibbucket', ".s3.amazonaws.com"].join("");
};
