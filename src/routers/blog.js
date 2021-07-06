const express = require('express')
const Blog = require('../models/blog')
const Comment = require('../models/comments');
const auth = require('../middleware/auth')
const router = new express.Router()
const ImageServices = require('../services/imageProcessing');
const { route } = require('../app');

router.post('/blog', auth, async (req, res,next) => {
    try {
    const {
        title,
        body,
        tags
    } = req.body

    let tagsArray = tags.split(",")

    let data={
        title:title,
        body:body,
        "tags":tagsArray,
        "owner":req.user._id
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
    
            const uploadImage = await ImageServices.BlogImage(file)
    
            if (!uploadImage) {
                return res.status(500).json({
                    status: false,
                    message: "Image upload failed"
                })
            }
            data.image=uploadImage
    }

        const blog = new Blog(data);
    
        await blog.save()
        res.status(201).json({
            blog:blog,
            message: "Blog Created Successful"
        })
    }
    catch (error) {
        res.status(403).send(error.message)
    }
})

router.get('/myAllBlog', auth, async (req, res) => {
    try {
        const blogs = await Blog.find({owner:req.user._id},
            {
                title:1,
                body:1,
                tags:1,
                image:1

            })
        .populate({
            path : 'comments',
            select: 'body',
            populate : {
              path : 'authorId',
              select:'name email'
            }
          })
          .sort({_id : -1})
          .lean()
          
        if (!blogs.length) {
            return res.status(404).send('You dont have any blog')
        }
        res.status(200).json(blogs)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/myBlog/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const blog = await Blog.findOne({ _id, owner: req.user._id }).lean()
        if (!blog) {
            return res.status(404).send('not found')
        }
        res.status(200).send(blog)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/othersBlog/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const blog = await Blog.findOne({ _id}).lean()
        if (!blog) {
            return res.status(404).send('not found')
        }
        res.status(200).send(blog)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/comment/:id', auth, async(req, res) =>{
    let _id =await req.params.id
    let comment = await Comment.findOne({_id}).lean()
    res.send(comment)
})

router.post('/blog/:blogId/comments',auth,async(req,res) =>{
    try {
        let comment = new Comment ({
            ...req.body,
            authorId: req.user._id,
        })
        let _id = req.params.blogId
        let blog = await Blog.updateOne({ _id },{ $push: { comments: comment } })
        if(!blog){
            return res.status(404).send('not found')
        }
        await comment.save()

        res.status(201).json({blog})

    }   catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

router.delete('/blog/:id', auth, async (req, res) => {
    try {
        let user = await req.user
        const blog = await Blog.findOne({ _id: req.params.id, owner: user._id })
        if (!blog) {
            res.status(404).send('not found')
        }
        if (blog.image) {
            await ImageServices.removeFile("blogImages",blog.image)
        }

        const delBlog = await Blog.deleteOne({ _id: id })

        if (!delBlog)
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            })

        return res.status(201).json({
            status: true,
            message: "Blog Delete Successful"
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/blog/update/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title','body','tags','image']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const blog = await Blog.findOne({ _id: req.params.id, owner: req.user._id})
        if (!blog) {
            return res.status(404).send('not found')
        }
        updates.forEach((update) => blog[update] = req.body[update])
            await blog.save()
            return res.status(201).send(blog)
        } catch (e) {
            res.status(400).send('Something went wrong')
        }
})

router.patch('/blog/addImage/:id', auth, async (req, res) => {
    
    try {
        const id = req.params.id
        const file = req.files.image
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i

            if (!allowedExtensions.exec(file.name)) {
                return res.status(400).json({
                    status: false,
                    message: "Image Extension Is Not Valid !"
                })
            }
    
            const uploadImage = await ImageServices.BlogImage(file)
    
            if (!uploadImage) {
                return res.status(500).json({
                    status: false,
                    message: "Image upload failed"
                })
            }

            const blog = await Blog.findOneAndUpdate({ _id:id}, {
                $set:{image:uploadImage}
            })
            await blog.save()
            res.status(201).json({
                blog
            })

        } catch (e) {
            res.status(400).send('Something went wrong')
        }
})

router.delete('/blog/ImageDelete/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);
        const blog = await Blog.findOne( {_id})
        console.log(blog);
        if (blog.image) {
            await ImageServices.removeFile("blogImages/",blog.image)
        }
        blog.image=null
        await blog.save()
        res.status(201).json({blog})
    } 
    catch (error) {
        res.status(403).json({
            status:false,
            message:error.message
        })
    }
})

module.exports = router