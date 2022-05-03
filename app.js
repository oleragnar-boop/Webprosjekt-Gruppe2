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


mongoose.connect(mongoDB, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
  .then(mongoose => {
    console.log('Connected to Database')
    const dataCollection = db.collection('ExamMatch')
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    //Making the view of this app ejs
    app.use(express.static(__dirname + '/assets'));
    app.use(express.static(__dirname + '/public'));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs')

    app.use(bodyParser.urlencoded({
      extended: true
    }))


    app.listen(process.env.PORT || 3000, function () {
      console.log('listening on 3000')
    })

    app.get('/login', (req, res) => {
      res.render('loginpage.ejs')
    })

    //bypass
    app.get('/tempLogin', (req, res) => {
      res.render('index.ejs')
    })

    //bypass
    app.get('/adminpage', (req, res) => {
      res.render('adminpage.ejs')
    })

    app.get('/register', (req, res) => {
      res.render('registerpage.ejs')
    })

    app.get('/index', (req, res) => {
      res.render('index.ejs')
    })

    app.get('/profile', (req, res) => {
      res.render('profile.ejs')
    })

    //GET for the open and closed requests on the landing page
    app.get('/', async (req, res) => {
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
        isApproved: "no"
      })
      try {
        newUser.save()
        res.redirect('/register')
        console.log(newUser)
      } catch (err) {
        console.log(err)
      }
    })

    //POST for login
    app.post('/loginUser', async (req, res) => {
      let passwordsMatch = "false";
      db.collection('users').findOne({
        email: req.body.email,
        isApproved: "yes"
      })
        .then(results => {
          if (!results) {
            console.log("User does not exist or has not yet been approved for ExamMatch")
          } else {
            let resultBody = results.body;
            let hashedPassword = results.password;
            bcrypt.compare(req.body.password, hashedPassword, function (err, res) {
              if (!res) {
                console.log("Wrong password")
              } else {
                passwordsMatch = "true";
                console.log(passwordsMatch)
              }
            })
          }
        })
    });


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

        //GET to fetch one student from the user_data collection in mongodb that matches the currentid
        //uses req.query.searchid to find the id currently being searched
        app.get('/getstudent', async (req, res) => {
          let currentid = parseInt(req.query.searchid);
          let currentdegree = req.query.degree;
          db.collection('user_data').find({ student_id: currentid }).toArray()
            .then(results => {
              res.render('data', { user_data: results, currentId: currentid, currentdegree: currentdegree })
            })
        })

        //GET to fetch all students from the user_data collection in mongodb that matches the degree currently being searched
        //uses req.query.degree to find the degree currently being searched
        app.get('/getdegrees', async (req, res) => {
          let currentid = parseInt(req.query.searchid);
          let currentdegree = req.query.degree;
          db.collection('user_data').find({ degree: currentdegree }).toArray()
            .then(results => {
              res.render('data', { user_data: results, currentdegree: currentdegree, currentId: currentid })
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

        //POST that adds users from the Add user form to the database based on the userSchema
        app.post('/', async (req, res) => {
          let newUser = new Users({
            name: req.body.name,
            surname: req.body.surname,
            student_id: req.body.student_id,
            age: req.body.age,
            nationality: req.body.nationality,
            degree: req.body.degree,
            dateAdded: req.body.dateAdded
          })
          try {
            await mongoose.connect('mongodb+srv://admin:adminpassword@cluster0.0nuub.mongodb.net/ExamMatch?retryWrites=true&w=majority', { useUnifiedTopology: true })
            newUser.save()
            res.redirect('/')
            console.log(newUser)
          } catch (err) {
            console.log(err)
          }
        })

        //POST that works as a PUT to update users entered in the Update user form. Uses student_id as an identifier
        app.post('/updatestudent', async (req, res) => {
          dataCollection.findOneAndUpdate(
            {
              student_id: parseInt(req.body.student_id)
            },
            {
              $set:
              {
                name: req.body.name,
                surname: req.body.surname,
                age: req.body.age,
                nationality: req.body.nationality,
                degree: req.body.degree
                
              }
            },
          ).then((result) => {
            res.redirect('/')
          })
            .catch((error) => console.error(error));
        })

        //GET method to get timestamps for t1 and t2
        app.get('/time', (req, res) => {
          console.log("t1", Date.now())
          let t1 = Date.now()
          db.collection('user_data').find().toArray()
            .then(results => {
              console.log("t2", Date.now())
              let t2 = Date.now()
              res.send({ "results": results, "time": [t1, t2] })
            })
        }) */
  });