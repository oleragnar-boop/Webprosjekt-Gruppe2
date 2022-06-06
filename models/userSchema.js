const mongoose = require('mongoose')
Schema = mongoose.Schema
bcrypt = require('bcrypt')
SALT_WORK_FACTOR = 10;

const noteSchema = new Schema({ teacher_email: {type:String}, note: {type:String}});

const userSchema = new Schema({
    firstname:{type:String, required:true},
    lastname: {type:String, required:true},
    password: {type:String, required:true},
    affSchool: {type:String, required:true},
    email: {type:String, required:true},
    jobTitle: {type:String},
    jobLink: {type:String},
    languages: {type:String},
    empStatus: {type:String},
    workingHours: {type:Number},
    tags: {type:String},
    avatar: {type:Number, enum:['1', '2', '3', '4', '5'], default: '1', required:true},
    role: {type:String, enum:['standard','admin','super'], default: 'standard', required:true},
    isApproved: {type:String, enum:['no', 'yes'], default: 'no', required:true},
    bookmarkedTeachers: {type:String},
    bookmarkedRequests: {type:String},
    //personalNotes: [noteSchema]
})

 userSchema.pre('save', function(next) {
    let user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        })
    })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}; 

module.exports = mongoose.model("User", userSchema, "users")