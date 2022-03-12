var express = require("express");
app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

mongoose.connect("mongodb://localhost/taskboard_app");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());

var taskSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    text: String,
    author: String,
    points: Number,
    created: { type: Date, default: Date.now }
});

var Task = mongoose.model("Task", taskSchema);

app.use(require("express-session")({
    secret: "Once i won",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/select", function(req, res) {
    res.render("select");
});

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/signup", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/tasks");
        });
    });
});

app.post("/signup", function(req, res) {
    var newUser1 = new User({ username: req.body.username });
    User.register(newUser1, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/tasks");
        });
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/loginm", function(req, res) {
    res.render("loginm");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/tasks",
    failureRedirect: "/login"
}), function(req, res) {});

app.post("/loginm", passport.authenticate("local", {
    successRedirect: "/tasks",
    failureRedirect: "/loginm"
}), function(req, res) {});

app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/tasks");
});

app.get("/tasks", function(req, res) {
    Task.find({}, function(err, tasks) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { tasks: tasks, currentUser: req.user });
        }
    });
});

app.get("/tasks/new", function(req, res) {
    res.render("new");
});

app.post("/tasks", function(req, res) {
    Task.create(req.body.task, function(err, newTask) {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/tasks");
        }
    });
});

app.get("/tasks/:id", function(req, res) {
    Task.findById(req.params.id, function(err, foundtask) {
        if (err) {
            res.redirect("/tasks");
        } else {
            res.render("show", { task: foundtask });
        }
    });
});

app.get("/tasks/:id/edit", function(req, res) {
    Task.findById(req.params.id, function(err, foundtask) {
        if (err) {
            res.redirect("/tasks");
        } else {
            res.render("edit", { task: foundtask });
        }
    });
});

app.put("/tasks/:id", function(req, res) {
    Task.findByIdAndUpdate(req.params.id, req.body.task, function(err, updatedTask) {
        if (err) {
            res.redirect("/tasks");
        } else {
            res.redirect("/tasks/" + req.params.id);
        }
    });
});

app.delete("/tasks/:id", function(req, res) {
    Task.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/tasks");
        } else {
            res.redirect("/tasks");
        }
    });
});

app.get("/tasks/:id/comments/new", function(req, res) {
    Task.findById(req.params.id, function(err, task) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments", { task: task });
        }
    });
});

app.post("/tasks/:id/comments", function(req, res) {
    Task.findById(req.params.id, function(err, task) {
        if (err) {
            console.log(err);
            res.redirect("/tasks");
        } else {
            Task.create(req.body.task, function(err, newTask) {
                if (err) {
                    res.render("comments");
                } else {
                    res.redirect("/tasks");
                }
            });
        }
    });
});

app.listen(3000, function(req, res) {
    console.log("server is running");
});