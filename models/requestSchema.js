const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    title:{type:String, required:true},
    course: {type:String, required:true},
    language: {type:String, required:true},
   estimated_workload: {type:Number, required:true},
    tags: {type:String, required:true},
    date: {type:Date, required:true, default: Date.now},
    description: {type:String, required:true, maxLength: 250},
    author: {type:String, required:true},
    author_id: {type: Schema.Types.ObjectId, required: true},
    open: {type:String, required:true, default:"true"},
    acceptedTeacher: {type:String, required:true, default:"none"},
    suggestedTeachers: {type:Array, required:true, default:["none"]},
    author_avatar: {type:String, required:true},
    jobTitle: {type:String, required:true},
})

module.exports = mongoose.model("Request", requestSchema, "requests")