const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const app = express();
const port = process.env.PORT || 3000;
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM("");
const jquery = require('jquery')(dom.window);
const mongodb = require('mongodb');
const multer = require('multer');

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/views'));

var today = new Date(), lastvisit, lastdate;
let mongoClient = new mongodb.MongoClient('mongodb+srv://Zhandr:ggg2003ggg@mydb.xraqq.mongodb.net/myDB', { useUnifiedTopology: true });
var admin = { email: "admin@admin.com", password: "adminadmin" };
var accountname = "", accountEmail = "";
const binary = mongodb.Binary;
const router = express.Router();
app.use('/', router);


app.post('/', function (req, res) {
    res.render('index');
});
app.post('/content', function (req, res){
    res.render('cnt_mng');
})
app.post('/register', function(req, res){
    var b= true, p = true, h = 100, e = "", u = "";
    res.render('register', {b,p,h,e,u});
})
app.get('/lib', function (req, res){
    const b = 5;
    res.render('search', {b});
})
app.post('/registering', function (req, res) {
    if (today.getHours() <= 9) {
        lastvisit += "0";
    }
    lastvisit = today.getHours() + ":";
    if (today.getMinutes() <= 9) {
        lastvisit += "0";
    }
    lastvisit += today.getMinutes();
    lastdate = today.getDate() + "." + today.getMonth() + "." + today.getFullYear();
    let userInfo = {
        username: req.body.rusername,
        email: req.body.remail,
        password: req.body.rpassword,
        cpassword: req.body.rconfirm
    };
    var e = userInfo['email'], u = userInfo['username'];
    if (userInfo['username'] == '' || userInfo['email'] == '' || userInfo['password'] == '' || userInfo['cusername'] == '') {
        var b = true, p = true, h = 50;
        return res.render('register', { b, p, h, e, u });
    }

    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            console.log("Database Connected");
            let db = mongo.db('myDB');
            let coll = db.collection('users');
            let r = await coll.count({ email: userInfo['email'] });
            if (r == 0) {
                if (userInfo['password'] == userInfo['cpassword']) {
                    var up = false, low = false, ch = false;
                    function isAlpha(char) {
                        return (/[a-zA-Z]/).test(char);
                    }
                    if (userInfo['password'].length < 8) {
                        var b = true, p = true, h = 1;
                        res.render('register', { b, p, h, e, u });
                    }
                    for (let i = 0; i < userInfo['password'].length; i++) {
                        if (!isAlpha(userInfo['password'][i])) {
                            ch = true;
                        }
                        else {
                            if (userInfo['password'][i] == userInfo['password'][i].toUpperCase()) {
                                up = true;
                            }
                            else if (userInfo['password'][i] == userInfo['password'][i].toLowerCase()) {
                                low = true;
                            }
                        }
                        if (low && up && ch) { break; }
                    }
                    if (low && up && ch) {
                        var obj = { username: userInfo['username'], email: userInfo['email'], password: userInfo['password'], date: (lastvisit + "|" + lastdate) };
                        coll.insertOne(obj);
                        accountname = userInfo['username'];
                        accountEmail = userInfo['email'];
                        mongoClient.connect(async function (error, mongo) {
                            if (error) { throw error; }
                            else {
                                var db = mongo.db('UserMessages');
                                db.createCollection(accountEmail, function (err, ress) {
                                    if (err) { throw err; }
                                    console.log(accountEmail + " Collection created");
                                })
                            }
                        });
                        var y = true;
                        mongoClient.connect(async function (error, mongo) {
                            if (error) { throw error; }
                            else {
                                let db = mongo.db('FavoriteBooks');
                                db.createCollection(accountEmail, function (err, ok) {
                                    if (err) { throw err; }
                                    console.log(accountEmail + ' fav collection created');
                                })
                            }
                        });
                        res.render('home', { accountname, accountEmail, y });
                    }
                    else {
                        console.log(low + " " + up + " " + ch);
                        var b = true, p = true, h = 2;
                        res.render('register', { b, p, h, e, u });
                    }
                }
                else {
                    var b = true, p = false, h = true;
                    res.render('register', { b, p, h, e, u });
                }
            }
            else {
                var b = true, p = true, h = 0;
                res.render('register', { b, p, h, e, u });
            }
        }
    });
});

