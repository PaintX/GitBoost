var git = require("../Git/Client");
var config = require("../../../config");

function _get (req, res, next , render)
{
    let objRet = {};
    objRet.repo = req.query.repo;

    let repository = git.getRepositoryFromName(config.git.repositories, req.query.repo);
    
    if ( req.query.branch == undefined )
    {
        req.query.branch = git.getHead(repository);
        if ( req.query.branch == undefined)
            req.query.branch = config.git.default_branch;
    }

    objRet.branch = req.query.branch;
    objRet.branches = git.getBranches(repository);
    if ( objRet.branches.length == 0)
        objRet.branches.push(objRet.branch);

    objRet.tags = git.getTags(repository);

    objRet.stats = git.getStats(repository , objRet.branch);
    objRet.authors = git.getAuthorStatistics(repository , objRet.branch);
    objRet.statMenuActive = true;
    return objRet;
}

module.exports.get = _get;