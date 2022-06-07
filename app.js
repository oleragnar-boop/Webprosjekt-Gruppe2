//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/userSchema')
const app = express();
const mongoDB = 'mongodb+srv://admin:adminpassword@cluster0.0nuub.mongodb.net/ExamMatch?retryWrites=true&w=majority'
const path = require('path');
const db = mongoose.connection;
const bcrypt = require('bcrypt')
const async = require('async');
const cookieParser = require('cookie-parser');
const _ = require('underscore');
const multer= require('multer');
const ImageModel = require("./models/image.model");

mongoose.connect(mongoDB, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
  .then(mongoose => {
    console.log('Connected to Database')
    const dataCollection = db.collection('ExamMatch') 
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    app.use(express.static(__dirname + '/assets'));
    app.use(express.static(__dirname + '/scripts'));
    app.use(express.static(__dirname + '/public'));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs')
    app.use(cookieParser());

    app.use(bodyParser.urlencoded({
      extended: true
    }))


    app.listen(process.env.PORT || 3000, function () {
      console.log('listening on 3000')
    })
    

    //Serving the login page
     app.get('/login', (req, res) => {
      res.render('loginpage.ejs')
    }) 
  
    //Serving the admin page
    app.get('/adminpage', (req, res) => {
      db.collection('users').find({isApproved: "no"}).toArray()
      .then(results => {
        let notVerified = results
        db.collection('users').find({isApproved: "yes"}).toArray()
        .then(results => {
          let verified = results
          res.render('adminpage.ejs', {notVerified: notVerified, verified: verified})
        })
      })
    })

    //Serving the register page
    app.get('/register', (req, res) => {
      res.render('registerpage.ejs')
    })

    //Serving the index page, checks if a user is logged in, if not they are sent to login
    app.get('/index', (req, res) => {
      let cookieObject = Object.values(req.cookies)
      let loginStatus = cookieObject[3]

      if (loginStatus != "yes") {
        res.redirect('/login')
      } else {
        res.render('index.ejs')
        console.log(loginStatus)
      }
    })

    //Serving the profile page
    app.get('/profile', (req, res) => {
      res.render('profile.ejs')
    })


    //GET for the open and closed requests on the landing page, also serves said landing page
    app.get('/', async (req, res) => {

      res.clearCookie("role");
      res.clearCookie("user");
      res.clearCookie("_id");
      res.clearCookie("isLoggedIn");

      console.log(req.cookies) 

      db.collection('requests').count({
        open: "false"
      })
        .then(results => {
          let closedCount = results;
          db.collection('requests').count({
            open: "true"
          })
            .then(results => {
              let openCount = results;
              res.render('landing.ejs', {
                openCount: openCount,
                closedCount: closedCount
              })
            })
        })
    })

    //POST to register new user
    app.post('/addUser', async (req, res) => {
      let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        affSchool: req.body.affSchool,
        email: req.body.email,
        jobTitle: "",
        jobLink: "",
        languages: "",
        empStatus: "",
        workingHours: 0,
        tags: "",
        avatar: 1,
        adminStatus: "none",
        isApproved: "no",
        bookmarkedTeachers: "",
        bookmarkedRequests: ""
        //personalNotes: ["", ""]
      })
      try {
        newUser.save()
        res.redirect('/register')
        console.log(newUser)
      } catch (err) {
        console.log(err)
      }
    })


    //POST for logging user in, setting cookies for later reference
    app.post('/loginUser', function(req, res) {
      async.waterfall([
        function (callback) {
          db.collection('users').findOne({
            "email": req.body.email,
            "isApproved": "yes"
          }, function (err, result) {
            if (err) {
              console.log(err);
              res.send({error: "An error has occurred"});
            } else {
              if (result == null) {
                res.send({"error": "This email address is not recognised, please check you have entered your email correctly"});
              } else {
                console.log("Email recognised");
                bcrypt.compare(req.body.password, result.password, function(err, data) {
                  if (err){
                    console.log("Something went wrong, please try again")
                  }
                  if (data) {
                    console.log("Login successful, redirecting")
 
                    res.cookie('user', result.email, {expire : new Date(Date.now()+ 86400*1000)} )
                    res.cookie('role', result.role, {expire : new Date(Date.now()+ 86400*1000)} )
                    res.cookie('_id', result._id, {expire : new Date(Date.now()+ 86400*1000)} )
                    res.cookie('isLoggedIn', "yes", {expire : new Date(Date.now()+ 86400*1000)} )

                    res.redirect('/index')
                  } else {
                    console.log("Wrong password")
                  }
                })
              }
            }
          });
        },
        function (res, callback){
          var hashedPass = res.password;
          bcrypt.compare(req.body.password, hashedPass, function(err, res) {
            if (err){
              console.log("Something went wrong, please try again")
            }
            if (res) {
              console.log("Passwords Match, attempting login")
                redirect('/index')
            } else {S
              console.log("Wrong password")
            }
          });
          }
      ])
    });

    //POST for making a user verified
    app.post('/verifyUser', async (req, res) => {
      db.collection('users').findOneAndUpdate(
        {
          email: req.body.email
        },
        {
          $set:
          {
            isApproved: "yes"         
          }
        },
      ).then((result) => {
        res.redirect('/adminpage')
      })
        .catch((error) => console.error(error));
    })

    app.post('/updateUser', async (req, res) => {
      db.collection('users').findOneAndUpdate(
        {
          email: req.body.email
        },
        {
          $set:
          {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: req.body.password,
            affSchool: req.body.affSchool,      
          }
        },
      ).then((result) => {
        res.redirect('/adminpage')
      })
        .catch((error) => console.error(error));
    })

    //GET that functions as a delete
    app.get('/deleteuser', async (req, res) => {
      db.collection('users').findOneAndDelete({ email: req.query.email })
        .then(results => {
          res.redirect( '/adminpage')
        })
    })

//Storing Image

const Storage = multer.diskStorage({
  destination: 'uploads',
  filename:(req,file,cb) => {
    cb(null, file.originalname)
  },
});

const upload = multer({
  storage:Storage
}).single('testImage')

/* app.get("/", (req, res) => {
  res.send("upload file");
}); */

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      console.log(err)
    }
    else{
      const newImage = new ImageModel({
        name: req.body.name,
        image:{
          data:req.file.filename,
          contentType:'image/png'
        }
      })
      newImage.save()
      .then(() => res.send('successfuly uploaded'))
      .catch(err=>console.log(err))
    }
  })
})


    /*endre denna for å legge te ny side
    app.get('/', (req, res) => {
      res.render('landing.ejs')
    })*/

    /*     //GET to fetch all the students from the user_data collection in mongodb
        app.get('/data', async (req, res) => {
          db.collection('user_data').find().toArray()
            .then(results => {
              res.render('data', { user_data: results, currentId: req.query.searchid, currentdegree: req.query.degree })
            })
        })

        //GET that functions as a DELETE, uses the current searchid to find and delete a user with a matching id from the database 
        app.get('/delstudent', async (req, res) => {
          let currentid = parseInt(req.query.searchid);
          let currentdegree = req.query.degree;
          db.collection('user_data').findOneAndDelete({ student_id: currentid })
            .then(results => {
              res.render('data', { user_data: results, currentId: currentid, currentdegree: currentdegree })
              console.log("Student", currentid, "Deleted")
            })
        })
        */

        //404 page to show users on invalid routes
        app.get('*', function(req, res) {
          res.render('404.ejs')
        });
  });