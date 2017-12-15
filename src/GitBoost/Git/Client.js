var fs = require('fs');
var config = require("../../../config");
var git = require('./Command');

var repositories = {};

function getRepositories (paths)
{
    repositories = {};
    let allRepositories = [];

    paths.map(function(p)
    {
        let repositories = recurseDirectory(p);

        for ( let key in repositories)
        {
            repositories[key].tree = repositories[key].tree.replace(p,"/");
            allRepositories.push(repositories[key]);
        }
        //allRepositories = Object.assign(allRepositories,repositories);
    });

    return allRepositories;
}


function recurseDirectory ( p , toplevel )
{
    if ( toplevel == undefined)
    {
        toplevel = true;
    }
        
    let dir = fs.readdirSync(p);

    dir.map(function(file)
    {
        if ( p.endsWith("/") == false)
        {
            p = p + "/";
        }
            
        let pf = p+file;
        let stat = fs.statSync(pf);
        let description = "";
        let repoName = "";
        if ( stat.isDirectory() )
        {
            let isBare = fs.existsSync(pf + '/HEAD' );
            let isRepository = fs.existsSync(pf + '/.git/HEAD' );

            if (isRepository || isBare)
            {
                if ( isBare )
                    description = pf + '/description';
                else
                    description = pf + '/.git/description';


                if ( fs.existsSync(description))
                    description = fs.readFileSync(description,"UTF-8");
                else
                    description = null;

                repoName = file;

/*
                if ( toplevel == false)
                    repoName = pf;
                else
                    repoName = file;
                    */
                
                repositories[repoName] = {};
                repositories[repoName].name = repoName;
                repositories[repoName].path = pf;
                repositories[repoName].tree = pf;
                repositories[repoName].description = description;
            }        
            else
            {
                recurseDirectory(pf , false);
            }
        }
    });

    return repositories;
}

function getRepositoryFromName(paths , repo)
{
    let allRepositories = getRepositories(paths);
    let rep = undefined;

    allRepositories.map(function(r)
    {
        if ( r.tree == repo )
        {
            rep = r;
        }
    });

    //return getRepositories([rep.path]);
    return rep;
}

/**
 * Return name of default branch as a string.
 */
function getDefaultBranch()
{
    return config.git.default_branch;
}

function getHead(repos , branch)
{
    if (branch == undefined)
        branch = getDefaultBranch();

}

function run(repos , action , fn)
{
    git.setOptions({
        cwd: repos.path,
    });

    switch ( action)
    {
        case ( "branch" ):
        {
            git.getLocalBranchList(function(branches)
            {
                if ( fn != undefined)
                    fn(branches);
            });
            break;
        }
        case ( "tree" ):
        {
            git.getTreeList(repos.branch,function(tree)
            {
                if ( fn != undefined)
                    fn(tree);
            });
            break;
        }
        case ( "readme" ):
        {
            git.getReadMe(repos.file.hash,function(result)
            {
                if ( fn != undefined)
                    fn(result);
            });
            break;
        }
        default:
        {
            //-- custom command
            break;
        }
    }
}

module.exports.run = run;
module.exports.getHead = getHead;
module.exports.getDefaultBranch = getDefaultBranch;
module.exports.getRepositories = getRepositories;
module.exports.getRepositoryFromName = getRepositoryFromName;
module.exports.recurseDirectory = recurseDirectory;