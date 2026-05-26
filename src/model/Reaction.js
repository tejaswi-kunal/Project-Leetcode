const mongoose=require('mongoose');
const {Schema}=mongoose;

const reactionSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    problem:{
        type:Schema.Types.ObjectId,
        ref:'Problem',
        required:true
    },
    type:{
        type:String,
        enum:['like','dislike'],
        required:true
    }
},{
    timestamps:true
});

// it will ensure one like or dislike per user ,per problem
reactionSchema.index(
    {
        user:1,
        problem:1
    },
    {
        unique:true
    }
);

// this indexing will help us to find like and dislikes with resepct to particular problem very fast
reactionSchema.index(
    {
        probelm:1
    }
)

const Reaction=mongoose.model('Reaction',reactionSchema);

module.exports=Reaction;