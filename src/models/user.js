const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Blog = require('./blog')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    followTags : [{
        type : String,
        default: null
    }],
    image: {
        type: String,
        trim: true,
        default: null
    },
    access_token: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
})

userSchema.virtual('blogs', {
    ref: 'Blog',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET,{ expiresIn: '2h' })
    user.access_token = token
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password) => {

    const user = await User.findOne({ email })
    
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatched = await bcrypt.compare( password, user.password )
    if (!isMatched) {
        throw new Error('Unable to login')
    }
    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Delete user blogs when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Blog.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User