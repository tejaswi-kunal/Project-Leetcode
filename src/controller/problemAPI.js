const validateProblem=require('../utils/validateProblem');
const Problem=require('../model/Problems');
const User = require('../model/User');
const Submission=require('../model/Submission');

const createProblem=async(req,res)=>{
    try{
    // first we have to validate all the feilds and refrence solution
    await validateProblem(req.body);

    // now we can store data in db
    const question=await Problem.create({
        ...req.body,
        // we have to also add the refrence of the admin (admin id was already stored in req.result in middleware)
        problemCreator:req.result
    });

    res.status(201).send("Problem Created Successfully!");


    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const updateProblem=async(req,res)=>{
    try{
        const {id}=req.params;

        //check if we actually recived id
        if(!id)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }

        // fetch problem with id recieved
        const DSAproblem=await Problem.findById(id);

        if(!DSAproblem)
        {
            return res.status(400).send("Invalid Problem ID");
        }

        // we will use the put method to update the problem
        // first verify the feilds
        await validateProblem(req.body);

        // now update the problem
        // someone can send the ProblemCreater feild to update it 
        const {problemCreator, ...rest} = req.body;
        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            {...rest},
            {runValidators:true, new:true}
        );

        res.status(200).send(updatedProblem);
    }catch(err)
    {
        res.status(400).send("Error : "+err.message);
    }
}

