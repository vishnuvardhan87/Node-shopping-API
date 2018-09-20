const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.get('/',(req,res,next)=>{
    User.find()
    .exec()
    .then(docs =>{
        const response = {
            count:docs.length,
            users: docs.map(doc=>{
                return {
                    email: doc.email,
                    price: doc.price,
                    id: doc._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/users/'+doc._id
                    }
                }
            })
        };
        res.status(200).json(response)
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}) 

router.post('/signup',(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user =>{
        if(user.length >=1){
            return res.status(409).json({
                message:'Mail Exists'
            })
        } else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    })
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                       })
                    user.save()
                    .then(result=>{
                        console.log(result);
                        res.status(201).json({
                            message:'User created'
                        })
                    })
                    .catch(err=>{
                        console.log(err);
                        res.status(500).json({
                            error:err
                        })
                    });
                }
            })
        }
    })
      
})

router.post('/login',(req,res,next)=>{
  User.find({email:req.body.email})
  .exec()
  .then(user =>{
      if(user.length < 1){
          return res.status(401).json({
              message:'Auth Failed'
          })
      }
      bcrypt.compare(req.body.password, user[0].password,(err,result)=>{
          if(err){
              return res.status(401).json({
                  message:'Auth Failed'
              })
          }
          if(result){
            const token = jwt.sign({
                email:user[0].email,
                userId:user[0]._id
            },"secret",
            {
              expiresIn:"1h"
            })
            return res.status(200).json({
                message:'Auth Successful',
                token:token
            }) 
          }
          res.status(401).json({
            message:'Auth Failed'
        })
      })
  })
  .catch(err=>{
      console.log(err);
      res.status(500).json({
          error:err
      })
  })
})

router.delete('/:userId',(req,res,next)=>{
    User.remove({_id:req.params.id})
    .exec()
    .then(result=>{
        console.log(result);
        res.status(200).json({
            message:'User deleted'
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            message:{
                error:err
            }
        })
    })
})

module.exports = router;