#!/usr/bin/env node

var AWS         = require('aws-sdk');
var restify     = require('restify');
var mongoose    = require('mongoose');
var EndPoint    = require('../model/endPoint');
var packageJson = require('../package.json');


mongoose.connect('mongodb://localhost/endPoint-server');

AWS.config.update({
    "region": "sa-east-1"
});

var sns = new AWS.SNS();

var server = restify.createServer({
    name: packageJson.name,
    version: packageJson.version
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.listen(8080, function () {
    console.log("Server "+server.name+" listening in port 8080");
});

server.post("/token/:token", function(req, res, next){
    EndPoint.findOne({token:req.params.token}, 'platform arn', function(err, endpoints) {

        //Caso ocorrer algum erro interno
        if(err) return res.send(500);

        //Caso o token solicitado nao exista no mongodb
        if(endpoints === null) return res.send(404);

		res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });

        res.end();

        /* Envio de mensagem para a Amazon.
           A forma de envio de mensagens para Android e ios sao diferentes.*/
        if(endpoints.platform == 'android') {
            var androidMessage = {
                //default: req.params.message,
                GCM: {
                    data: {
                        message: req.params.message
                    }
                }
            };

            androidMessage = JSON.stringify(androidMessage);

            var params = {
                TargetArn: endpoints.arn,
                Message: androidMessage,
                MessageStructure: 'json'
                //Subject: 'TestSNS'
            };
        }

        else {
            var iosMessage = {
                APNS_SANDBOX: {
                    aps: {
                        alert: req.params.message
                    }
                }
            };

            iosMessage = JSON.stringify(iosMessage);

            var params = {
                TargetArn: endpoints.arn,
                Message: iosMessage,
                MessageStructure: 'json'
                //Subject: 'TestSNS'
            };
        }

        sns.publish(params, function(err,data){
                if (err) {
                    console.log('Error sending a message', err);
                } else {
                    console.log('Sent message:', data.MessageId);
                }
        });
    });
    return next();
});