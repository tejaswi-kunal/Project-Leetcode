const mongoose=require('mongoose');

const {Schema}=mongoose;

const submissionSchema=new Schema({
    problem:{
        type:Schema.Types.ObjectId,
        ref:'Problem',
        required:true
    },

    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    submittedCode:{
        language:{
            type:String,
            enum:["cpp","java","python","javascript"],
            required:true
        },
        completeCode:{
            type:String,
            required:true
        }
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Processing",
            "Accepted",
            "Wrong Answer",
            "Time Limit Exceeded",
            "Memory Limit Exceeded",
            "Runtime Error",
            "Compilation Error",
            "Internal Error",
            "Error"
        ],
        default: "Pending"
    },

    runtime:{
        type:Number,
        default:0
    },

    memory:{
        type:Number,
        default:0
    },

    testCasesPassed:{
        type:Number,
        default:0
    },

    testCasesTotal:{
        type:Number,
        default:0
    },

    errorMessege:{
        type:String,
        default:''
    }
},{
    timestamps:true
});

// compund index of (userid,problemid) for submissionSchema
submissionSchema.index(
    {
        user:1,
        problem:1
    }
);

const Submission=mongoose.model('Submission',submissionSchema);

module.exports=Submission;
