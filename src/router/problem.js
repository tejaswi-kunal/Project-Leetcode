const express=require('express');
const {createProblem,updateProblem,deleteProblem,getProblem,
    getAllProblems,filterProblems,getAllProblemsSolvedByUser,
    getNumberOfProblemsSolvedByUser,saveProblem,getSavedProblems,
    getSubmissions,likeProblem,dislikeProblem,userProblemReaction}
            = require('../controller/problemAPI');
   
const adminMiddleware=require('../middleware/adminMiddleware');
const userMiddleware=require('../middleware/userMiddleware');


// router
const ProblemRouter=express.Router();
ProblemRouter.post('/create',adminMiddleware,createProblem);
ProblemRouter.put('/update/:id',adminMiddleware,updateProblem);
ProblemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);
ProblemRouter.get('/getProblem/:id',userMiddleware,getProblem);
ProblemRouter.get('/getAllProblem',userMiddleware,getAllProblems);
ProblemRouter.get('/filter',userMiddleware,filterProblems);
ProblemRouter.get('/getAllProblemSolvedByUser',userMiddleware,getAllProblemsSolvedByUser);
ProblemRouter.get('/getNumberOfProblemsSolvedByUser',userMiddleware,getNumberOfProblemsSolvedByUser);
ProblemRouter.post('/saveProblem/:id',userMiddleware,saveProblem);
ProblemRouter.get('/getSavedProblems',userMiddleware,getSavedProblems);
ProblemRouter.get('/getSubmissions/:id',userMiddleware,getSubmissions);
ProblemRouter.post('/like/:id',userMiddleware,likeProblem);
ProblemRouter.post('/dislike/:id',userMiddleware,dislikeProblem);
ProblemRouter.get('/reaction/:id',userMiddleware,userProblemReaction);

module.exports=ProblemRouter;

