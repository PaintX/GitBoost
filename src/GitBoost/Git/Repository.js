var fs = require('fs');
var client = require('./Client');
var tree = require("./Tree");

function getHead(repos , fn)
{
    let file = '';
    if ( fs.existsSync(repos.path + '/.git/HEAD') )
        file = fs.readFileSync(repos.path + '/.git/HEAD',"UTF-8");
    else if ( fs.existsSync(repos.path + '/HEAD') )
        file = fs.readFileSync(repos.path + '/HEAD',"UTF-8");

    // Find first existing branch
    let fileLines = file.split("\n");

    fileLines.map(function(line)
    {
        let regexp = new RegExp('ref: refs/heads/(.+)');
        let m = line.match(regexp);
        if ( m == undefined)
            return;

        hasBranch(repos , m[1] , function(status)
        {
            if ( status == true )
                fn(m[1]);
        });
    });
}

/**
 * Check if a specified branch exists
 *
 * @param  string  $branch Branch to be checked
 * @return boolean True if the branch exists
 */
function hasBranch(repos , branch , fn)
{
    getBranches(repos , function(branches)
    {
        let status = false;
        branches.map(function(branche)
        {
            if ( branche == branch)
            status = true;
        });

        if ( fn != undefined)
            fn(status);
    });
}


/**
 * Show a list of the repository branches
 *
 * @return array List of branches
 */
function getBranches(repos , fn)
{
    let branches = client.run(repos , "branch" , function(branches)
    {
        let regexp = new RegExp('[\*\s]');
        let _branches = [];
        branches.map(function(branche)
        {
            _branches.push(branche.replace(regexp,'').trim());
        });
        
        if ( fn != undefined)
            fn(_branches)
    });
}

/**
 * Get the Tree for the provided folder
 *
 * @param  string $tree Folder that will be parsed
 * @return Tree   Instance of Tree for the provided folder
 */
function getTree(repos , tre , fn)
{
    tree.parse(repos, tre , fn);
}


/**
 * Returns an Array where the first value is the tree-ish and the second is the path
 *
 * @param  \GitList\Git\Repository $repository
 * @param  string                  $branch
 * @param  string                  $tree
 * @return array
 */
function extractRef(repository, branch , tree )
{
    return branch;
/*    if ( branch == undefined )
        branch = '';

    if ( tree == undefined )
        tree = '';

    branch = branch.trim();
    tree = tree.trim();

    let input = branch + '/' + tree;
*/
// If the ref appears to be a SHA, just split the string
/*if (preg_match("/^([[:alnum:]]{40})(.+)/", $input, $matches)) {
$branch = $matches[1];
} else {
// Otherwise, attempt to detect the ref using a list of the project's branches and tags
$validRefs = array_merge((array) $repository->getBranches(), (array) $repository->getTags());
foreach ($validRefs as $key => $ref) {
if (!preg_match(sprintf("#^%s/#", preg_quote($ref, '#')), $input)) {
unset($validRefs[$key]);
}
}

// No exact ref match, so just try our best
if (count($validRefs) > 1) {
preg_match('/([^\/]+)(.*)/', $input, $matches);
$branch = preg_replace('/^\/|\/$/', '', $matches[1]);
} else {
// Extract branch name
$branch = array_shift($validRefs);
}
}

return array($branch, $tree);*/
}

function getReadme(repository, branch , fn)
{
    let files = tree.get();
    let objRet = {};

    files.map(function ( file )
    {
        if ( file.name.toLowerCase().startsWith("readme") == true )
        {
            objRet.filename = file.name;
            repository.file = file;
            client.run(repository , "readme" , function(text)
            {
                objRet.content = text;
                if ( fn != undefined)
                    fn(objRet);
            });
        }
    });
}

module.exports.getReadme = getReadme;
module.exports.extractRef = extractRef;
module.exports.getHead = getHead;
module.exports.getTree = getTree;
module.exports.getBranches = getBranches;