app.post('/check', function (req, res) {
    if (today.getHours() <= 9) {
        lastvisit += "0";
    }
    lastvisit = today.getHours() + ":";
    if (today.getMinutes() <= 9) {
        lastvisit += "0";
    }
    lastvisit += today.getMinutes();
    lastdate = today.getDate() + "." + today.getMonth() + "." + today.getFullYear();
    let userInfo = {
        email: req.body.lname,
        password: req.body.lpassword,
    };
    var e = userInfo['email'], u = userInfo['username'];
    if (admin['email'] == userInfo['email'] && admin['password'] == userInfo["password"]) {
        mongoClient.connect(async function (error, mongo) {
            if (error) { throw error; }
            else {
                var b = false;
                let db = mongo.db('myDB');
                let coll = db.collection('users');
                let ans = await coll.find().toArray();
                accountEmail =admin['email'];
                accountname='admin';
                res.render('admin', { ans, mongoClient, b });
            }
        });
    }
    else {
        mongoClient.connect(async function (error, mongo) {
            if (error) { throw error; }
            else {
                console.log("Database Connected");
                let db = mongo.db('myDB');
                let coll = db.collection('users');
                let r = await coll.find({ email: userInfo['email'] }).toArray();
                let c = await coll.count({ email: userInfo['email'] });
                if (c != 0) {
                    if (r[0]['password'] == userInfo['password']) {
                        accountname = r[0]['username'];
                        accountEmail = userInfo['email'];
                        var y = true;
                        res.render('home', { accountname, accountEmail, y });
                    }
                    else {
                        var b = false, p = true, h = 0;
                        res.render('register', { b, p, h, e, u });
                    }
                }
                else {
                    var b = false, p = true, h = 0;
                    res.render('register', { b, p, h, e, u });
                }
            }
        });
    }
});
app.get('/admin1', function (req, res) {
    if (accountname == "" || accountEmail == "") {
        return res.redirect('/');
    }
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            var b = true;
            let db = mongo.db('myDB');
            let coll = db.collection('users');
            let ans = await coll.find().sort({ 'username': 1 }).toArray();
            res.render('admin', { ans, mongoClient, b });
        }
    });
});
app.get('/admin2', function (req, res) {
    if (accountname == "" || accountEmail == "") {
        return res.redirect('/');
    }
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            var b = true;
            let db = mongo.db('myDB');
            let coll = db.collection('users');
            let ans = await coll.find().sort({ 'email': 1 }).toArray();
            res.render('admin', { ans, mongoClient, b });
        }
    });
});
app.post('/delete', function (req, res) {
    var del = req.body.ema;
    console.log(del);
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let db = mongo.db('myDB');
            let coll = db.collection('users');
            coll.deleteOne({ "email": del });
            let mdb = mongo.db('UserMessages');
            mdb.collection(del).drop(function (err, ok) {
                if (err) { throw err; }
                if (ok) { console.log(del + 'collection deleted'); }
            })
            let fdb = mongo.db('FavoriteBooks');
            fdb.collection(del).drop(function (err, ok) {
                if (err) { throw err; }
                if (ok) { console.log(del + 'collection deleted'); }
            })
            res.redirect('/admin1');
        }
    })
});
app.post('/update', function (req, res) {
    var nn = req.body.newname, ne = req.body.newemail, del = req.body.ema;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let db = mongo.db('myDB');
            let coll = db.collection('users');
            console.log(nn + " " + ne + " " + del);
            if (nn != "" && ne != "") {
                coll.updateOne({ email: del }, { $set: { email: ne, username: nn } });
            }
            else if (nn == "" && ne != "") {
                coll.updateOne({ email: del }, { $set: { email: ne } });
            }
            else if (nn != "" && ne == "") {
                coll.updateOne({ email: del }, { $set: { username: nn } });
            }
            res.redirect('/admin1');
        }
    });
});
app.post('/sending', function (req, res) {
    var m = req.body.smsg;
    var em = req.body.semail;
    var y = true;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('myDB').collection('messages');
            let chck = await coll.count({ "email": em, "message": m });
            if (chck == 0) {
                var obj = { name: accountname, email: accountEmail, message: m };
                coll.insertOne(obj);
                res.render('home', { accountname, accountEmail, y });
            }
            else {
                y = false;
                res.render('home', { accountname, accountEmail, y });
            }
        }
    })
})
app.post('/gsending', function(req, res){
    var m = req.body.gmsg;
    var n = req.body.gname;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('myDB').collection('messages');
            var obj = { name: n, email: 'guest', message: m };
            coll.insertOne(obj);
            res.redirect('/');
        }
    })
})
app.post('/back', function (req, res) {
    var y = true;
    res.render('home', {accountname, accountEmail, y});
})
app.get('/profile', function (req, res) {
    res.render('MyAccountFinal', { accountname, accountEmail, lastdate });
})
app.get('/inboxx', function (req, res) {
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('myDB').collection('messages'), i = 0;
            var count = await coll.count();
            var arr = await coll.find().toArray();
            res.render('inboxx', { arr, count, i });
        }
    })
})
app.post('/answering', function (req, res) {
    var m = req.body.comment;
    var q = req.body.que;
    var ansEmail = req.body.ansEmail;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('myDB').collection('messages'), i = 0;
            coll.deleteOne({ "email": ansEmail, "message": q });
            let ucoll = mongo.db('UserMessages').collection(ansEmail);
            var obj = { QUESTION: q, ADMIN: m };
            ucoll.insertOne(obj);
            res.redirect('/inboxx');
        }
    })
})
app.post('/accinbox', function (req, res) {
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            console.log(accountEmail);
            let coll = mongo.db('UserMessages').collection(accountEmail);
            var ress = await coll.find().toArray();
            res.render('accountInbox', { ress });
        }
    });
})
app.post('/settings', function (req, res) {
    var h = 5;
    res.render('settings', { h });
})
app.post('/changeEmail', function (req, res) {
    var nn = req.body.changeName;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let db = mongo.db('myDB');
            let coll = db.collection('users');
            if (nn != null) {
                coll.updateOne({ email: accountEmail }, { $set: { username: nn } });
                accountname = nn;
            }
            res.redirect('/profile');
        }
    });
});

