'use strict';

// Require objects.

const express = require('express');
const bodyParser = require('body-parser');
const app     = express();
const aws     = require('aws-sdk');

// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SES.
const ses = new aws.SES();
const proxydb = new aws.DynamoDB();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({type: 'application/json'}));

app.get('/', (req, res) => {
    res.render('index');
});

// Listing the verified email addresses.
app.get('/list', function (req, res) {
    ses.listIdentities(function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            const values = data.Identities;
            //res.send(data);
            res.render('list', { values: values });
        } 
    });
});

app.get('/proxylist', function (req, res) {
    const params = {
        TableName: 'emailproxypoc',
    }
    proxydb.scan(params, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.render('db', { values: data.Items });
        }
    })
})

app.get('/send', (req, res) => {
    const params = {
        TableName: 'emailproxypoc',
    }
    proxydb.scan( (err, data) => {
        if(err) {
            res.send(err);
        } else {
            res.render('send', {proxies: data.Items});
        }
    })
    
})

// Sending RAW email including an attachment.
app.post('/api/send', (req, res) => {    
    if(req.body) {
        const emails = {
            email: req.body.email,
            from: 'noreply@alittlefiction.xyz'
        };
        let ses_mail = `From: ${emails.from}\n
        To: ${emails.email}\n
        Subject: simple email proof of concept\n
        MIME-VERSION: 1.0\n
        Content-Type: text/plain; charset=us-ascii\n\n
        This is the body of the email which I am sending.`;
        const params = {
            RawMessage: { Data: ses_mail },
            Destinations: [ emails.email ],
            Source: emails.from
        }
        ses.sendRawEmail(params, (err, data) => {
            if(err) {
                //add query params about why...
                console.log(ses_mail);
                res.redirect(`/notsent?err=${err}`);
            } else {
                console.log(data);
                res.redirect(`/sent?data=${data}`);
            }
        });
    } else {
        res.redirect('/notsent?err=NoData');
    }
});

app.get('/sent', (req, res) => {
    res.render('sent', {message: 'sent'});
})
app.get('/notsent', (req, res) => {
    res.render('sent', {message: 'not sent'});
})

// Start server.
var server = app.listen(80, '172.31.88.74', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SES example app listening at http://%s:%s', host, port);
});
