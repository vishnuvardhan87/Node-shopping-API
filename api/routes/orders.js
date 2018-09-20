const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require('../middleware/check-auth');

const Product = require('../models/product');
const Order = require('../models/order');

router.get('/',checkAuth,(req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product','name price')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count:docs.length,
            orders: docs.map(docs=>{
                return {
                    _id: docs._id,
                    product: docs.product,
                    quantity:docs.quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/orders/'+docs._id
                    }
                }
            })
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

router.post('/',checkAuth,(req,res,next)=>{
    Product.findById(req.body.productId)
    .then(product =>{
        if(!product){
            return res.status(404).json({
                message:'Product Not Found'
            })
        }
        const order = new Order({
            _id:new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        })
        return order.save()
    })
    .then(result=>{
        console.log(result);
        res.status(201).json({
            message:'Order Stored',
            createdOrder:{
              _id: result._id,
              product: result.product,
              quantity: result.quantity
            },
            request:{
                type:'POST',
                url:'http://localhost:3000/orders/' + result._id
            }
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })  
})

router.get('/:orderId',checkAuth,(req,res,next)=>{
    const id = req.params.orderId;
    Order.findById(id)
    .populate('product')
    .exec()
    .then(order=>{
        if(!order){
            res.status(404).json({
                message:'Order Not found'
            })
        }
        res.status(200).json({
            order: order,
            request:{
                type:'GET',
                url:'http://localhost:3000/orders'
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

router.delete('/:orderId',checkAuth,(req,res,next)=>{
   Order.remove({_id:req.params.orderId})
   .exec()
   .then(result=>{
       res.status(200).json({
           message:'Order Deleted',
           request:{
               type:'POST',
               url:'http://localhost:3000/orders',
               body:{
                   productId:"ID",
                   quantity:"Number"
               }
           }
       })
   })
   .catch(err=>{
       res.status(500).json({
           error:err
       })
   })
})

module.exports = router;