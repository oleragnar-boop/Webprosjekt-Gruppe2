//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/userSchema')
const School = require('./models/schoolSchema');
const Request = require('./models/requestSchema')
const app = express();
const mongoDB = 'mongodb+srv://admin:adminpassword@cluster0.0nuub.mongodb.net/ExamMatch?retryWrites=true&w=majority'
const path = require('path');
const db = mongoose.connection;
const bcrypt = require('bcrypt')
const async = require('async');
const cookieParser = require('cookie-parser');
const _ = require('underscore');
const multer = require('multer');
const ImageModel = require("./models/image.model");

mongoose.connect(mongoDB, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
  .then(mongoose => {
    console.log('Connected to Database')
    const dataCollection = db.collection('ExamMatch')
    const ObjectId = mongoose.Types.ObjectId;
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
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let userRole = cookieObject.role


      if (loginStatus == "yes" && userRole == "admin") {
        db.collection('users').find({ isApproved: "no" }).toArray()
          .then(results => {
            let notVerified = results
            db.collection('users').find({ isApproved: "yes" }).toArray()
              .then(results => {
                let verified = results
                db.collection('users').find({ isApproved: "yes" }).toArray()
                  .then(results => {
                    let verified = results
                    res.render('adminpage.ejs', { notVerified: notVerified, verified: verified })
                  })
              })
          })
      } else {
        res.redirect('/login')
      }
    })

    //Serving the register page
    app.get('/register', (req, res) => {
      res.render('registerpage.ejs')
    })

    //Serving the index page, checks if a user is logged in, if not they are sent to login
    app.get('/index', (req, res) => {
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let avatar = cookieObject.avatar
      let userEmail = cookieObject.user

      console.log(loginStatus)

      if (loginStatus == "yes") {
        db.collection('requests').find({
          open: "true"
        }).sort({_id:-1}).toArray()
          .then(results => {
            let openRequests = results;
            res.render('index.ejs', {
              openRequests: openRequests, avatar: avatar, userEmail: userEmail
            })
          })
      } else {
        res.redirect('/login')
      }
    })

    app.post('/applyForRequest', async (req, res) => {
      db.collection('requests').updateOne(
        {
          _id: ObjectId(`${req.body.requestid}`)
        },
        {
            $push: { suggestedTeachers: req.body.email }
          },
      ).then((result) => {
        console.log(result)
        res.redirect('/index')
      })
        .catch((error) => console.error(error));
    })

    app.get('/myrequests', (req, res) => {
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let currentUser = `${cookieObject.userfname} ${cookieObject.userlname}`
      let avatar = cookieObject.avatar


      if (loginStatus == "yes") {
        db.collection('requests').find({
          author: currentUser
        }).sort({_id:-1}).toArray()
          .then(results => {
            let myRequests = results;
            res.render('myrequests.ejs', {
              myRequests: myRequests, avatar: avatar
            })
          })
      } else {
        res.redirect('/login')
      }
    })

    app.post('/acceptATeacher', async (req, res) => {
      db.collection('requests').findOneAndUpdate(
        {
          _id: ObjectId(`${req.body.requestid}`)
        },
         {
          $set:
          {
            acceptedTeacher: req.body.email,
            open: "false"
          }
          } ,
      ).then((result) => {
        console.log(result)
        res.redirect('/index')
      })
        .catch((error) => console.error(error));
    })

    //Serving the profile page
    app.get('/profile', (req, res) => {
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let currentUserEmail = cookieObject.user
      let avatar = cookieObject.avatar

      if (loginStatus == "yes") {
        db.collection('users').findOne({
          email: currentUserEmail
        })
          .then(results => {
            let userData = results;
            db.collection('schools').find().toArray()
              .then(results => {
                let schoolData = results;
                res.render('profile.ejs', {
                  userData: userData, schoolData: schoolData, avatar: avatar
                })
              }
              )

          })
      } else {
        res.redirect('/login')
      }
    })

    app.get('/findteacher', (req, res) => {
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let currentUser = `${cookieObject.userfname} ${cookieObject.userlname}`
      let avatar = cookieObject.avatar


      if (loginStatus == "yes") {
        db.collection('users').find({
        }).toArray()
          .then(results => {
            let allUsers = results;
            res.render('findteacher.ejs', {
              allUsers: allUsers, avatar: avatar
            })
          })
      } else {
        res.redirect('/login')
      }
    })

    //Serving the teacherpage
     app.get('/teacherpage', (req, res) => {
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let avatar = cookieObject.avatar

      console.log(cookieObject)

      if (loginStatus == "yes") {
        db.collection('users').findOne({
          email: req.query.email
        })
          .then(results => {
            let userData = results;
                res.render('teacherpage.ejs', {
                  userData: userData, avatar: avatar
                })
              }
              )
      } else {
        res.redirect('/login')
      }
    }) 


    //GET for the open and closed requests on the landing page, also serves said landing page
    app.get('/', async (req, res) => {

      res.clearCookie("role");
      res.clearCookie("user");
      res.clearCookie("_id");
      res.clearCookie('userfname')
      res.clearCookie('userlname')
      res.clearCookie('isLoggedIn')
      res.clearCookie('avatar')

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

    app.get('/newrequest', (req, res) => {
      let cookieObject = req.cookies
      let loginStatus = cookieObject.isLoggedIn
      let avatar = cookieObject.avatar

      console.log(req.cookies)

      if (loginStatus == "yes") {
        res.render('newrequest.ejs', {
          avatar: avatar
        })
      } else {
        res.redirect('/login')
      }
    })

    //POST to register new user
    app.post('/addUser', async (req, res) => {
      let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        affSchool: req.body.affSchool,
        email: req.body.email,
        jobTitle: req.body.jobtitle,
        jobLink: req.body.link,
        languages: req.body.language,
        empStatus: req.body.empStatus,
        workingHours: 0,
        tags: req.body.tags,
        avatar: "avatar0.png",
        role: "standard",
        isApproved: "no",
        bookmarkedTeachers: "",
        bookmarkedRequests: "",
        description: req.body.description
      })
      try {
        newUser.save()
        res.redirect('/register')
        console.log(newUser)
      } catch (err) {
        console.log(err)
      }
    })

    //POST to register new school
    app.post('/profile', async (req, res) => {
      let newSchool = new School({
        name: req.body.name
      })
      try {
        newSchool.save()
        res.redirect('/profile')
        console.log(newSchool)
      } catch (err) {
        console.log(err)
      }
    })


    //POST for logging user in, setting cookies for later reference
    app.post('/loginUser', function (req, res) {
      async.waterfall([
        function (callback) {
          db.collection('users').findOne({
            "email": req.body.email,
            "isApproved": "yes"
          }, function (err, result) {
            if (err) {
              console.log(err);
              res.send({ error: "An error has occurred" });
            } else {
              if (result == null) {
                res.send({ "error": "This email address is not recognised, please check you have entered your email correctly" });
              } else {
                console.log("Email recognised");
                bcrypt.compare(req.body.password, result.password, function (err, data) {
                  if (err) {
                    console.log("Something went wrong, please try again")
                  }
                  if (data) {
                    console.log("Login successful, redirecting")

                    res.cookie('user', result.email, { expire: new Date(Date.now() + 86400 * 1000) })
                    res.cookie('role', result.role, { expire: new Date(Date.now() + 86400 * 1000) })
                    res.cookie('_id', result._id, { expire: new Date(Date.now() + 86400 * 1000) })
                    res.cookie('isLoggedIn', "yes", result._isLoggedIn, { expire: new Date(Date.now() + 86400 * 1000) })
                    res.cookie('userfname', result.firstname, { expire: new Date(Date.now() + 86400 * 1000) })
                    res.cookie('userlname', result.lastname, { expire: new Date(Date.now() + 86400 * 1000) })
                    res.cookie('avatar', result.avatar, { expire: new Date(Date.now() + 86400 * 1000) })


                    console.log(req.cookies)


                    res.redirect('/index')
                  } else {
                    console.log("Wrong password")
                  }
                })
              }
            }
          });
        },
        function (res, callback) {
          var hashedPass = res.password;
          bcrypt.compare(req.body.password, hashedPass, function (err, res) {
            if (err) {
              console.log("Something went wrong, please try again")
            }
            if (res) {
              console.log("Passwords Match, attempting login")
              redirect('/index')
            } else {
              S
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

    //POST for updating a user
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
          res.redirect('/adminpage')
        })
    })

    //Storing Image

    const Storage = multer.diskStorage({
      destination: 'uploads',
      filename: (req, file, cb) => {
        cb(null, file.originalname)
      },
    });
    
    //Saving the image locally in "testImage" folder
    
    const upload = multer({
      storage: Storage
    }).single('testImage')

    /* app.get("/", (req, res) => {
      res.send("upload file");
    }); */

    app.post('/upload', (req, res) => {
      upload(req, res, (err) => {
        if (err) {
          console.log(err)
        }
        else {
          const newImage = new ImageModel({
            name: req.body.name,
            image: {
              data: req.file.filename,
              contentType: 'image/png'
            }
          })
          newImage.save()
            .then(() => res.send('successfuly uploaded'))
            .catch(err => console.log(err))
        }
      })
    })

    //POST to add new request
    app.post('/addRequest', async (req, res) => {
      console.log(req.cookies)

      let cookieObject = req.cookies
      let currentUser = `${cookieObject.userfname} ${cookieObject.userlname}`
      let userId = cookieObject._id
      let avatar = cookieObject.avatar


      let newRequest = new Request({
        title: req.body.title,
        course: req.body.course,
        language: req.body.language,
        estimated_workload: req.body.estimated_workload,
        tags: req.body.tags,
        date: req.body.date,
        description: req.body.description,
        author: currentUser,
        author_id: userId,
        author_avatar: avatar,
        jobTitle: req.body.jobTitle
      })
      try {
        newRequest.save()
        res.redirect('/index')
        console.log(newRequest)
      } catch (err) {
        console.log(err)
      }
    })

    //Get all requests


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
    app.get('*', function (req, res) {
      res.render('404.ejs')
    });
  });