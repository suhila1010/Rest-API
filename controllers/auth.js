const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')


exports.signup = async (req, res, next) => {
    const errors = validationResult(req)
    try{
    if(!errors.isEmpty()){
        const error = new Error('Validation Failed')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({
            email:email,
            password:hashedPassword,
            name:name
        });
        const result= await user.save()
        res.status(201).json({
            message:"User Created!",
            userId: result._id
        })
    }catch( err ) {
        if (!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

exports.login = async (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        const error = new Error('Validation Failed')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const email = req.body.email
    const password = req.body.password
    let loadedUser;
    try{
    const userDoc = await User.findOne({email:email})
        if(!userDoc){
            res.status(404).json({
                message:"User Not Found."
            })
        }
        loadedUser = userDoc;
        const isEqual = await bcrypt.compare(password, userDoc.password)
        if(!isEqual){
            res.status(401).json({
                message:"Password is incorrect"
            })
        }
        const token= jwt.sign({
            email:loadedUser.email,
            userId:loadedUser._id.toString()
        },
        'somesupersecretsecret',
        {expiresIn: '1h'}
        );
        res.status(200).json({token:token, userId:loadedUser._id.toString()})
    }catch(err){
        if (!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}