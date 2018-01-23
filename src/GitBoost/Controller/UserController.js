
var db = require('../Sqllite/db');

function _get (req, res, next , render)
{
    let url = req.originalUrl;

    if ( url == "/logout")
    {
        req.session.user = undefined;
        res.redirect('/');   
    }
    else
        return {};
}

function _post (req, res, next)
{
    let sess = req.session;
    db.userConnect(req.body.login, req.body.password, function (u)
    {
        sess.user = u;
        res.redirect('/');
    }, function (msg) {
       
    });
    //return {};
}

module.exports.post = _post;
module.exports.get = _get;