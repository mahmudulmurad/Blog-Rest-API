const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim:true,
        required:true
    },
    body:{
        type: String,
        trim:true,
        required:true
    },
    image:{
        type:String,
        trim:true,
        default:null,
    },
    tags:[{
        type:String,
        trim:true,
        required:true
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog