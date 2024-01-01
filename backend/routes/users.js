const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/User");
const passport = require("passport");


const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");


router.post("/users/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", 
        r: "pg", 
        d: "mm" 
      });

      const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});


router.post("/users/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {

        const payload = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
          role: user.role
        };
        //Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
              first_name: user.first_name,
              last_name: user.last_name
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});


router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      first_name: req.user.first_name,
      email: req.user.email
    });
  }
);

router.get("/users", (req, res) => {

  User.find()
      .then(doc => {
          res.setHeader('Content-Range', 'users 0-5/5');
          res.json(doc)
          
      })
      .catch(err => {
          res.status(500).json(err)
      })
      
          
})

router.post('/user', (req, res)=>{
  if(!req.body){
      return res.status(400).send("request body is missing")
  }

  let model=new User(req.body)
  model.save()
  .then(doc=>{
      if(!doc ||doc.length===0){
          return res.status(500).send(doc)
      }
      res.status(200).send(doc)

  })
  .catch(err=>{
      res.status(500).json(err)
  })
})

router.get('/user', (req, res) => {

  User.findOne({
      _id: req.query.id
  })
      .then(doc => {
          
          res.json(doc)
          
      })
      .catch(err => {
          res.status(500).json(err)
      })
})


router.put('/user/', (req, res) => {

  User.findOneAndUpdate({
      _id: req.query.id
  }, req.body,{
      new:true
  })
      .then(doc => {
          
          res.json(doc)
          
      })
      .catch(err => {
          res.status(500).json(err)
      })
})

router.delete('/user', (req, res) => {

  User.findOneAndRemove({
      _id: req.query.id
  })
      .then(doc => {
          
          res.json(doc)
          
      })
      .catch(err => {
          res.status(500).json(err)
      })
})

module.exports = router;