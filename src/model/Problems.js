const mongoose=require('mongoose');
const {Schema}=mongoose;

const problemSchema=Schema({
    title:{
        type:String,
        minlength:3,
        maxlength:100,
        trim:true,
        required:true
    },
    description:{
        type:String,
        minlength:20,
        maxlength:5000,
        trim:true,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true
    },
    tags:{
        type:[String],
        enum:[
            'array','string','hashmap','hashset',
            'linkedList','stack','queue','heap','priorityQueue',
            'tree','binaryTree','binarySearchTree','trie',
            'graph','dfs','bfs','topologicalSort','shortestPath','unionFind',
            'dynamicProgramming','greedy','backtracking','divideAndConquer',
            'binarySearch','twoPointers','slidingWindow',
            'bitManipulation','math','geometry',
            'recursion','sorting','matrix','prefixSum','monotonicStack','gameTheory'
        ],
        required:true
    },
    companies:{
        type:[String]
    },
    // ->array of objects
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true 
            }
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
        }
    ],
    starterCode:[
        {
            language:{
                type:String,
                enum:['cpp','java','python','javascript'],
                required:true
            },
            
            initialCode:{
                type:String,
                required:true
            }
        }
    ],

    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    referenceSolution:[
        {
            language:{
                type:String,
                enum:['cpp','java','python','javascript'],
                required:true
            },

            completeCode:{
                type:String,
                required:true
            }
        }
    ],

    editorial:{
        type:String
    },

    hints:[String],

    constraints:[
        {
            type:String,
            required:true
        }
    ],
    totalSubmissions:{
        type:Number,
        default:0
    },
    acceptedSubmissions:{
        type:Number,
        default:0
    },
    likes:{
        type:Number,
        default:0
    },
    dislikes:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

problemSchema.post('findOneAndDelete', async function(problemInfo){
    if(!problemInfo)
    {
        return;
    }

    await mongoose.model('Reaction').deleteMany({
        problem:problemInfo._id
    });

    await mongoose.model('Comment').deleteMany({
        problem:problemInfo._id
    });

    await mongoose.model('Submission').deleteMany({
        problem:problemInfo._id
    });
});

const Problem=mongoose.model('Problem',problemSchema);

module.exports=Problem;
