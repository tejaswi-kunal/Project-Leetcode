const validateUser=require('../utils/validateUser');
const bcrypt=require('bcrypt');
const User=require('../model/User');
const jwt=require('jsonwebtoken');
const redisClient = require('../config/redis');

const userRegister=async (req,res)=>{
    try{
        // api level validation
        validateUser(req.body);

        // bycrption of password
        req.body.password=await bcrypt.hash(req.body.password,10);

        // saving user in db
        const people=await User.create({
            ...req.body,
            lastLogin:Date.now(),
            role:'user'
        });

        // creating jwt token
        const token=jwt.sign({id:people._id,emailId:people.emailId,role:'user'},process.env.SECRET_KEY,{expiresIn:'60m'});

        // sending jwt token 
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send('User Registered Successfully!');

    }catch(err){
        res.status(400).send("Error : " + err.message);
    }

}

const login=async (req,res)=>{
    try{
        const data=req.body;

        if(!data.emailId || !data.password)
        {
            throw new Error('All required credentails are not present!');
        }

        const people=await User.findOne({emailId:data.emailId});

        if(!people)
        {
            throw new Error('Wrong Credentials!');
        }

        // matching the password
        const match=await bcrypt.compare(data.password,people.password);

        if(!match)
        {
            throw new Error('Wrong Credentials!');
        }

        // updating the login date
        people.lastLogin=Date.now();
        await people.save();

        // creating jwt token
        const token=jwt.sign({id:people._id,emailId:people.emailId,role:people.role},process.env.SECRET_KEY,{expiresIn:'60m'});

        // sending jwt token
        res.cookie('token',token,{maxAge:60*60*1000}); 
        res.status(200).send('Logged In Successfully!!');
    }catch(err){
        res.status(400).send("Error : " + err.message);
    }
}

const logout=async(req,res)=>{
    try{
        const {token}=req.cookies;

        // expire the token
        // add to the blocked list of tokens
    
        const payload=jwt.decode(token);
        await redisClient.set(`token:${token}`,"Blocked");
        await redisClient.expireAt(`token:${token}`,payload.exp);

        // clear the token from cookie
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.status(200).send('Logged Out Successfuly!');
    }catch(err){
        res.status(400).send("Error : " + err.message);
    }
}

const adminRegister=async (req,res)=>{
    try{
        // api level validation
        validateUser(req.body);

        // bycrption of password
        req.body.password=await bcrypt.hash(req.body.password,10);

        // saving admin in db
        const people=await User.create({
            ...req.body,
            lastLogin:Date.now(),
            role:'admin'
        });

        // creating jwt token
        const token=jwt.sign({id:people._id,emailId:people.emailId,role:'admin'},process.env.SECRET_KEY,{expiresIn:'60m'});

        // sending jwt token 
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send('Admin Registered Successfully!');

    }catch(err){
        res.status(400).send("Error : " + err.message);
    }

}

const getAccount=async (req,res)=>{
    try{
        // validate the jwt token
        const id=req.result;

        // return the account information of the user
        const user = await User.findById(id).select("-password -passwordChangedAt -__v");

        if(!user)
        {
            throw new Error("Invalid Request Try Again")
        }

        res.status(200).send(user);
        }catch(err){
            res.status(400).send("Error : " + err.message);
        }

}

// Delete Account
const deleteAccount=async(req,res)=>{
    try{
        const user=await User.findByIdAndDelete(req.result);
        res.status(200).send("Account Deleted Successfully!");
        
    }catch(err){
        res.status(500).send("Error "+err.message);
    }
}
// Update Profile
// Change Password

// Get Public Profile

module.exports={userRegister,login,logout,adminRegister,getAccount,deleteAccount};