var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var uid2 = require('uid2');
var bcrypt = require('bcrypt')
const faker = require('faker')
var request = require('sync-request');

var usersModel = require('../models/users')
const Activities = require('../models/activities');

const dateHelper = require('../helpers/date_helper'); // helper pour formater les dates d'ouverture des events
const { query } = require('express');
const verifier = require('google-id-token-verifier');


//ROUTE SIGN-UP

router.post('/sign-up', async function (req, res, next) {

  const hash = bcrypt.hashSync(req.body.passwordFromFront, 10);

  var result = false

  var findUser = await usersModel.findOne({ email: req.body.emailFromFront })

  var error = []

  if (findUser != null) {
    error.push('User already logged in')
  }

  if (
    req.body.usernameFromFront == ''
    || req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
    || req.body.birthdayFromFront == ''
    || req.body.nationalityFromFront == ''
  ) {
    error.push('Please fill the empty field')
  }

  if (!findUser && error.length == 0) {

    var newUser = new usersModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: hash,
      token: uid2(32),
      birthday: dateHelper.parseDate(req.body.birthdayFromFront),
      nationality: req.body.nationalityFromFront
    })

    var userSave = await newUser.save()

    if (userSave) {
      result = true
      res.json({ result, token: userSave.token })
    } else {
      res.json({ result });
    }
  } else {
    res.json({ result, error });
  }

});

//ROUTE SIGN-IN

router.post('/sign-in', async function (req, res, next) {

  var error = []

  if (req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
  ) {
    error.push('Please fill the empty field')
  }

  if (error.length == 0) {
    let findUser = await usersModel.findOne({ email: req.body.emailFromFront })

    if (findUser) {

      if (bcrypt.compareSync(req.body.passwordFromFront, findUser.password)) {
        res.json({ login: true, token: findUser.token });
      } else {
        error.push('Wrong password')
        res.json({ login: false, error });
      }
    }
    else {
      error.push('Wrong email')
      res.json({ login: false, error })

    }
  }

});

//ROUTE SIGN-IN/UP via Facebook
router.get('/facebook-sign-in/:token', async function (req, res, next) {

  const token = req.params.token
  // const fields = ['id', 'first_name', 'last_name', 'gender', 'birthday', 'work']

  var requete = request('GET', `https://graph.facebook.com/me?access_token=${token}&fields=email,name,birthday,gender,work`);
  var resultWS = JSON.parse(requete.body);
  console.log(resultWS)
  if (!resultWS.email) {
    res.json({ status: 'falied', err: 'No email found, try again?' })
  } else {
    let findUser = await usersModel.findOne({ email: resultWS.email })
    if (!findUser) {
      res.json({ status: 'success', next: 'signup', userInfo: { email: resultWS.email, name: resultWS.name } })
    } else {
      res.json({ status: 'success', next: 'signin', token: findUser.token })
    }
  }
});


//ROUTE SIGN-IN/UP via Google
router.get('/google-sign-in/:googleToken/:clientId', async function (req, res, next) {
  verifier.verify(req.params.googleToken, req.params.clientId, async function (err, tokenInfo) {
    if (!err) {
      let findUser = await usersModel.findOne({ email: tokenInfo.email })
      if (!findUser) {
        res.json({ status: 'success', next: 'signup', userInfo: { email: tokenInfo.email, name: tokenInfo.name } })
      } else {
        res.json({ status: 'success', next: 'signin', token: findUser.token })
      }
    } else {
      res.json({ status: 'falied', err })
    }
  });
});

//ROUTE SIGN-IN/UP via Apple
router.get('/apple-sign-in/:credential', async function (req, res, next) {

  const credential = JSON.parse(req.params.credential)
  /* TODO: CHECK  identityToken via Signup an app in https://developer.apple.com/( pay 99$ for an account) 
  https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens*/
  if (!credential.email) {
    res.json({ status: 'falied', err: 'No email found, try again?' })
  } else {
    let findUser = await usersModel.findOne({ email: credential.email })
    if (!findUser) {
      res.json({ status: 'success', next: 'signup', userInfo: { email: credential.email, name: `${credential?.fullName?.familyName} ${credential?.fullName?.givenName}` } })
    } else {
      res.json({ status: 'success', next: 'signin', token: findUser.token })
    }
  }
});

