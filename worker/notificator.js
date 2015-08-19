#!/usr/bin/env node

var AWS = require('aws-sdk');
var EndPoint = require('../model/endPoint');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/endPoint-server');

AWS.config.update({
    "region": "sa-east-1"
});

//Retorna todos os documentos do db
EndPoint.find(function(err, endpoints) {
    if(err) return console.error(err);
    console.log(endpoints);
});

return false;

var appName = 'embelezapp-android'
var userToken = '13c79aee-d2eb-3375-91d4-b7115cd16463'

var sns = new AWS.SNS();
var params = {
    TargetArn:'arn:aws:sns:sa-east-1:326627603165:endpoint/GCM/'+appName+'/'+userToken,
    Message:'Success!!!',
    Subject: 'TestSNS'
};

sns.publish(params, function(err,data){
        if (err) {
            console.log('Error sending a message', err);
        } else {
            console.log('Sent message:', data.MessageId);
        }
});
