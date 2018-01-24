module.exports.git={
    client : '/usr/bin/git' ,       //-- Your git executable path
    default_branch : 'master' ,     //-- Default branch when HEAD is detached
    repositories : [  
        "F:/_data_"
    ],                              //-- Path to your repositories
};

module.exports.app = {
    debug : true,                  //-- display few information
    cache : false,                  //-- not active at this moment
    tempDir : "D:/_DEV_/DEV_WEB/GitBoost/tmp",      //-- temp directory for download archive
    port : 1337,                    //-- http port
    theme : "bootstrap3",           //-- default theme ( only bootstrap3 for moment )
    defaultLogin : "admin",         //-- default login for fresh install 
    defaultPassword : "admin"       //-- default password for fresh install
};