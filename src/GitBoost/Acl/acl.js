var config = require("./../../../config");

module.exports.checkAcl = function(req, valid , notValid)
{
    if ( config.app.onlyPrivate == true )
    {
        if ( req.session.user == undefined && req.originalUrl != "/login")
        {
            if ( notValid != undefined )
            {
                notValid();
            }
        }
        else
        {
            valid();
        }
    }

}