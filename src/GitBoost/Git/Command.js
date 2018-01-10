var _, exec, gitExec, gitExecSync , options , execSync;

exec = require('child_process').exec;
execSync = require('child_process').execSync;
var md5 = require('md5');

_ = require('lodash');

options = {
  cwd: './'
};

gitExecSync = function(cmd)
{
  try {
    return execSync("git " + cmd, {
      cwd: options.cwd,
      encoding :"UTF-8"
    });
  }
  catch(_error)
  {
    console.log(_error);
  }
};

gitExec = function(cmd, timeout, callback, callbackIteration) {
    var error, git, result;
    if (timeout == null) {
      timeout = 10000;
    }
    if (typeof timeout === 'function') {
      callbackIteration = callback;
      callback = timeout;
      timeout = 10000;
    }
    result = '';
    try {
      git = exec("git " + cmd, {
        cwd: options.cwd
      });
      git.stdout.on('data', function(data) {
        data = data.toString() || '';
        data = data.trim();
        result += data;
        return typeof callbackIteration === "function" ? callbackIteration(data) : void 0;
      });
      git.stdout.on('error', function(data) {
        data = data.toString() || '';
        data = data.trim();
        result += data;
        return typeof callbackIteration === "function" ? callbackIteration(data) : void 0;
      });
      git.stderr.on('data', function(data) {
        data = data.toString() || '';
        data = data.trim();
        result += data;
        return typeof callbackIteration === "function" ? callbackIteration(data) : void 0;
      });
      git.stderr.on('error', function(data) {
        data = data.toString() || '';
        data = data.trim();
        result += data;
        return typeof callbackIteration === "function" ? callbackIteration(data) : void 0;
      });
      return git.stdout.on('close', function() {
        return typeof callback === "function" ? callback(result) : void 0;
      });
    } catch (_error) {
      error = _error;
      console.log(error);
      return typeof callback === "function" ? callback(null) : void 0;
    }
  };

  module.exports = {
    setOptions: function(opt) {
      return _.merge(options, opt);
    },
    clone: function(repo, dest, callback) {
      return gitExec("clone " + repo + " " + dest, callback);
    },
    getHash: function(fileName, callback) {
      return gitExec("log -n 1 --pretty=\"%H\" -- " + fileName, callback);
    },
    diffMaster: function(fileName, timeout, callback) {
      return gitExec("diff master -- " + fileName, timeout, callback);
    },
    checkout: function(branchName, timeout, callback) {
      return gitExec("checkout " + branchName, timeout, callback);
    },
    getBranchName: function(callback) {
      return gitExec("branch", function(result) {
        return result.split("\n").forEach(function(item) {
          if (item.indexOf('*') === 0) {
            return typeof callback === "function" ? callback(item.replace(/\*\s/g, '')) : void 0;
          }
        });
      });
    },
    createBranch: function(branchName, callback) {
      return gitExec("checkout -b " + branchName, callback);
    },
    add: function(callback) {
      return gitExec("add -A", callback);
    },
    commit: function(message, callback) {
      return gitExec("commit -am '" + message + "'", callback);
    },
    pull: function(callback) {
      return this.getBranchName(function(branch) {
        return gitExec("pull origin " + branch, callback);
      });
    },
    merge: function(branchName, mergeOptions, callback) {
      if (typeof mergeOptions === 'function') {
        callback = mergeOptions;
        mergeOptions = '';
      }
      return gitExec("merge " + branchName + " " + mergeOptions, callback);
    },
    push: function(callback, callbackIteration) {
      return this.getBranchName(function(branch) {
        return gitExec("push origin " + branch, callback, callbackIteration);
      });
    },
    fetch: function(callback) {
      return gitExec("fetch", callback);
    },
    getConflictList: function(callback) {
      return gitExec("diff --name-only --diff-filter=U", function(result) {
        return typeof callback === "function" ? callback(result.split("\n")) : void 0;
      });
    },
    getUncommittedList: function(callback) {
      return gitExec("diff --name-only", function(result) {
        return typeof callback === "function" ? callback(result.split("\n")) : void 0;
      });
    },
    getLastChanges: function(callback) {
      return gitExec('log -n 2 --pretty="%H"', function(hash) {
        var lastOtherHash;
        lastOtherHash = hash.split('\n')[1];
        if (!lastOtherHash) {
          lastOtherHash = hash.slice(hash.length / 2);
        }
        return gitExec("difftool " + lastOtherHash + " --name-status", callback);
      });
    },
    getDiff: function(revision, callback) {
      return gitExec("diff " + revision + " --name-only", function(result) {
        return typeof callback === "function" ? callback(result.split("\n")) : void 0;
      });
    },
    reset: function(callback) {
      return gitExec("reset --hard HEAD", callback);
    },
    removeLocalBranch: function(branchName, callback) {
      return gitExec("branch -D " + branchName, callback);
    },
    removeRemoteBranch: function(branchName, callback) {
      return gitExec("push origin --delete " + branchName, callback);
    },
    getLocalBranchList: function(callback) {
      return gitExec("branch", function(result) {
        var branches;
        branches = result.split("\n").map(function(item) {
          return item.trim().replace(/\*\s+/);
        });
        return typeof callback === "function" ? callback(branches) : void 0;
      });
    },
    getLocalBranchListSync: function() {
        let result = gitExecSync("branch");
        let req = new RegExp(/\*\s+/);
        let branches = [];
         result.split("\n").map(function(item) {
          if ( item.trim().replace(req,"").length != 0)
            branches.push(item.trim().replace(req,""));
        });
        return branches;
    },
    getLocalTagsListSync : function()
    {
      let result = gitExecSync("tag");
      let tags = [];
      result.split("\n").map(function(item) {
        if ( item.trim().length != 0)
        {
          tags.push(item.trim());
        }
      });
      return tags;
    
    },
    getRemoteBranchList: function(callback) {
      return gitExec("branch -r", function(result) {
        var branches;
        branches = result.split("\n").filter(function(item) {
          return item.indexOf("origin/HEAD") === -1;
        }).map(function(item) {
          return item.trim().replace(/\s+\*\s+/).replace("origin/", "");
        });
        return typeof callback === "function" ? callback(branches) : void 0;
      });
    },
    getTimeOfLastCommit: function(branchName, callback) {
      return gitExec("show --format='%ci %cr' " + branchName, function(result) {
        var date, dateTimeStr;
        dateTimeStr = result.split('\n')[0].split(' ');
        date = new Date(dateTimeStr[0] + " " + dateTimeStr[1] + " " + dateTimeStr[2]);
        return callback(date.getTime());
      });
    },
    getTreeList : function ( branchName , callback)
    {
        return gitExec("ls-tree -l " + branchName , function(result)
        {
            return callback(result);
        });
    },
    getTreeListSync : function ( branchName )
    {
      let result = gitExecSync("ls-tree -l " + branchName );
      let lines = [];
      if ( result == undefined)
        return lines;
      result.split('\n').map(function(line){
          if ( line.trim().length != 0)
          {
            lines.push(line);
          }
      });

      return lines;
    },
    getReadMe : function ( hash , callback )
    {
      return gitExec("cat-file -p " + hash , function(result)
      {
          return callback(result);
      });
    },
    getFileSync : function( hash )
    {
        return gitExecSync("cat-file -p " + hash);
    },
    getCommitsListSync : function ( )
    {
      let result = gitExecSync("branch --v");

      let req = new RegExp(/\*\s+/);
      let branchesTab = [];
       result.split("\n").map(function(item) {
        if ( item.trim().replace(req,"").length != 0)
          branchesTab.push(item.trim().replace(req,""));
      });
      let branches = [];

      branchesTab.map(function(branch){
        let tabBr = [];
        
        branch.split(" ").map(function(entry)
        {
          if ( entry != "")
            tabBr.push(entry);
        });

        branches.push({ nom : tabBr[0] , parent : tabBr[1] });

      });

      let logs = gitExecSync('log --pretty=format:"%H | %h | %an | %cd | %s | %D | %p ##"');

      let tab = [];
      
      if ( logs != undefined)
        tab = logs.split('##\n');

      let commitsList = [];
      tab.map(function(t)
      {
        let obj = {};

        let infos = t.split(' | ');


        obj.hash = infos[0];
        obj.short_hash = infos[1];
        obj.author = infos[2];
        obj.authorMD5 = md5(infos[2].toLowerCase()) ;
        obj.dateCommit = infos[3];
        obj.message = infos[4]; //.replace("##" , "" );
/*
        let str = infos[5];//.replace("##" , "" );
        if ( str == " ")
          str = "";

        if ( str.startsWith("tag: ") )
        {
          obj.tag = str.replace("tag: " , "" );
        }
*/
       let parentStr = infos[6].replace("##" , "" );

        obj.parent = parentStr;
/*
        branches.map(function(branch){
          if ( branch.parent == obj.short_hash )
          {
            obj.infos = {};
            obj.infos.branche = branch.nom;

            let hashTab = [] ;
            infos[6].replace("##" , "" ).split(" ").map(function(entry)
            {
              if ( entry != "" )
                hashTab.push(entry);
            });

            if ( hashTab.length == 1 )
              obj.infos.action = "commit";

            if ( hashTab.length == 2 )
            {
                obj.infos.action = "merge";

                branches.map(function(branch){
                    if ( hashTab[1] ==  branch.parent)
                    {
                      obj.infos.dest = branch.nom;
                    }
                });
                
            }
            
            obj.infos.parent = obj.short_hash;

            branch.parent = hashTab[0];
          }
        });
*/
        commitsList.push(obj);
      });

/*
      let masterHash = {}
      branchesTab.map(function(branch){
        let tabBr = [];
        
        branch.split(" ").map(function(entry)
        {
          if ( entry != "")
            tabBr.push(entry);
        });

        if ( tabBr[0] == "master")
        masterHash = { nom : tabBr[0] , parent : tabBr[1] } 
      });

      commitsList.map(function(commit)
      {
        if ( commit.short_hash == masterHash.parent )
        {
          commit.infos.branche = masterHash.nom;
          masterHash.parent = commit.infos.parent;
        }
      });
*/
      return commitsList;
    },
    getRecursivTreeListSync : function(branchName)
    {
      let result = gitExecSync("ls-tree -r -l " + branchName );
      let lines = [];
      if ( result == undefined)
        return lines;

      result.split('\n').map(function(line){
          if ( line.trim().length != 0)
          {
            lines.push(line);
          }
      });

      return lines;
    },
    getAuthorSync : function ( branchName )
    {
      let result = gitExecSync('log --pretty=format:"%an||%ae" ' + branchName );
      let lines = [];
      if ( result == undefined)
        return lines;
      result.split('\n').map(function(line){
          if ( line.trim().length != 0)
          {
            lines.push(line);
          }
      });
      return lines;
    },
    getGraphSync : function ( )
    {
      let result = gitExecSync("log --branches --graph --oneline --parents");
      let lines = [];
      result.split('\n').map(function(line){
          if ( line.trim().length != 0)
          {
            lines.push(line);
          }
      });
      return lines;

    },
    getBranchesWithHashSync : function()
    {
      let result = gitExecSync("branch -av | cut -b 3-");
      let lines = [];
      result.split('\n').map(function(line){
          if ( line.trim().length != 0)
          {
            lines.push(line);
          }
      });
      return lines;
    },
    getLogsForGraph : function()
    {
      return gitExecSync('log --all --date-order --pretty="%h|%p|%d"');
    }

  };