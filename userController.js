var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var user = require('../model/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var favourite = require('../model/favourite');
var product = require('../model/product');
var cart = require('../model/cart');
const emailValidator = require('deep-email-validator');
const nodemailer = require("nodemailer");
const Str = require('@supercharge/strings')  
require('dotenv').config()

router.post('/registerUser', async function(req, res) {
    //console.log(req.body)
    //var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    var name = req.body.name
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    //console.log(name)
    
    if (!email || !password){
      return res.status(400).send({
        message: "Email or password missing."
      })
    }
    async function isEmailValid(email) {
      return emailValidator.validate(email)
     }
    const {valid, reason, validators} = await isEmailValid(email);
  
    if (valid){ 
      if(password !== confirmPassword){
        res.status(201).json({
           message:"Password not match!",
        });
   }else{
       bcrypt.hash(password, 10, function(err, hash) {
         //console.log(hash)
         if(err){
             return res.status(201).json({
                 message:"Somthing wrong, Try Letter",
                 error:err
              });
         }else{
             //console.log(hash);
        user.findOne({email:email}).then(resp => {
            //console.log(resp)
            if(resp){
                return res.json({data:[resp], success:false, message:"Email is already Exist"
                })
            }else{
  
      obj = {name:name, email:email, password:hash};
      //console.log(obj)
      user.create(obj, function(err, regiuser){
      //console.log(regiuser)
      if(err){
            return res.json({data:[regiuser], success:false, message:"Email Exist", error:err})
      }else{
            return res.json({data:[regiuser], success:true, message:"Register succesfully"})
        }
      })
    }
      })
    }
      })
     }
    }else{
      return res.status(400).send({
      message: "Please provide a valid email address.",
      reason: validators[reason].reason
    })
  }   
});

  router.route('/UserList').get(function(req, res) {
    //console.log("asdas")
  
    user.find().exec(function(err, regist){
    //console.log(regist)
      if(err){
          return res.json({error:err})
      }else{
          //console.log("I am Done");
          return res.json({regist})
      }
    })
  });

  router.route('/UserDetail').get(function(req, res) {
    //console.log("asdas")
    var id = req.body.id 
    user.findOne({_id:id}).exec(function(err, udetail){
    //console.log(udetail)
      if(err){
          return res.json({error:err})
      }else{
          return res.json({udetail})
      }
    })
  });

  router.route('/UserUpdate').put(function(req, res) {
    var id = req.body.id
    var email = req.body.email
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    
    if(password !== confirmPassword){
      res.status(201).json({
         message:"Password not match!",
      });
 }else{
     bcrypt.hash(password, 10, function(err, hash) {
       //console.log(hash)
       if(err){
           return res.status(201).json({
               message:"Somthing wrong, Try Letter",
               error:err
            });
       }else{
           //console.log(hash);
      user.findOne({email:email}).then(resp => {
          //console.log(resp)
          if(resp){
              return res.json({data:[resp], success:false, message:"Email is already Exist"
              })
          }else{
         var obj = {_id:id, email:email, password:hash}
      user.update(obj).exec(function(err, user){
      //console.log(user)
      if(err){
        res.json({error:err, message:"User updated problem"})
      }else{
        res.json({user, message:"User updated"})
      }
      
})
          }
})
}
      })
    }
    })
  
  router.route('/login').post(function(req, res) {
    //console.log(req.body)
  var email = req.body.email
  user.findOne({ email:email }, function (err, user) {
    //console.log(user)
  if (err) return res.json({error:err});
  if (!user) return res.json('No user.');

       var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
       if (!passwordIsValid) return res.status(401).send({message:"password is not valid", auth: false, token: null });

       var token = jwt.sign({ id: user._id }, config.secret, {
       expiresIn: 86400
   });
      user.access_token = token
      // console.log(user)
      res.status(200).json({message:"User Login", sucess: true, user:user,access_token:token});
   });
});

router.route('/ForgotPassword').get(function(req, res) {
  var email = req.body.email
  //var password = req.body.password
  const random_WithFiftySymbols = Str.random(10)
  bcrypt.hash(random_WithFiftySymbols, 10, function(err, hash) {
    if(err){
      return res.status(201).json({
          message:"Somthing wrong, Try Letter",
          error:err
       });
  }else{
    user.findOne({email:email}).then(resp => {
      //console.log(resp)
      if(!resp){
          return res.json({ success:false, message:"Email does not exist"
          })
      }else{
        var SendObj = {email:email, password:hash};
        user.update(SendObj).exec(function(err, user){
        //console.log(user)
        
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'jcgdeeds@gmail.com',
              pass: 'jcsoftware!234'
            }
          });
          let useEmail= resp.email
          var mailOptions = {
            from: 'manoj645343@gmail.com',
            to: useEmail,
            subject: 'Sending Email using Node.js',
            text: 'User new password is : ' + random_WithFiftySymbols
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error){
              //console.log(error);
    
            } else {
              console.log({error:err}, 'Email sent: ' + info.response); 
            }
          })
          res.json({data:[{email, }], message:"Email sent"})
  })
      }
    })
  }
  })
});

