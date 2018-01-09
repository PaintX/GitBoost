var config = require("../../../config");
var git = require("../Git/Client");

function _get (req, res, next , render)
{
    let repositories = git.getRepositories(config.git.repositories);
    return {repositories : repositories};
}

function _post (req, res, next)
{

    return {};
}

module.exports.post = _post;
module.exports.get = _get;
