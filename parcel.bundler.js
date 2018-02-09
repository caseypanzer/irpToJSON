/**
 * Created by sajibsarkar on 1/29/18.
 */

'use strict';

//import "babel-polyfill";
const chalk = require('chalk');


let klawSync = require('klaw-sync');

/*
//require('./public/js/vendors.js');

//require.resolve("./public/js");
let appSrc;

async function fetchMe() {
    try {
        appSrc = klawSync('./public/js', { nodir: true })
            .map(item => item.path)
            .filter(item => /\.js$/.test(item));


        let _promises = [];

        appSrc.forEach(function (fileSrc) {
            _promises.push(require(fileSrc));
        });

        let quee = await Promise.all(_promises)

       return  quee;
    } catch (er) {
        console.error(er);
    }
};*/

const Bundler = require('parcel-bundler');



const build = () => {
    const bundler = new Bundler('./public/js/app.js', {
        command: 'build',
        outDir: './build/',
        publicUrl: './',
        cacheDir: './.parcelCache',
        sourceMaps: true
    });

    Promise.resolve(bundler.bundle()).then(()=>{

        console.log(`The ${chalk.cyan('build')} folder is ready to deploy`);
        process.exit(1);
    }).catch((err)=>{
        console.log("Error occurred at", err);
        process.exit(1);
    });


};

build();
