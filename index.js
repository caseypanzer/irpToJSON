/**
 * Created by sajibsarkar on 11/17/17.
 */
 'use  strict';

 const dataParser = require('./dataParser');

dataParser.processInputFiles().then(function () {
     console.log('Output generated  at outputs  folder' );
     console.log('Process Done.');
 }).catch(err => {
     console.log('Error occured ',  err);
 });










