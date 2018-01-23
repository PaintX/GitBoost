var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');
var passwordC = require('../Password/password');
var config = require('../../../config');
var apiKey = require('../ApiKey/apikey');

function _init()
{
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY , name TEXT , member_group_id INTEGER , email TEXT , joined INTEGER , language TEXT ,  password TEXT )");
        db.run("CREATE TABLE IF NOT EXISTS apiTable (id INTEGER PRIMARY KEY , key TEXT , user_id INTEGER )");
        /*db.run("CREATE TABLE IF NOT EXISTS ads (id INTEGER PRIMARY KEY , title TEXT , categorie TEXT , region TEXT , pictures TEXT , price TEXT , email TEXT  , description TEXT , date INTEGER , seller TEXT)");
        db.run("CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY , user_id INTEGER , token TEXT )");
        db.run("CREATE TABLE IF NOT EXISTS mails (id INTEGER PRIMARY KEY , seller_id INTEGER , user_infos TEXT , annonce TEXT , date INTEGER )");


        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [0,0, "Kartcross", "Kartcross", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [1,0, "Autocross", "Autocross", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [2,0, "RallyeTT", "RallyeTT", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [3,0, "Rallye", "Rallye", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [4,0, "Asphalte", "Asphalte", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [5,0, "Cote", "Cote", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [6,0, "Karting", "Karting", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [7,0, "Quad", "Quad", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [8,0, "Transport", "Transport", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [9,0, "Equipement", "Equipement", 0]);
        db.run("INSERT OR REPLACE INTO categories ( id, parent , nom , description , position  ) VALUES (?,?,?,?,?)", [10,0, "Divers", "Divers", 0]);
*/
        db.all("SELECT id AS id FROM user ", function (err, rows) {
            if (rows.length <= 0)
            {
                passwordC.cryptPassword(config.app.defaultPassword, function (err, key)
                {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    
                    db.run("INSERT OR REPLACE INTO user ( name , member_group_id , email , joined , language ,  password ) VALUES (?,?,?,?,?,?)", [config.app.defaultLogin, -1, "", new Date().getTime(), "fr", key]);
                    _connect(config.app.defaultLogin,config.app.defaultPassword,function(user)
                    {
                        db.run("INSERT OR REPLACE INTO apiTable (  key , user_id  ) VALUES (?,?)", [apiKey.generate(),user.id ]);
                    });
                    
                });
            }
        });
    });
}

module.exports.db = db;
module.exports.init = _init;

function _connect(login, password , ok , failed)
{
    db.all("SELECT * FROM user WHERE name = '" + login + "'", function (err, rows) {
        if (err)
        {
            debug(err);
            return;
        }

        //console.log(rows);

        if (rows.length == 0)
        {
            failed("Aucun utilisateur avec cet identifiant");
            return;
        }

        rows.map(function (user, idx) {
            if (user.name == login)
            {
                passwordC.comparePassword(password,user.password , function (err, isPasswordMatch) {

                    if (err)
                    {
                        debug(err);
                        return;
                    }

                    if ( isPasswordMatch == false )
                    {
                        failed("Utilisateur et/ou mot de passe incorrect");
                        return;
                    }

                    if (isPasswordMatch == true)
                    {
                        db.all("SELECT * FROM apiTable WHERE id = '" + user.id + "'", function (err, rows) {

                            if (rows.length == 0)
                            {
                                ok(user);
                                return;
                            }
                            else
                            {
                                user.api = rows[0].key;
                                ok(user);
                            }
                            
                        });
                    }
                        
                });
            }
        
        });
    });
}

module.exports.userConnect = _connect;


function _userExist(name , ok , failed)
{
    db.all("SELECT * FROM user WHERE name = '" + name + "'", function (err, rows) {
        if (err)
        {
            debug(err);
            failed(err);
            return;
        }

        if (rows.length == 0)
        {
            ok(false);
        }
        else
        {
            ok(true);
        }
    });
}
module.exports.userExist = _userExist;


function _apiExist(key , ok , fail)
{
    db.all("SELECT * FROM apiTable WHERE key = '" + key + "'", function (err, rows) {
        if ( rows.length > 0)
            ok()
        else
            fail();
    });
}

module.exports.apiExist = _apiExist;