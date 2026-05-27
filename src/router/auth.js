const express=require('express');
const {userRegister,login,logout,adminRegister,getAccount,deleteAccount,
    updateProfile
}=require('../controller/userAPI');
const userMiddleware=require('../middleware/userMiddleware');
const adminMiddleware=require('../middleware/adminMiddleware');
const User=require('../model/User'); 

const authRouter=express.Router();

authRouter.post('/register',userRegister);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.get('/get/account',userMiddleware,getAccount);
authRouter.delete('/deleteAccount',userMiddleware,deleteAccount);
authRouter.put('/updateProfile',userMiddleware,updateProfile);
authRouter.get('/checkAuth',userMiddleware,async(req,res)=>{
    // we will access this api as the user visit the website using new tab,to check if he is a already Signedup user
    const user=await User.findById(req.result)
    const reply={
        userName:user.userName,
        emailId:user.emailId,
        _id:req.result
    };

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})

module.exports=authRouter;


