const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

mongoose.connect('mongodb://localhost:27017/shoppingcart',(err)=>{
    if(!err)
      console.log('MongoDB connection successfullly established!!!!')
    else
      console.log('Error in Db connection: ' + JSON.stringify(err, undefined, 2));
});

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Handling Cors 
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-type,Accept,Authorization'
);
   if(req.method === 'OPTIONS'){
       res.header('Access-Control-Allow-Methods','PUT,GET,POST,PATCH,DELETE');
       return res.status(200).json({})
   }

   next();
})

app.use('/products',productRoutes);
app.use('/orders',orderRoutes)
app.use('/users',userRoutes);

//error handling is done for routes which are making past this route
app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
        }
    })
})


module.exports = app;