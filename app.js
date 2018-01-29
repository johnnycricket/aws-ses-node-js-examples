'use strict';

// Require objects.

const express = require('express');
const bodyParser = require('body-parser');
const app     = express();
const aws     = require('aws-sdk');

// Edit this with YOUR email address.
let email   = "narrator@alittlefiction.xyz";
    
// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SES.
const ses = new aws.SES();

app.set('view engine', 'pug');
app.use(bodyParser.json({type: 'application/json'}));

app.get('/', (req, res) => {
    res.render('index');
});

// Verify email addresses.
// This only send the verify email with link. It will not automagically auth an email.
app.get('/verify', function (req, res) {
    var params = {
        EmailAddress: email
    };
    
    ses.verifyEmailAddress(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Listing the verified email addresses.
app.get('/list', function (req, res) {
    ses.listIdentities(function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            const values = data.ResponseMetaData.Identities;
            res.render('list', values);
        } 
    });
});

// Deleting verified email addresses.
app.get('/delete', function (req, res) {
    var params = {
        EmailAddress: email
    };

    ses.deleteIdentity(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Sending RAW email including an attachment.
app.get('/send', function (req, res) {
    var ses_mail = "From: 'AWS Tutorial Series' <" + email + ">\n";
    ses_mail = ses_mail + "To: " + email + "\n";
    ses_mail = ses_mail + "Subject: AWS SES Attachment Example\n";
    ses_mail = ses_mail + "MIME-Version: 1.0\n";
    ses_mail = ses_mail + "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
    ses_mail = ses_mail + "--NextPart\n";
    ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
    ses_mail = ses_mail + "This is the body of the email.\n\n";
    ses_mail = ses_mail + "--NextPart\n";
    ses_mail = ses_mail + "Content-Type: text/plain;\n";
    ses_mail = ses_mail + "Content-Disposition: attachment; filename=\"attachment.txt\"\n\n";
    ses_mail = ses_mail + "AWS Tutorial Series - Really cool file attachment!" + "\n\n";
    ses_mail = ses_mail + "--NextPart--";
    
    var params = {
        RawMessage: { Data: new Buffer(ses_mail) },
        Destinations: [ email ],
        Source: "'AWS Tutorial Series' <" + email + ">'"
    };
    
    ses.sendRawEmail(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        }           
    });
});

// Start server.
var server = app.listen(80, '172.31.88.74', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SES example app listening at http://%s:%s', host, port);
});
