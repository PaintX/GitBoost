var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');
var password = require('../Password/password');

function _init()
{
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY , name TEXT , member_group_id INTEGER , email TEXT , joined INTEGER , language TEXT ,  password TEXT)");
       /* db.run("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY , parent INTEGER , nom TEXT , description TEXT , position INTEGER )");
        db.run("CREATE TABLE IF NOT EXISTS ads (id INTEGER PRIMARY KEY , title TEXT , categorie TEXT , region TEXT , pictures TEXT , price TEXT , email TEXT  , description TEXT , date INTEGER , seller TEXT)");
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
                password.cryptPassword("admin", function (err, key)
                {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    db.run("INSERT OR REPLACE INTO user ( name , member_group_id , email , joined , language ,  password ) VALUES (?,?,?,?,?,?)", ["remy", -1, "remy.arnaudin@wanadoo.fr", new Date().getTime(), "fr", key]);
                });
            }
        });
    });
}

module.exports.db = db;
module.exports.init = _init;