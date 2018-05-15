/**
 * Created by sajibsarkar on 10/16/16.
 */


var properties, path,
    PropertiesReader = require('properties-reader'),
    fs = require('fs');

//First check for dev-path
path = './.env';
if (!fs.existsSync(path)) {
    //Check for staging/production
    path = '.env';
    if (!fs.existsSync(path)) {
        console.log('.env file not found in expected locations');
    }
}
properties = PropertiesReader(path);


module.exports = {

    getProp: function (prop) {
        var value = properties.get(prop);
        return (value || "");
    },

    loadEnvProperties: function () {
        //ENVIRONMENT
        process.env.NODE_ENV = this.getProp('ENVIRONMENT.ENV_NAME') || 'development';

        //AWS
        process.env.AWS_BUCKET_NAME = this.getProp('AWS.BUCKET_NAME');
        process.env.AWS_REGION = this.getProp('AWS.REGION');
        process.env.AWS_ACCESS_KEY_ID = this.getProp('AWS.ACCESS_KEY_ID');
        process.env.AWS_SECRET_ACCESS_KEY = this.getProp('AWS.SECRET_ACCESS_KEY');
        //MONGODB
        process.env.MONGODB_CONNECTION_STRING = this.getProp('MONGODB.CONNECTION_STRING');

        //PORT
        process.env.PORT = this.getProp('APPLICATION.PORT');
    }
};