router.patch("/ChangePassword", async function(req, res){
  var email = req.body.email
  var password = req.body.password
  var confirmPassword = req.body.confirmPassword;
  var oldPassword = req.body.oldPassword;
    //console.log(name)
    
    if (!email || !oldPassword){
      return res.status(400).send({
        message: "Email or old password missing."
      })
    }
    async function isEmailValid(email) {
      return emailValidator.validate(email)
     }
    const {valid, reason, validators} = await isEmailValid(email);
  
    if (valid){ 
      if(password !== confirmPassword){
        res.status(201).json({
           message:"Password not match!",
        });
      }else{
  bcrypt.hash(password, 10, function(err, hash) {
    if(err){
      return res.status(201).json({
          message:"Somthing wrong, Try Letter",
          error:err
       });
  }else{
    user.findOne({email:email}).then(resp => {
      //console.log(resp)
      if(!resp){
          return res.json({ success:false, message:"Email does not exist"
          })
      }else{
        var SendObj = {email:email, password:hash, password:oldPassword};
        user.update(SendObj).exec(function(err, user){
        //console.log(user)
        
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'jcgdeeds@gmail.com',
              pass: 'jcsoftware!234'
            }
          });
          let useEmail= resp.email
          var mailOptions = {
            from: 'manoj645343@gmail.com',
            to: useEmail,
            subject: 'Sending Email using Node.js',
            text: 'User change password is : ' + password
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error){
              //console.log(error);
    
            } else {
              console.log({error:err}, 'Email sent: ' + info.response); 
            }
          })
          res.json({user:[{email}], message:"Email sent"})
  })
      }
    })
  }
  })
}
}else{
  return res.status(400).send({
  message: "Please provide a valid email address.",
  reason: validators[reason].reason
})
}   
});



  const accessTokenSecret = 'youraccesstokensecret';
  const authenticateJWT = (req, res, next) => {
    router.get('/tokenGenerate',authenticateJWT, (req, res) => {
      
    res.json(authenticateJWT);
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
//});
});
  }

router.route("/AddProduct").post(function(req, res){
  //console.log(req.body)
  product.create(req.body, function(err, prdAdd){
    //console.log(prdAdd)
        if(err){
          return res.json({error:err})
        }else{
          return res.json({prdAdd})
        }
  })
});

router.route("/productList").get(function(req, res){
  //console.log("dsads")
  var count = req.param('count')

  product.find().limit(count).exec(function(err, prolist){
     if(err){
       return res.json({error:err})
     }else{
       return res.json({prolist})
     }
   })     
}); 

router.route("/productdetail").get(function(req, res){
  console.log("dsads")
  var id = req.body.id
  product.findOne({_id:id}).exec(function(err, prodetail){
     if(err){
       return res.json({error:err})
     }else{
       return res.json({prodetail})
     }
   })     
}); 

router.route("/productUpdate").put(function(req, res){
  //console.log("working")
  var id = req.body.id
  var updateproduct = req.body

  product.update({_id:id},updateproduct).exec(function(err, proUpd){
     if(err){
       return res.json({error:err})
     }else{
       return res.json({proUpd})
     }
   })     
});

