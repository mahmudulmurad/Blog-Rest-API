const Jimp = require("jimp")
const fs = require('fs')

const UserImage = async (file) =>{
    try {
        // Recived file data
        let image = await Jimp.read(file.data)
        await image.quality(70)
        const userImage = 'user-' + Date.now() + '-image' + '.jpg'
        // Upload in destination
       await image.write(`blogImages/${userImage}`)
        return userImage
    } catch (error) {
        if (error) return error
    }
}

const BlogImage = async( file ) =>{
   
        try {
            // Recived file data
            let image = await Jimp.read(file.data)
            await image.quality(70)
            const blogImage = 'blog-' + Date.now() + '-image' + '.jpg'
            // Upload in destination
           await image.write(`blogImages/${blogImage}`)
            return blogImage
        } catch (error) {
            if (error) return error
        }
    
}
const removeFile = (destination, file) => {
    fs.unlink(destination + file, function (err) {
        if (err) {
            console.error(err)
        }
        return
    });
}

module.exports = {
    BlogImage,
    UserImage,
    removeFile,
    UserImage
}