const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    request_id: {type:Number, required:true},
    title:{type:String, required:true},
    course: {type:String, required:true},
    language: {type:String, required:true},
   estimated_workload: {type:String, required:true},
    tags: {type:String, required:true},
    date: {type:Date, required:true, default: Date.now},
    description: {type:String, required:true, maxLength: 250},
    author: {type:String, required:true},
    author_id: {type: Schema.Types.ObjectId, required: true},
    open: {type:String, required:true, default:"true"}
})

module.exports = mongoose.model("Request", requestSchema, "requests")