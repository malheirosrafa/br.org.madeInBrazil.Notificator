#!/usr/bin/env node

/*
 * Codigo-fonte retirado de https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html
 * com algumas adaptacoes
 */

//Recebe a plataforma e o token da fila para gerar o EndPointEnd

var amqp = require('amqplib/callback_api');
var config = require('config');
var AWS = require('aws-sdk');
var EndPoint = require('../model/endPoint');
var mongoose = require('mongoose');
var aws = config.get('aws');

mongoose.connect('mongodb://localhost/endPoint-server');

AWS.config.update({
    "region": "sa-east-1"
});


function onError(error) {
	console.log('problem with request: ' + error.message);
}

amqp.connect('amqp://'+process.env.USER_NAME+':'+process.env.PASSWORD+'@queue.embelezapp.com.br', function(err, conn) {
  conn.createChannel(function(err, ch) {

    var ex = 'notificator';

    ch.assertExchange(ex, 'fanout', {durable: false});

    ch.assertQueue('', {exclusive: true}, function(err, q) {
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
	    ch.bindQueue(q.queue, ex, '');

    	ch.consume(q.queue, function(msg) {

            var element = JSON.parse(msg.content.toString());

            console.log(" [x] Received token %s", element.token);
            console.log(" [x] Received platform %s", element.platform);

            //Gerando o EndPoint

            var params = {

              PlatformApplicationArn: aws.platforms[element.platform],
              Token: element.token
            };

            var sns = new AWS.SNS();

            sns.createPlatformEndpoint(params, function(err, data) {
              if (err) {
               	console.log(err, err.stack);
			  }
              else {
 			  	console.log(data);
              	var endPoint = new EndPoint({
                	token: element.token,
                	arn: data.EndpointArn,
                	platform: element.platform
            	});
            	endPoint.save();
			  }
		    });
        }, {noAck: true});
     });
  });
});
