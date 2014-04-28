# crossroads-webhooks


This is the fork of jekyll-hook, to meet the needs of crossraods milacron project . 

Following changes has been made to this repository to meet the needs 

1 . We now use only one script to do every thing instead of using one for pusblish and one to pull . 
2 . We added new config entries to meet our folder structure  . 
3 . We made the default port number to 4000 since we wanted it to run in this port . 

When cloned at local please make sure you edit the configuration as per your need . 

Two new cofig parameters are added . 

1 . publish : - This holds the publish path where jekyll publishes the site during build 
2 . source : - We just changed this to hold our actual server path in the code base . 

What is this crossraods-webhooks 

A server that listens for webhook posts from GitHub, generates a website with Jekyll, and moves it somewhere to be published. Use this to run your own GitHub Pages-style web server. Great for when you need to serve your websites behind a firewall, need extra server-level features like HTTP basic auth (see below for an NGINX config with basic auth), or want to host your site directly on a CDN or file host like S3. It's cutomizable with two user-configurable shell scripts and a config file.

## Installation

- run `$ npm install` to install app dependencies
- Set a [Web hook]() on your GitHub repository that points to your jekyll-hook server `http://example.com:4000/hooks/jekyll/yourreponame`, where `yourreponame` is the name of your repository . 


## Configuration

Adjust `build.sh` to meet your needs . 

Copy `config.sample.json` to `config.json` in the root directory and customize.

Configuration attributes:

- `gh_server` The GitHub server from which to pull code
- `source` A directory to store code and site files
- `path` Path where jekyll publishes the content 
- `scripts`
    - `build` A script to run to build the site
    - `publish` A script to run to publish the site ( not used ) 
- `email` Optional. Settings for sending email alerts
    - `user` Sending email account's user name (e.g. `example@gmail.com`)
    - `password` Sending email account's password
    - `host` SMTP host for sending email account (e.g. `smtp.gmail.com`) 
    - `ssl` `true` or `false` for SSL
- `accounts` An array of accounts or organizations whose repositories can be used with this server
## Usage

- run as executable: `$ ./jekyll-hook.js`

## Publishing content

We have a script 


Replace this script with whatever you need for your particular hosting environment.

You probably want to configure your server to only respond POST requests from GitHub's public IP addresses, found on the webhooks settings page.

## Dependencies

Here's a sample script to install the approriate dependencies on an Ubuntu server:

```sh
#!/bin/sh

# Install node and depencencies
sudo apt-get update -y
sudo apt-get install python-software-properties python g++ make -y
# On Ubuntu 12.10 and greater, add-apt-repository is provided by the software-properties-common package
#sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update -y
sudo apt-get install nodejs -y

# Forever to keep server running
sudo npm install -g forever

# Git
sudo apt-get install git -y

# Ruby
sudo apt-get install ruby1.8 -y
sudo apt-get install rubygems -y

# Jekyll
sudo gem install jekyll --version "0.12.0"
sudo gem install rdiscount -- version "1.6.8"
sudo gem install json --version "1.6.1"

# Nginx for static content
sudo apt-get install nginx -y
```