// get the trips of a user
router.get('/usertrips/:usertoken', async function (req, res, next) {

  let trips = [];
  let result = false;
  let user = await usersModel.findOne({ token: req.params.usertoken }).populate('trips.activities');

  if (user) {
    result = true;
    trips = user.trips;
  }

  res.json({ result, trips });

});


router.get('/refresh-activity/:activityId/:otherActities', async function (req, res, next) {
  const activity = await Activities.findById(req.params.activityId);
  const otherActities = JSON.parse(req.params.otherActities)
  const others = []
  for (let i = 0; i < otherActities.length; i++) {
    const found = await Activities.findById(otherActities[i])
    if (found) {
      others.push(found._id)
    }
  }
  const findActivities = await Activities.aggregate(
    [
      {
        '$match': {
          'category': activity.category,
          '_id': {
            '$ne': activity._id,
            '$nin': others
          }
        }
      }, {
        '$sample': {
          'size': 1
        }
      }
    ])
  res.json({ status: 'success', activity: findActivities.length > 0 ? findActivities[0] : [] })
})


router.get('/categories', async function (req, res, next) {
  //category list from bdd//
  let activities = await Activities.find();
  let categories = activities.map(act => act.category)

  let filteredCat = categories.filter((item, index) => categories.indexOf(item) == index)
  console.log('all categories from bdd : ', filteredCat)

  res.json({ categories: filteredCat })
})

router.post('/trust-doda', async function (req, res, next) {


  //  => if user doesnt specify a category, default behavior == all categories //
  let activities = await Activities.find();
  let categories = activities.map(act => act.category)
      // get rid of duplicates
  let filteredCat = categories.filter((item, index) => categories.indexOf(item) == index)

  let queryCategories = JSON.parse(req.body.categories.toLowerCase());

  if (queryCategories === undefined || queryCategories.length == 0) {
    queryCategories = filteredCat;
  }

  // User Wishes //
  let queryTrip = {
    categories: queryCategories,
    address: req.body.address,
    longitude: Number(req.body.longitude),
    latitude: Number(req.body.latitude),
    distance: Number(req.body.distance),
    budget: Number(req.body.budget),
    selectedDate: Date(req.body.selectedDate),
  }

  // Push error if address isnt specified
  let error = [];
  if (!req.body.address) {
    error.push('Please add a location')
    console.log(error)
    res.json({ result: false, error })

  } else {

    //FILTER BY COORDS, MAXIMUM DISTANCE RADIUS in meters, and CATEGORIES   
    let filterGeo = await Activities.find(
      {
        "loc": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [queryTrip.longitude, queryTrip.latitude]
            },
            $maxDistance: Number(queryTrip.distance * 1000)
          }
        },
        category: { $in: queryTrip.categories }
      })


    // GET THREE RANDOM ACTIVITIES FROM FILTER UNTIL IT MATCHES THE BUDGET
    let myDoda = [];
    let total;
    do {
      myDoda = [];
      for (let i = 0; i < 3; i++) {
        let random = filterGeo[Math.floor(Math.random() * filterGeo.length)];
        myDoda.push(random);

      }
      total = myDoda.reduce((a, b) => (a + b.pricing), 0)

    } while (total > queryTrip.budget)

    res.json({ result: true, queryTrip, myDoda, total })
  }
})

// PROFILE ROUTES:

// GET USER INFO

