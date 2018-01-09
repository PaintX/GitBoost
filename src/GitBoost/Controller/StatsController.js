var git = require("../Git/Client");
var config = require("../../../config");

function _get (req, res, next , render)
{
    let objRet = {};
    objRet.repo = req.query.repo;

    let repository = git.getRepositoryFromName(config.git.repositories, req.query.repo);
    
    if ( req.query.tree == undefined )
    {
        req.query.tree = git.getHead(repository);
    }

    objRet.branch = req.query.tree;
    objRet.branches = git.getBranches(repository);
    objRet.tags = git.getTags(repository);

    objRet.stats = git.getStats(repository , objRet.branch);
    objRet.authors = git.getAuthorStatistics(repository , objRet.branch);
    objRet.statMenuActive = true;
    return objRet;
}

module.exports.get = _get;