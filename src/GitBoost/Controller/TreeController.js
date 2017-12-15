var git = require("../Git/Client");
var repositories = require("../Git/Repository");
var config = require("../../../config");



function treeController(repo , commitishPath , fn)
{
    let objRet = {};

    if ( commitishPath == undefined)
        commitishPath = '';

    let repository = git.getRepositoryFromName(config.git.repositories, repo);

    function _process()
    {

        repositories.getBranches(repository,function(branches){

            objRet.branches = branches;
            //repositories.extractRef(repository , commitishPath )
            repositories.getTree(repository, commitishPath, function(files)
            {
                objRet.files = files;
                objRet.branch = commitishPath;
                branches
                repositories.getReadme(repository, commitishPath , function(readMe)
                {
                    objRet.readme = readMe;
                    
                    if ( fn != undefined)
                        fn(objRet)
                });
            });
        });

    }

    if (commitishPath.length == 0) {
        repositories.getHead(repository , function(branch)
        {
            commitishPath = branch;
            _process();
        });
    }
    else
    {
        _process();
    }
}

function _get (req, res, next , render)
{
    treeController(req.query.repo, req.query.tree , function(obj)
    {
        obj.repo = req.query.repo;
        render(obj);
    });
}

function _post (req, res, next)
{

    return {};
}

module.exports.post = _post;
module.exports.get = _get;
