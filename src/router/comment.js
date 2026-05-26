const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const {addComment,getComments,editComment,deleteComment}=require('../controller/commentAPI');

const commentRouter=express.Router();

commentRouter.post('/addComment/:id',userMiddleware,addComment);
commentRouter.get('/getComments/:id',userMiddleware,getComments);
commentRouter.delete('/deleteComment/:id',userMiddleware,deleteComment);
commentRouter.put('/editComment/:id',userMiddleware,editComment);

module.exports=commentRouter;