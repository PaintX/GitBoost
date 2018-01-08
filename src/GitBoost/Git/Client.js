var fs = require('fs');
var config = require("../../../config");
var git = require('./Command');
var pretty = require('prettysize')
var md5 = require('md5');

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

    return rep;
}


function getHead(repos)
{
    let file = '';
    if ( fs.existsSync(repos.path + '/.git/HEAD') )
        file = fs.readFileSync(repos.path + '/.git/HEAD',"UTF-8");
    else if ( fs.existsSync(repos.path + '/HEAD') )
        file = fs.readFileSync(repos.path + '/HEAD',"UTF-8");

    // Find first existing branch
    let fileLines = file.split("\n");
    let branche = undefined; 
    fileLines.map(function(line)
    {
        let regexp = new RegExp('ref: refs/heads/(.+)');
        let m = line.match(regexp);
        if ( m == undefined)
            return;

        if ( hasBranch(repos , m[1]) == true )
        {
            branche = m[1];
        }
    });

    return branche;
}

/**
 * Check if a specified branch exists
 *
 * @param  string  $branch Branch to be checked
 * @return boolean True if the branch exists
 */
function hasBranch(repos , branch)
{
    git.setOptions({cwd : repos.path});
    let branches = git.getLocalBranchListSync();
    let status = false;
    branches.map(function(branche)
    {
        if ( branche == branch)
        status = true;
    });

    return status;
}


/**
 * Show a list of the repository branches
 *
 * @return array List of branches
 */
function getBranches(repos)
{
    git.setOptions({cwd : repos.path});
    let regexp = new RegExp('[\* ]');
    let branches = [];
    git.getLocalBranchListSync().map(function(b){
        branches.push(b.replace(regexp,'').trim());
    });

   return branches;
}

function getTags(repos , branch )
{
    git.setOptions({cwd : repos.path});  
    return git.getLocalTagsListSync();
}


/**
 * Get the Tree for the provided folder
 *
 * @param  string $tree Folder that will be parsed
 * @return Tree   Instance of Tree for the provided folder
 */
function getTree(repos , branch )
{
    let files = [];
    git.setOptions({cwd : repos.path});
    let treeLines = git.getTreeListSync(branch);
    let tree = [];

    treeLines.map(function(line)
    {
        let obj = {};
        let infos = [];
        line.replace('\t' , " ").split(" ").map(function(l){

            if ( l.length > 0)
            {
                infos.push(l);
            }
        });



        obj.type = infos[1];
        obj.name = infos[4];
        obj.size = infos[3];
        obj.mode = infos[0];
        obj.hash = infos[2];
        obj.path = repos.path + "/" + obj.name;

        files.push(obj);
    });

    files.sort(function(a , b )
    {
        return b.type.localeCompare(a.type);
    });

    return files;
}

function getReadMe(repos , branch)
{
    let objRet = {};
    git.setOptions({cwd : repos.path});
    getTree(repos , branch).map(function(fi){
        if ( fi.type == "blob" && fi.name.toLowerCase().startsWith("readme"))
        {
            objRet.filename = fi.name;
            objRet.content = git.getFileSync(fi.hash);
        }
    });

    return objRet;
}

function getCommits(repos)
{
    git.setOptions({cwd : repos.path});
    return git.getCommitsListSync();
}

function getStats(repos , branch)
{
    git.setOptions({cwd : repos.path});
    let lines = git.getRecursivTreeListSync(branch);
    let files = [];
    lines.map(function(line)
    {
        let obj = {};
        let infos = [];

        line.replace('\t' , " ").split(" ").map(function(l){

            if ( l.length > 0)
            {
                infos.push(l);
            }
        });

        obj.type = infos[1];
        obj.name = infos[4];
        obj.size = infos[3];
        obj.mode = infos[0];
        obj.hash = infos[2];
        if ( obj.name.lastIndexOf('.') != -1 )
            obj.extension = obj.name.substring(obj.name.lastIndexOf('.'), obj.name.length);
        obj.path = repos.path + "/" + obj.name;

        files.push(obj);
    });

    let extensions = {};
    let extTab = [];
    let totalSize = 0;
    files.map(function(file){

        if ( file.extension != undefined )
        {
            if ( extensions[file.extension] == undefined )
                extensions[file.extension] = 0;

            totalSize += parseInt(file.size);
            extensions[file.extension]++;            
        }
    });

    let nbFiles = 0;
    for ( let key in extensions)
    {
        nbFiles+= extensions[key];
        extTab.push({name : key , nb : extensions[key]});
    }

    return {extensions : extTab , nbFiles : nbFiles , totalSize : pretty(totalSize)};
}

function getAuthorStatistics(repos , branch )
{
    git.setOptions({cwd : repos.path});
    let lines = git.getAuthorSync(branch);
    let users = [];
    let user = {};
    lines.map(function(line)
    {
        if (user[line] == undefined ) 
            user[line] = 0;       
        user[line]++;
    });

    for ( let key in user)
    {
        users.push({user : key.split("||")[0] , email : key.split("||")[1] , commits : user[key] , gravatarMD5 :md5(key.split("||")[1].toLowerCase()) });
    }

    return users;
}

function getGraph(repos)
{
    git.setOptions({cwd : repos.path});
    let lines = git.getGraphSync();

    return lines;
}

function getBranchesWithHash(repos)
{
    git.setOptions({cwd : repos.path});
    let lines = [];
    git.getBranchesWithHashSync().map(function(l)
    {
        let line = [];
        l.split(" ").map(function ( word ) {
            if ( word != "" )
                line.push(word);
        });
        lines.push(line);
    });
    return lines;
}

function getLogsForGraph(repos)
{
    git.setOptions({cwd : repos.path});
    return git.getLogsForGraph();
}

module.exports.getLogsForGraph = getLogsForGraph;
module.exports.getBranchesWithHash = getBranchesWithHash;
module.exports.getGraph = getGraph;
module.exports.getAuthorStatistics = getAuthorStatistics;
module.exports.getStats = getStats;
module.exports.getCommits = getCommits;
module.exports.getReadMe = getReadMe;
module.exports.getTags = getTags;
module.exports.getTree = getTree;
module.exports.getBranches = getBranches;
module.exports.getHead = getHead;
module.exports.getRepositories = getRepositories;
module.exports.getRepositoryFromName = getRepositoryFromName;
module.exports.recurseDirectory = recurseDirectory;