router.get('/get-userInfo', async function (req, res, next) {

  var result = false

  let getUserInfo = await usersModel.findOne(
    { token: req.query.tokenFromFront }
  ).populate('likes').populate('dislikes')
  //console.log(getUserInfo)

  if (getUserInfo) {
    res.json({
      result: true,
      userInfo: getUserInfo
    })
  }
  else {
    res.json({ result })
  }

})

// UPDATE USER INFO

router.put('/update-userInfo', async function (req, res, next) {

  var result = false

  let updateUserInfo = await usersModel.updateOne(
    { token: req.body.tokenFromFront },
    {
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: bcrypt.hashSync(req.body.passwordFromFront, 10),
      birthday: req.body.birthdayFromFront,
      nationality: req.body.nationalityFromFront,
    }
  )

  res.json({ result })
})

// UPDATE USER INTERESTS

router.put('/update-userInterests', async function (req, res, next) {

  var result = false

  let updateUserInfo = await usersModel.updateOne(
    { token: req.body.tokenFromFront },
    { interests: JSON.parse(req.body.interestsFromFront) }
  )

  res.json({ result })
})

// DELETE USER
router.post('/delete-user', async function (req, res, next) {


  var result = false

  let findUser = await usersModel.findOne(
    { token: req.body.tokenFromFront }
  )
  //console.log('token', token)
  if (bcrypt.compareSync(req.body.passwordFromFront, findUser.password)) {

    //console.log('password', req.body.passwordFromFront)
    let deleteUser = await usersModel.deleteOne(
      { token: req.body.tokenFromFront }
    )
    console.log('deleteUser', deleteUser)
    if (deleteUser.deletedCount != 0) {
      result = true
    }
  }
  res.json({ result })


  //console.log('result',result)

})

// ROUTE SAVE TRIP

router.post('/saveTrip', async function (req, res, next) {

  let result = false;
  let user = await usersModel.findOne({ token: req.body.user });

  if (user) {
    user.trips = [...user.trips, JSON.parse(req.body.tripData)];
    let savedUser = await user.save();
    if (savedUser) {
      result = true;
    }
  }
  res.json({ result });

});

// ROUTE EDIT TRIP
router.put('/updateTrip', async function (req, res, next) {

  let result = false;
  let user = await usersModel.findOne({ token: req.body.user });

  if (user) {
    user.trips = [...user.trips.filter(trip => trip._id != req.body.tripId), JSON.parse(req.body.tripData)];
    let savedUser = await user.save();
    if (savedUser) {
      result = true;
    }
  }

  res.json({ result });

});

// ROUTE GET USER LIKES

router.get('/get-likes/:token', async function (req, res, next) {

  let result = false;
  let likes = [];
  let user = await usersModel.findOne({ token: req.params.token });

  if (user) {
    result = true;
    likes = [...user.likes];
  }

  res.json({ result, likes });

});

// ROUTE GET USER DISLIKES

router.get('/get-dislikes/:token', async function (req, res, next) {

  let result = false;
  let dislikes = [];
  let user = await usersModel.findOne({ token: req.params.token });

  if (user) {
    result = true;
    dislikes = [...user.dislikes];
  }

  res.json({ result, dislikes });

});

// TOGGLE LIKE FOR A USER AND AN ACTIVITY

router.get('/toggle-like', async function (req, res, next) {

  let result = false;

  let user = await usersModel.findOne({ token: req.query.userToken });

  // if req.query.activityId is a valid ObjectId, find activity
  let activity = null;
  if (mongoose.isValidObjectId(req.query.activityId)) {
    activity = await Activities.findById(req.query.activityId);
  }

  if (user && activity) {
    //si l'activité est déjà likée, on la retire des likes
    if (user.likes.find(like => String(like) === req.query.activityId)) {
      user.likes = user.likes.filter(like => String(like) !== req.query.activityId);
    }
    else { //sinon, on la rajoute dans les likes
      user.likes = [...user.likes, req.query.activityId];
    }

    let userSaved = await user.save();

    if (userSaved) {
      result = true;
    }

  }

  res.json({ result });

});


module.exports = router;