router.route("/productDelete").get(function(req, res){
  //console.log("working")
  var id = req.body.id

  product.deleteOne({_id:id}).exec(function(err, prodelete){
     if(err){
       return res.json({error:err})
     }else{
       return res.json({prodelete})
     }
   })     
});

router.route("/MyProduct").get(function(req, res){
    var userid = req.param('userid')
     
    if (userid == null || userid == 'undefined') {
      res.status(404);
    }else{

    query = {userid:userid}
    console.log(query)
    product.find(query).populate('userid').exec(function(err, prdAdd){
      console.log(prdAdd)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({prdAdd})
          }
    })
  }
  });

  router.route("/FavouriteProductAdd").post(function(req, res){
    //console.log(req.body)
    favourite.create(req.body, function(err, fblsave){
      //console.log(fblsave)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({fblsave})
          }
    })
  });

router.route("/FavouriteProductList").get(function(req, res){
    var count = req.param('count')

    favourite.find().limit(count).exec(function(err, flis){
       if(err){
         return res.json({erroe:err})
       }else{
         return res.json({flis})
       }
     })     
  }); 

  router.route("/FavouriteProductDetail").get(function(req, res){
    var id = req.body.id

    favourite.findOne({_id:id}).exec(function(err, favproddetail){
       if(err){
         return res.json({error:err})
       }else{
         return res.json({favproddetail})
       }
     })     
  });

  router.route("/FavouriteProductDelete").get(function(req, res){
    //console.log("working")
    var id = req.body.id
  
    favourite.deleteOne({_id:id}).exec(function(err, favprodelete){
       if(err){
         return res.json({error:err})
       }else{
         return res.json({favprodelete})
       }
     })     
  });
  
  router.route("/MyFavouriteProduct").get(function(req, res){
    
    var userid = req.param('userid')
     
    if (userid == null || userid == 'undefined') {
      res.status(404);
    }else{

    query = {userid:userid}

    //console.log(query)
    favourite.find(query).populate('userid').exec(function(err, myfavproduct){
      //console.log(fmblog)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({myfavproduct})
          }
    })
  }
  });
  
  router.route("/AddtoCart").post(function(req, res){
    //console.log(req.body)
    cart.create(req.body, function(err, addcart){
      //console.log(addcart)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({addcart})
          }
    })
  });

  router.route("/ListCart").get(function(req, res){
    //console.log(req.body)
    
    var page = req.param('page');
    var count = req.param('count');
    var skipNo = (page - 1) * count;
    query = {}
    cart.count(query).exec(function (err, total) {
      if (err) {
        return res.status(400).jsonx({
          success: false,
          error: err
        });
      }else{  
    cart.find().limit(count).skip(skipNo).exec(function(err, liscart){
      //console.log(liscart)
          if(err){
            return res.json({error:err})
          }else{
            res.json({liscart, success:true, cart:cart, total:total})
          }
    })
  }
})
  });

  router.route("/CartDetail").get(function(req, res){
    //console.log(req.body)
    var id = req.body.id
    cart.findOne({_id:id}).exec(function(err, detailcart){
      //console.log(detaicart)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({detailcart})
          }
    })
  });

  router.route("/CartUpdate").put(function(req, res){
    //console.log(req.body)

    var id = req.body.id
    var name = req.body.name
    var quantity = req.body.quantity
    cart.updateOne({_id:id, name:name, quantity:quantity}).exec(function(err, updcart){
      //console.log(updcart)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({updcart})
          }
    })
  });

  router.route("/MyCart").get(function(req, res){
    //console.log(req.body)
    var userid = req.param('userid')
     
    if (userid == null || userid == 'undefined'){
      res.status(404);
    }else{  

    query = {userid:userid}
    cart.find(query).populate("userid").exec(function(err, mycart){
      //console.log(mycart)
          if(err){
            return res.json({error:err})
          }else{
            return res.json({mycart})
          }
    })
  }
  });

module.exports = router;