const Problem=require('../model/Problems');
const User=require('../model/User');
const Comment=require('../model/Comment');

const addComment=async(req,res)=>{
    try{
        const problemID=req.params.id;
        if(!problemID)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }
        
        const DSAproblem=await Problem.findById(problemID);

        if(!DSAproblem)
        {
            return res.status(404).send("Invalid Id!");
        }

        const userID=req.result;
        if(!userID)
        {
            return res.status(404).send("No Valid User Id Recieved Please Try Again!");
        }

        const user=await User.findById(userID);
        if(!user)
        {
            return res.status(404).send("Invalid User Id!");
        }

        // now we have to create a new comment with respect to this user
        const {text}=req.body;


        if(!text || !text.trim())
        {
            return res.status(400).send(
                "Comment cannot be empty!"
            );
        }

        const comment=await Comment.create({user:userID,problem:problemID,text:text});

        res.status(201).send("Comment Posted Successfully!");
    }catch(err){
        res.status(400).send("Error : " + err.message);
    }
}

const getComments=async(req,res)=>{
    try{
        const page=Number(req.query.page) || 1;
        const limit=Number(req.query.limit) || 20

        // objects to skip
        const skip=(page-1)*limit;

        const problemID=req.params.id;

        if(!problemID)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }
        
        const DSAproblem=await Problem.findById(problemID);

        if(!DSAproblem)
        {
            return res.status(404).send("Invalid Id!");
        }

       const commentSet=await Comment.find({
            problem:problemID
        })
        .populate('user','userName')
        .select('text user createdAt')
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);

        const totalComments=await Comment.countDocuments({
            problem:problemID
        });

        res.status(200).send({
            comments:commentSet,
            totalComments
        });

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const deleteComment=async(req,res)=>{
    try{
        const commentID=req.params.id;

        const comment=await Comment.findById(commentID);

        if(!comment)
        {
            return res.status(404).send("Comment Not Found!");
        }

        if(comment.user.toString()!==req.result.toString())
        {
            return res.status(403).send("Unauthorized!");
        }

        await comment.deleteOne();

        res.status(200).send("Comment Deleted Successfully!");

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const editComment=async(req,res)=>{
    try{
        const commentID=req.params.id;

        const comment=await Comment.findById(commentID);

        if(!comment)
        {
            return res.status(404).send("Comment Not Found!");
        }

        if(comment.user.toString()!==req.result.toString())
        {
            return res.status(403).send("Unauthorized!");
        }

        const {text}=req.body;

        if(!text || !text.trim())
        {
            return res.status(400).send("Comment cannot be empty!");
        }

        comment.text=text;

        await comment.save();

        res.status(200).send("Comment Updated Successfully!");

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports={addComment,getComments,editComment,deleteComment};