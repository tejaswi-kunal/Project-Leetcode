const mongoose=require('mongoose');
const {Schema}=mongoose;

const commentSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    problem:{
        type:Schema.Types.ObjectId,
        ref:'Problem'
    },

    text:{
        type:String,
        required:true,
        trim:true,
        minlength:1,
        maxlength:1000
    }
},{
    timestamps:true
});

commentSchema.index({
    problem:1,
    createdAt:-1
});

commentSchema.index({
    user:1
});

const Comment=mongoose.model('Comment',commentSchema);

module.exports=Comment;