const deleteProblem=async(req,res)=>{
    try{
    // first we have to check if the valid id recived
    const {id}=req.params;

    if(!id)
    {
        return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
    }

    const deletedProblem=await Problem.findByIdAndDelete(id);

    if(!deletedProblem)
    {
        return res.status(400).send("Invalid ID");
    }

    res.status(200).send(deletedProblem);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getProblem=async(req,res)=>{
    try{
        // first verify if we recived a id
        const {id}=req.params;

        if(!id)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }

        const DSAproblem=await Problem.findById(id).select("-hiddenTestCases -problemCreator");

        if(!DSAproblem)
        {
            return res.status(400).send("Invalid ID");
        }

        const user = await User.findById(req.result)
            .select("problemsSolved");

        if (!user) {
            return res.status(404).send("User Not Found!");
        }

        const solvedSet = new Set(
            user.problemsSolved.map((problemId) => problemId.toString())
        );

        const updatedDSAproblem = {
            ...DSAproblem.toObject(),
            isSolved: solvedSet.has(id)
        };

        res.status(200).send(updatedDSAproblem);

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getAllProblems=async(req,res)=>{
    try{
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    // objects to skip
    const skip = (page-1) * limit;

    const user=await User.findById(req.result).select("problemsSolved");

    if (!user)
    {
        return res.status(404).send("User Not Found!");
    }

    const solvedSet=new Set(user.problemsSolved.map((id)=>id.toString()));

    const problemSet=await Problem.find({}).skip(skip).limit(limit).select("_id title difficulty totalSubmissions acceptedSubmissions");

    const updatedProblemSet=problemSet.map((problem)=>({
        ...problem.toObject(),
        isSolved:solvedSet.has(problem._id.toString())
    }));

    return res.status(200).send(updatedProblemSet);

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const filterProblems = async (req, res) => {
    try {
        const {
            // basic filters
            difficulty,
            tags,
            company,
            search,

            // range filters
            minLikes,
            maxLikes,
            minSubmissions,
            maxSubmissions,
            minAcceptance,
            maxAcceptance,

            // date filters
            after,
            before,

            // sorting
            sortBy,
            sortOrder,

            // pagination
            page,
            limit
        } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        // ─── Basic Filters ───────────────────────────────────────

        // dynamic — works for easy, medium, hard
        if(difficulty) {
            filter.difficulty = difficulty;
        }

        // $in — problem must have atleast one of the sent tags
        if(tags) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];
            filter.tags = { $in: tagsArray };
        }

        // $in — problem must be associated with atleast one of the sent companies
        if(company) {
            const companyArray = Array.isArray(company) ? company : [company];
            filter.companies = { $in: companyArray };
        }

        // case insensitive partial title search
        if(search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        // ─── Range Filters ───────────────────────────────────────

        if(minLikes || maxLikes) {
            filter.likes = {};
            if(minLikes) filter.likes.$gte = Number(minLikes);
            if(maxLikes) filter.likes.$lte = Number(maxLikes);
        }

        if(minSubmissions || maxSubmissions) {
            filter.totalSubmissions = {};
            if(minSubmissions) filter.totalSubmissions.$gte = Number(minSubmissions);
            if(maxSubmissions) filter.totalSubmissions.$lte = Number(maxSubmissions);
        }

        // ─── Acceptance Rate Filter ──────────────────────────────
        // computed field (acceptedSubmissions/totalSubmissions)
        // cant filter directly — need $expr with $divide
        if(minAcceptance || maxAcceptance) {
            const conditions = [
                // avoid division by zero — only consider problems with atleast 1 submission
                { $gt: ['$totalSubmissions', 0] }
            ];

            if(minAcceptance) {
                conditions.push({
                    $gte: [
                        { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
                        Number(minAcceptance) / 100
                    ]
                });
            }

            if(maxAcceptance) {
                conditions.push({
                    $lte: [
                        { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
                        Number(maxAcceptance) / 100
                    ]
                });
            }

            filter.$expr = { $and: conditions };
        }

        // ─── Date Range Filter ───────────────────────────────────
        if(after || before) {
            filter.createdAt = {};
            if(after) filter.createdAt.$gte = new Date(after);
            if(before) filter.createdAt.$lte = new Date(before);
        }

        // ─── Sorting ─────────────────────────────────────────────
        // allowed fields to sort by — prevent sorting on arbitrary fields
        const allowedSortFields = ['likes', 'dislikes', 'totalSubmissions', 'acceptedSubmissions', 'createdAt'];

        const sortOptions = {};
        if(sortBy && allowedSortFields.includes(sortBy)) {
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            // default — newest first
            sortOptions.createdAt = -1;
        }

        const user = await User.findById(req.result).select("problemsSolved");

        if(!user) {
            return res.status(404).send("User Not Found!");
        }

        const solvedSet = new Set(user.problemsSolved.map((id) => id.toString()));

        // ─── Query ───────────────────────────────────────────────
        // parallel execution — data + total count at the same time
        const [problems, total] = await Promise.all([
            Problem.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                // only send fields needed for a problem list
                // no need to send visibleTestCases, hiddenTestCases etc in list view
                .select('_id title difficulty tags companies likes dislikes totalSubmissions acceptedSubmissions createdAt'),
            Problem.countDocuments(filter)
        ]);

        const updatedProblems = problems.map((problem) => ({
            ...problem.toObject(),
            isSolved: solvedSet.has(problem._id.toString())
        }));

        res.status(200).json({
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            count: problems.length,
            problems:updatedProblems
        });

    } catch(err) {
        res.status(400).send("Error : " + err.message);
    }
}

const getAllProblemsSolvedByUser=async(req,res)=>{
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        // objects to skip
        const skip = (page-1) * limit;

        // first we have to access the user's populated data 
        const user=await User.findById(req.result).populate({
            path:"problemsSolved",
            select:"_id title difficulty totalSubmissions acceptedSubmissions",
            options:{
                skip:skip,
                limit:limit
            }
        });

        if (!user) {
            return res.status(404).send("User Not Found!");
        }

        res.status(200).send(user.problemsSolved);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }

}

const getNumberOfProblemsSolvedByUser=async(req,res)=>{
    try{
        const user=await User.findById(req.result);

        if(!user) 
        {
            return res.status(404).send("User Not Found!");
        }
        
        res.status(200).send({count:user.problemsSolved.length});
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const saveProblem=async(req,res)=>{
    try{
        const id=req.params.id;
        if(!id)
        {
            return res.status(404).send("Please Give A Valid Problem Id!");
        }

        const DSAproblem=await Problem.findById(id);
        if(!DSAproblem)
        {
            return res.status(404).send("Please Give A Valid Problem Id!");
        }

        const user=await User.findById(req.result);

        if (!user) 
        {
            return res.status(404).send("User Not Found!");
        }

        if(user.savedProblems.includes(id))
        {
            return res.status(409).send("Problem Already Saved!");
        }

        user.savedProblems.push(id);
        await user.save();

        res.status(201).send("Problem Saved Successfully!");
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getSavedProblems=async(req,res)=>{
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        // objects to skip
        const skip = (page-1) * limit;

        const user = await User.findById(req.result)
        .select("savedProblems problemsSolved")
        .populate({
            path: "savedProblems",
            select: "_id title difficulty totalSubmissions acceptedSubmissions",
            options: { skip, limit }
        })
        .populate({
            path: "problemsSolved",
            select: "_id"   // only need _id for the solvedSet check
        });

        if (!user)
        {
            return res.status(404).send("User Not Found!");
        }

        const problemSet=user.savedProblems;

        const solvedSet=new Set(user.problemsSolved.map((id)=>id.toString()));

        const updatedProblemSet=problemSet.map((problem)=>({
            ...problem.toObject(),
            isSolved:solvedSet.has(problem._id.toString())
        }));

    return res.status(200).send(updatedProblemSet);

    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const getSubmissions=async(req,res)=>{
    try{
        const {id}=req.params;

        // first we have to verify the problem id
        if(!id)
        {
            return res.status(404).send("No Valid Problem ID Recived Please Try Again!");
        }
        
        const DSAproblem=await Problem.findById(id);

        if(!DSAproblem)
        {
            return res.status(404).send("Invalid Id!");
        }

        const userID=req.result;
        if(!userID)
        {
            return res.status(404).send("No Valid User Id Recieved Please Try Again!");
        }

        const user=await User.findById(req.result);
        if(!user)
        {
            return res.status(404).send("Invalid User Id!");
        }

        const problemSubmissions=await Submission.find({user:userID,problem:id}).sort({ createdAt: -1 });;

        res.status(200).send(problemSubmissions);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports={createProblem,updateProblem,deleteProblem,getProblem,getAllProblems,filterProblems,getAllProblemsSolvedByUser,getNumberOfProblemsSolvedByUser,saveProblem,getSavedProblems,getSubmissions};