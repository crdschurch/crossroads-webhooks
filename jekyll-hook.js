#!/usr/bin/env node

var config  = require('./config.json');
var fs      = require('fs');
var express = require('express');
var app     = express();
var queue   = require('queue-async');
var tasks   = queue(1);
var spawn   = require('child_process').spawn;
var mandrillMailer = require('mailer'),
        username = config.email.user,
        password = config.email.password;


app.use(express.bodyParser());

// Receive webhook post
app.post('/hooks/jekyll/:repository', function(req, res) {
    
    // Close connection
    res.send(202);

    // Queue request handler
    tasks.defer(function(req, res, cb) {
        var data = req.body;
        var branch = 'master';
        var params = [];

        // Parse webhook data for internal variables
        data.repo = data.repository.name;
        data.branch = data.ref.split('/')[2];
        data.owner = data.repository.owner.name;

        // End early if not permitted account
        if (config.accounts.indexOf(data.owner) === -1) {
            console.log(data.owner + ' is not an authorized account.');
            if (typeof cb === 'function') cb();
            return;
        }

        var repo = req.params.repository;

        if(config.env[repo] == undefined) {
            console.log(data.owner + 'Update repository not found');
            if (typeof cb === 'function') cb();
            return;
        }

        var source = config.env[repo];

        // End early if not permitted branch
        if (data.branch !== branch) {
            console.log('Not ' + branch + ' branch.');
            if (typeof cb === 'function') cb();
            return;
        }

        // Process webhook data into params for scripts
        /* repo   */ params.push(data.repo);
        /* branch */ params.push(data.branch);
        /* owner  */ params.push(data.owner);
        /* giturl */ params.push('git@' + config.gh_server + ':' + data.owner + '/' + data.repo + '.git');
        /* source */ params.push(source);

        // Run build script
        run(config.scripts.build, params, function(err) {
            if (err) {
                console.log('Failed to build: ' + data.owner + '/' + data.repo);
                send('Your website at ' + data.owner + '/' + data.repo + ' failed to build. There was a local change on the server that was overwritten in the latest deploy. You may need to investigate this change.', data.repo + ' - Error building site', data);

                if (typeof cb === 'function') cb();
                return;
            }

            // Done running scripts
            console.log('Successfully rendered: ' + data.owner + '/' + data.repo);
            send('Your website at ' + data.owner + '/' + data.repo + ' was succesfully published.', data.repo + ' - Succesfully published', data);

            if (typeof cb === 'function') cb();
            return;

        });
    }, req, res);

});

// Start server
var port = process.env.PORT || 4000;
app.listen(port);
console.log('Listening on port ' + port);

function run(file, params, cb) {
    var process = spawn(file, params);

    process.stdout.on('data', function (data) {
        console.log('' + data);
    });

    process.stderr.on('data', function (data) {
        console.warn('' + data);
    });

    process.on('exit', function (code) {
        if (typeof cb === 'function') cb(code !== 0);
    });
}

function send(body, subject, data) {
    if (config.email && data.pusher.email) {
	 var message = {
                host: config.email.host,
                port: config.email.port,
                to: data.pusher.email,
                from: config.email.from,
                subject: subject,
                html: body,
                authentication: config.email.authentication,
                username: username,
                password: password
        };
        mandrillMailer.send(message
                , function (err, result){
                        if(err) {
                                console.warn(err);
                        }
                }
                );
    }
}
