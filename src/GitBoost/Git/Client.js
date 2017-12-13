var fs = require('fs');


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

module.exports.getRepositories = getRepositories;
module.exports.recurseDirectory = recurseDirectory;