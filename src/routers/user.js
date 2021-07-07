const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { route } = require('../app')
const Blog = require('../models/blog')
const ImageServices = require('../services/imageProcessing');
const router = new express.Router()

router.post('/users', async (req, res) => {
    try {
        const {name,email,password} = req.body
        let data={
           name,
           email,
           password
        }
        if(req.files){
            const file = req.files.image

            var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i

                if (!allowedExtensions.exec(file.name)) {
                    return res.status(400).json({
                        status: false,
                        message: "Image Extension Is Not Valid !"
                    })
                }
        
                const uploadImage = await ImageServices.UserImage(file)
        
                if (!uploadImage) {
                    return res.status(500).json({
                        status: false,
                        message: "Image upload failed"
                    })
                }
                data.image=uploadImage
        }
        const user = new User(data)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send(token)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send(token)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.access_token = null
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {

    let updates = Object.keys(req.body)

    if( req.files ){
        const file = req.files.image
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i

            if (!allowedExtensions.exec(file.name)) {
                return res.status(400).json({
                    status: false,
                    message: "Image Extension Is Not Valid !"
                })
            }
            if(req.user.image){
                await ImageServices.removeFile("blogImages/",req.user.image)
            }
            const uploadImage = await ImageServices.UserImage(file)
    
            if (!uploadImage) {
                return res.status(500).json({
                    status: false,
                    message: "Image upload failed"
                })
            }

            req.user.image=uploadImage
    }
    
    const allowedUpdates = ['name', 'email','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/user/topics', auth, async(req,res) => {

    try { 
        let topic = await  req.body
        let user = await  req.user

        for( let i = 0 ; i< topic.followTags.length ; i++ ){
            user.followTags.push(topic.followTags[i])
        }
        user.followTags=Array.from(new Set(user.followTags));
        await user.save()
        await res.send(topic)
    }   catch (e) {
        res.status(500).send(e)
    }
})

router.get('/feeds', auth, async(req,res) =>{
    try {
        let user = req.user
        let feeds = []
        for( let i=0 ; i < user.followTags.length ; i++ ){
            let blogs = await Blog.find({ tags : user.followTags[i] },{
                title:1,
                body:1,
                tags:1,
                image:1
            })
            .populate({
                path:"owner",
                select:"name email"
            })
            .populate({
                path:"comments",
                select:"body",
                populate:{
                    path:"authorId",
                    select:"name email image"
                }
            })
            .lean()
            feeds.unshift(blogs)
        }
        res.send(feeds)
    }   catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/findOne/:id',auth,async(req,res) =>{
    try{
        const user = await User.findOne({ _id: req.params.id})
        res.status(200).send(user)
    }
    catch(e){
        res.status(400).send(e)
    }
})

module.exports = router