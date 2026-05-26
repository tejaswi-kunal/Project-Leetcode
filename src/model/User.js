const mongoose=require('mongoose');
const {Schema}=mongoose;

const userSchema=Schema({
    firstName:{
        type:String,
        minlength:3,
        maxlength:50
    },
    lastName:{
        type:String,
        minlength:3,
        maxlength:50
    },
    userName:{
        type:String,
        minlength:3,
        maxlength:50,
        required:true,
        unique:true,
        trim:true
    },

    emailId:{
        type:String,
        unique:true,
        trim:true,
        required:true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min:5
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['male','female','other'],
        default:null
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    problemsSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'Problem'
        }]
    },
    submissionsCount:{
        type:Number,
        default:0
    },
    acceptedSubmissions:{
        type:Number,
        default:0
    },
    savedProblems:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'Problem'
        }]
    },
    rating:{
        type:Number,
        default:1200
    },
    profilePicture:{
        type:String
    },
    bio:{
        type:String,
        maxlength:300
    },
    github:{
        type:String,
        maxlength:150
    },
    linkedin:{
        type:String,
        maxlength:150
    },
    college:{
        type:String,
        maxlength:100
    },
    lastLogin:{
        type:Date
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    passwordChangedAt:{
        type:Date
    }
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (!userInfo)
    {
        return;
    }

    const Reaction = mongoose.model('Reaction');
    const Comment = mongoose.model('Comment');
    const Problem = mongoose.model('Problem');

    const reactions = await Reaction.find({
        user: userInfo._id
    });

    for (const reaction of reactions)
    {
        if (reaction.type === 'like')
        {
            await Problem.findByIdAndUpdate(
                reaction.problem,
                {
                    $inc: {
                        likes: -1
                    }
                }
            );
        }
        else
        {
            await Problem.findByIdAndUpdate(
                reaction.problem,
                {
                    $inc: {
                        dislikes: -1
                    }
                }
            );
        }
    }

    await Reaction.deleteMany({
        user: userInfo._id
    });

    await Comment.deleteMany({
        user: userInfo._id
    });

    await mongoose.model('Submission').deleteMany({
        user: userInfo._id
    });
});

const User=mongoose.model('User',userSchema);

module.exports=User;