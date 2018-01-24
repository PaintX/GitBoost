var git = require("../Git/Client");
var config = require("../../../config");

function _get (req, res, next , render)
{
    let objRet = {};
    objRet.domain = req.headers.host;
    objRet.repo = req.query.repo;

    if ( objRet.repo.startsWith("/"))
        objRet.repo = objRet.repo.replace("/","");

    let repository = git.getRepositoryFromName(config.git.repositories, req.query.repo);

    if ( req.query.branch == undefined )
    {
        req.query.branch = git.getHead(repository);
        if ( req.query.branch == undefined)
            req.query.branch = config.git.default_branch;
    }
    if ( req.query.path == undefined )
        req.query.path = "";

    objRet.branch = req.query.branch;
    objRet.branches = git.getBranches(repository);
    if ( objRet.branches.length == 0)
        objRet.branches.push(objRet.branch);
        
    objRet.tags = git.getTags(repository);repository.path = repository.path + req.query.path;
    objRet.readme = git.getReadMe(repository , req.query.branch);
    objRet.files = git.getTree(repository , req.query.branch);
    objRet.repopath = req.query.path;


    objRet.breadCrumbPath = [];

    let masterPath = req.query.repo;
    if ( masterPath.startsWith("/") )
        masterPath = masterPath.replace("/","");

    objRet.breadCrumbPath.push({text : masterPath , path : ""});

    let finalPath = "";
    req.query.path.split("/").map(function ( p )
    {
        if ( p.length == 0 )
            return;
        objRet.breadCrumbPath.push({text : p , path : finalPath + "/" + p});
        finalPath = finalPath + "/" + p
    });
    objRet.treeMenuActive = true;
    return objRet;
}

function _post (req, res, next)
{

    return {};
}

module.exports.post = _post;
module.exports.get = _get;
