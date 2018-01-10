var config = require("../../../config");
var git = require("../Git/Client");
var fs = require('fs');

let directoryList = [];

function recurseDirectory ( p , toplevel )
    {
        if ( toplevel == undefined)
        {
            toplevel = true;
        }
        
        if ( toplevel == true)
            directoryList.push(p);

        let dir = fs.readdirSync(p);

        dir.map(function(file)
        {
            if ( p.endsWith("/") == false)
            {
                p = p + "/";
            }
                
            let pf = p+file;
            let stat = fs.statSync(pf);

            if ( stat.isDirectory() )
            {  
                let isBare = fs.existsSync(pf + '/HEAD' );
                let isRepository = fs.existsSync(pf + '/.git/HEAD' );

                if (isRepository == false && isBare == false)
                {
                    directoryList.push(pf);
                    recurseDirectory(pf , false);
                }
            }
        });

        return directoryList;
    }

function _get (req, res, next , render)
{
    let objRet = {};
    directoryList = [];

    config.git.repositories.map(function(p)
    {
         recurseDirectory(p);
    });

    objRet.directoryList = directoryList;


    return objRet;
}

function _post (req, res, next)
{
    let objRet = {};
    directoryList = [];

    let directoryPath = req.body.ReposPath;
    if ( directoryPath.endsWith("/") || directoryPath.endsWith("//")|| directoryPath.endsWith("\\"))
    {
        directoryPath +=  req.body.ReposName;
    }
    else
    {
        directoryPath +=  "/" + req.body.ReposName;
    }

    //-- création d'un dossier
    let isBare = fs.existsSync(directoryPath + '/HEAD' );
    let isRepository = fs.existsSync(directoryPath + '/.git/HEAD' );
    let isDirectory = fs.existsSync(directoryPath );
    let repos = {};

    if (isRepository == true || isBare == true || isDirectory == true)
    {
        objRet.msgError = "Un Dossier ou un repos existe déja avec ce nom";
    }
    else
    {
        fs.mkdirSync(directoryPath);

        if ( fs.existsSync(directoryPath) )
        {
            objRet.msgSuccess = "Dossier créer avec succes";
        }
        else
        {
            objRet.msgError = "Echec de la création du Dossier";
        }
    }


    if ( req.body.optionsRadios != "Dir" && objRet.msgError == undefined)
    {
        //-- création d'un repos
        
        repos.name = req.body.ReposName;
        repos.path = directoryPath;
        git.createNonBareRepos(repos);

        let isBare = fs.existsSync(directoryPath + '/HEAD' );
        let isRepository = fs.existsSync(directoryPath + '/.git/HEAD' );
        if (isRepository == true || isBare == true )
        {
            objRet.msgSuccess = "Repos créer avec succes";
        }
        else
        {
            objRet.msgSuccess = undefined;
            objRet.msgError = "Erreur lors de la création du repos";
        }
    }

    if ( req.body.optionsRadios != "Dir" && objRet.msgError == undefined)
    {
        //-- création du fichier readMe et commit
        fs.writeFileSync(repos.path + "/Readme.md" , 'Your mother is so ugly, glCullFace always returns TRUE.');

        git.addFile(repos , "Readme.md");
        git.commit(repos , "initial Commit");

        git.createBareFromNonBareRepos(repos);

        let isBare = fs.existsSync(repos.path + '/HEAD' );

        if ( isBare == true )
        {
            objRet.msgSuccess = "Repos créer avec succes";
        }
        else
        {
            objRet.msgSuccess = undefined;
            objRet.msgError = "Erreur lors de la création du repos";
        }

    }

    config.git.repositories.map(function(p)
    {
         recurseDirectory(p);
    });

    objRet.directoryList = directoryList;

    return objRet;
}

module.exports.post = _post;
module.exports.get = _get;