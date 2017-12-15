var client = require('./Client');

let files = [];

function parse(repo , tree , fn)
{
    
    files = [];

    repo.branch = tree;
    client.run(repo , "tree" , function(result)
    {
        let req = new RegExp("/[\s]+/");
        
        result.split('\n').map(function(line)
        {
            let resultCompact = [];
            let obj = {};
            if ( line.length != 0)
            {
                line.replace('\t' , " ").split(" ").map(function(l){
                    if ( l.length > 0)
                    {
                        resultCompact.push(l);
                    }
                });

                if ( resultCompact[1] == 'commit')
                {
                    // submodule
                    return;
                }

                if ( resultCompact[0] == '120000')
                {

                }

                if ( resultCompact[1] == 'blob')
                {

                }

                obj.type = resultCompact[1];
                obj.name = resultCompact[4];
                obj.size = "0 kB";
                obj.mode = resultCompact[0];
                obj.hash = resultCompact[2];
                obj.path = repo.path + "/" + obj.name;

                files.push(obj);
            }
        });

        files.sort(function(a , b )
        {
            return b.type.localeCompare(a.type);
        });

        if ( fn != undefined )
            fn(files)
    });
}

function get()
{
    return files;
}
module.exports.get = get;
module.exports.parse = parse;