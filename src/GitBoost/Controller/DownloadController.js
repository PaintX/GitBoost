var git = require("../Git/Client");
var fs = require('fs');
var config = require("../../../config");
var key = require("../ApiKey/apikey");

function _get (req, res, next , render)
{
    let objRet = {};
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

    if ( req.query.format == undefined )
        req.query.format = "zip";

    let tempApiKey = key.generate();
    let tempDir = config.app.tempDir;
    if ( tempDir.endsWith("/") == false )
        tempDir += "/";
    git.createArchive(repository ,req.query.branch ,tempDir + tempApiKey +'.'+req.query.format ,req.query.format)

    res.download(tempDir+ tempApiKey +'.'+req.query.format, repository.name + "_" + req.query.branch + "." +  req.query.format ,function(err){
        if (err){
          console.log(err);
        } else {
            fs.unlink(tempDir + tempApiKey +'.'+req.query.format);
        }
      });
}

module.exports.get = _get;