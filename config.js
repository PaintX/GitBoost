module.exports.git={
    client : '/usr/bin/git' ,       //-- Your git executable path
    default_branch : 'master' ,     //-- Default branch when HEAD is detached
    repositories : [  
        "F:/_data_/"
    ],                              //-- Path to your repositories
};

module.exports.app = {
    debug : false,
    cache : false,
    theme : "bootstrap3",
};