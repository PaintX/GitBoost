module.exports.git={
    client : '/usr/bin/git' ,       //-- Your git executable path
    default_branch : 'master' ,     //-- Default branch when HEAD is detached
    repositories : [  
        "C:/_DEV_"
    ],                              //-- Path to your repositories
};

module.exports.app = {
    debug : true,                  //-- display few information
    cache : false,                  //-- not active at this moment
    onlyPrivate : true,             //-- all repo are private
    tempDir : "C:/_DEV_/tmp",      //-- temp directory for download archive
    port : 1337,                    //-- http port
    theme : "bootstrap3",           //-- default theme ( only bootstrap3 for moment )
    defaultLogin : "admin",         //-- default login for fresh install 
    defaultPassword : "admin"       //-- default password for fresh install
};