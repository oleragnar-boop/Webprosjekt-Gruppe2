const mongoose = require('mongoose')
Schema = mongoose.Schema
bcryptjs = require('bcryptjs')
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
    avatar: {type:String, default: 'avatar0.png', required:true},
    role: {type:String, enum:['standard','admin','super'], default: 'standard', required:true},
    isApproved: {type:String, enum:['no', 'yes'], default: 'no', required:true},
    bookmarkedTeachers: {type:String},
    bookmarkedRequests: {type:String},
    description: {type: String}
})

 userSchema.pre('save', function(next) {
    let user = this;

    if (!user.isModified('password')) return next();

    bcryptjs.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcryptjs.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        })
    })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcryptjs.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}; 

module.exports = mongoose.model("User", userSchema, "users")