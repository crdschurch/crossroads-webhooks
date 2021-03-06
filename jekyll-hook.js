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
app.post('/hooks/upload-to-s3/:repository', function(req, res) {
    // Close connection
    res.send(202);
    // Run build script
    // Queue request handler
    tasks.defer(function(req, res, cb) {
        var data = req.body;
        var branch = 'master';
        var params = [];
        data.repo = data.repository.name;
        data.branch = data.ref.split('/')[2];
        data.owner = data.repository.owner.name;
        var repo = req.params.repository;

        var source = config.env[repo]['location'];
        var type = config.env[repo]['type'];

        // Process webhook data into params for scripts
        params.push(data.repo);
        params.push(data.branch);
        params.push(data.owner);
        params.push('git@' + config.gh_server + ':' + data.owner + '/' + data.repo + '.git');
        params.push(source);
        params.push('https://' + config.gh_server + '/' + data.owner + '/' + data.repo + '.git');

        var checkForImageAdd = req.body.head_commit.added[0];
        // We just need to send mail and upload only when image is added to img folder
        if(checkForImageAdd.indexOf('app/img/') > -1) {
            run(config.scripts.uploadToS3, params, function(err) {
                if (err) {
                    console.log(' Failed to upload to S3 ' + err);
                    send('Failed to upload images to s3: ' + data.owner + '/' + data.repo + '- Failed to update' + err, data.repo + ' - Failed to upload images to S3', data);
                    return;
                }

                console.log('Successfully uploaded images to s3: ' + data.owner + '/' + data.repo);
                send('Successfully uploaded images to s3: ' + data.owner + '/' + data.repo + '- Succesfully updated', data.repo + ' - Succesfully uploaded to S3', data);
                return;
            });
        } else {
            console.log(" Since images are not added so no need to upload to S3");
        }


    }, req, res);

});


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

        var source = config.env[repo]['location'];
	    var type = config.env[repo]['type'];

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
	/* giturlhttps*/ params.push('https://' + config.gh_server + '/' + data.owner + '/' + data.repo + '.git');

	// This configuration builds the jekyll site. Check if the location type is of jekyll before proceeding
	if (type === 'jekyll') {
	// Run inspect jekyll script which check jekyll build failures, which doesn't allow to pull unless it is resolved.
	    runjekyll(config.scripts.inspect, params, function(err){
		var resultant = err.split('$$'); // used to get the status code.
		if (resultant[1] === '1') {
                    console.log('Failed to build: ' + data.owner + '/' + data.repo);
	            send('Your website at ' + data.owner + '/' + data.repo + ' failed to build <br><br>' + resultant[2], data.repo + ' - Error building site', data);

                    if (typeof cb === 'function') cb();
                    return;
		
		} else {
			// Run build script
			run(config.scripts.build, params, function(err) {
	                if (err) {
		                console.log('Failed to build: ' + data.owner + '/' + data.repo);
                		send('Your website at ' + data.owner + '/' + data.repo + ' failed to build.', data.repo + ' - Error building site', data);

	                if (typeof cb === 'function') cb();
        		        return;
	                }

	            // Done running scripts
        	    console.log('Successfully rendered: ' + data.owner + '/' + data.repo);
	            send('Your website at ' + data.owner + '/' + data.repo + ' was succesfully published.', data.repo + ' - Succesfully published', data);

        	    if (typeof cb === 'function') cb();
	            return;

       		    });
	
	       }
	    });
	} // Else run your own script to match up the needs.
    }, req, res);

});

// Start server
var port = process.env.PORT || 4000;
app.listen(port);
console.log('Listening on port ' + port);

function runjekyll(file, params, cb) {
    var process = spawn(file, params);
    var errData = '';

    process.stdout.on('data', function (data) {
        console.log('' + data);
    });

    process.stderr.on('data', function (data) {
        errData += data.toString();
        console.warn('' + data);
    });

    process.on('exit', function (code) {
        if (typeof cb === 'function') {
                var message = "CODE$$"+code+"$$"+errData; // $$ is used as a delimited for splitting purpose.
                cb(message);
         }
    });
}


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
