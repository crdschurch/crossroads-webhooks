Crossroads-WebHooks.   
==========

Crossroads-webhooks is a nodeJS webapplication which porcesses enables us to deploy code contributions to any repository once pushed to github . 

This is how it works : - 

  - Recieves payload from github.
  - Check the payload request URL to know the repository. 
  - Updates the codebase in the hosted environment. 


Installation
--------------

```sh
git clone https://github.com/crdschurch/crossroads-webhooks.git 
cd crossroads-webhooks
npm install
cp config.sample.json config.json
vi config.json // edit as per your environment 
```

##### Configuration variables 

* gh_server : Mention your server where you are hosting your remmote reposiory
* env : You can have n number of environments , make sure you add there hosted path here
* scripts :  Path to shell scripts which is executed to deploy . 
* email : Specify email SMTP details 
* accounts : Specify your github organization name 

##### Running the server 

```sh
nohup ./jekyll-hook.js &
```

##### Setting up Webhooks at github 
* Navigate to https://github.com/crdschurch/crdschurch.github.io/settings/hooks
* And specify URL http://yourdomainname.com:4000/hooks/jekyll/your_repository_name


##### Debugging 
* You should run with out nohup and 
* Try redelivering the payload from github and observe the console . 


This repository has been cloned from jekyll-hook, to meet the needs of crossraods milacron project . 



License
----

MIT


**Free Software, Hell Yeah!**

[john gruber]:http://daringfireball.net/
[@thomasfuchs]:http://twitter.com/thomasfuchs
[1]:http://daringfireball.net/projects/markdown/
[marked]:https://github.com/chjj/marked
[Ace Editor]:http://ace.ajax.org
[node.js]:http://nodejs.org
[Twitter Bootstrap]:http://twitter.github.com/bootstrap/
[keymaster.js]:https://github.com/madrobby/keymaster
[jQuery]:http://jquery.com
[@tjholowaychuk]:http://twitter.com/tjholowaychuk
[express]:http://expressjs.com
