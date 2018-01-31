
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

function _post (req, res, next, render)
{
    let sess = req.session;
    db.userConnect(req.body.login, req.body.password, function (u)
    {
        sess.user = u;
        res.redirect('/');
    }, function (msg) {
        render({msgError : "Login ou Mot de passe incorrect !"});
    });
    //return {};
}

module.exports.post = _post;
module.exports.get = _get;