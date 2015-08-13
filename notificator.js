var AWS = require('aws-sdk');

var sns = new AWS.SNS();
sns.addPermission(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