app.post('/changePassword', function (req, res) {
    let userInfo = {
        password: req.body.changePassword,
        cpassword: req.body.changeConfirm
    };
    var h = 0;
    console.log(userInfo['password'] + " " + userInfo['cpassword']);
    if (userInfo['password'] == userInfo['cpassword']) {
        var up = false, low = false, ch = false;
        function isAlpha(char) {
            return (/[a-zA-Z]/).test(char);
        }
        if (userInfo['password'].length < 8) {
            h = 0;
            return res.render('settings', { h });
        }
        for (let i = 0; i < userInfo['password'].length; i++) {
            if (!isAlpha(userInfo['password'][i])) {
                ch = true;
            }
            else {
                if (userInfo['password'][i] == userInfo['password'][i].toUpperCase()) {
                    up = true;
                }
                else if (userInfo['password'][i] == userInfo['password'][i].toLowerCase()) {
                    low = true;
                }
            }
            if (low && up && ch) { break; }
        }
        if (low && up && ch) {
            mongoClient.connect(async function (error, mongo) {
                if (error) { throw error; }
                else {
                    let coll = mongo.db('myDB').collection('users');
                    coll.updateOne({ email: accountEmail }, { $set: { password: userInfo['password'] } });
                }
            });
            h = 1; // acc
            return res.render('settings', { h });
        }
        else {
            h = 2; // chars
            return res.render('settings', { h });
        }
    }
    else {
        h = 4 // decl
        return res.render('settings', { h });
    }
})

app.post('/adding', function (req, res) {
    var bookInfo = {
        image: req.body.Image,
        author: req.body.Author,
        title: req.body.Title,
        publisher: req.body.Publisher,
        link: req.body.Link,
        isbn: req.body.Isbn
    }, b = 0;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            var obj = {
                IMAGE: bookInfo['image'],
                AUTHOR: bookInfo['author'],
                TITLE: bookInfo['title'],
                PUBLISHER: bookInfo['publisher'],
                LINK: bookInfo['link'],
                ISBN: bookInfo['isbn']
            }
            var coll = mongo.db('FavoriteBooks').collection(accountEmail);
            var cnt = await coll.count({ ISBN: bookInfo['isbn'] });
            if (cnt == 0) {
                coll.insertOne(obj);
                b = 1;
            }
            else {
                b = 2;
            }
            res.render('search', { b });
        }
    });

})
app.get('/favbooks', function (req, res) {
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('FavoriteBooks').collection(accountEmail);
            var arr = await coll.find().toArray();
            res.render('favbooks', { arr });
        }
    });
})
app.post('/bookdelete', function (req, res) {
    var i = req.body.isbn;
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('FavoriteBooks').collection(accountEmail);
            console.log(i);
            coll.deleteOne({ ISBN: i });
            res.redirect('/favbooks');
        }
    });
})
const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './views/uploads/files');
    },
    filename: function (request, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
})
const upload = multer({
    storage: storage
})
router.post('/upload', upload.single('pdf'), function (req, res) {
    let file = {
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        pdf: req.file.filename
    }
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('myDB').collection('adminContent');
            try {
                coll.insertOne(file);
                console.log('file inserted');
            }
            catch (err) {
                throw err;
            }
            res.redirect('/admin1');
        }
    });
});
app.post('/newly', function (req, res) {
    mongoClient.connect(async function (error, mongo) {
        if (error) { throw error; }
        else {
            let coll = mongo.db('myDB').collection('adminContent');
            var arr = await coll.find().toArray();
            res.render('newly', { arr });
        }
    });
})
app.listen(port, () => {
    console.log('run on port ' + port);
});
