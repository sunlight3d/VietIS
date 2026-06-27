var express = require('express')
var router = express.Router()
const {checkToken} = require('../helpers/TokenCheck')
const {sequelize} = require('../databases/database')
const path = require('path')
const fs = require('fs')
//function co nhiem vu: tra ve true/false, dong thoi response
const checkTokenKey = async ({req, res, next}) => {
    const {tokenkey} = req.headers
    console.log(`tokkkkeeeen = ${tokenkey}`)
    const isValidToken = await checkToken({tokenkey})
    if(isValidToken == false) {
        res.json({
            result: "failed",
            data:[],
            message: 'Token is invalid'
        })    
        return false;
    } else {
        next()
        return true;
    }
}


//http://localhost:3002/api/products/uploads
router.post('/uploads', async (req, res, next) => {
    //Data is saved in req.files 
    //Insert this code inside try...catch, why?    
    try {          
        let checkTokenResult = await checkTokenKey({req, res, next})        
        if(checkTokenResult == false ){
            return
        }                
        if (!req.files) {
            res.json({
              result: "failed",
              message: i18n.__("Cannot find files to upload"),
              time: Date.now()
            })
            return
          }          
          const keys = Object.keys(req.files)
          if (keys.length === 0) {
            res.json({
              result: "failed",
              message:"Cannot find files to upload",
              time: Date.now()
            })
            return
          }
          
          let imageNames = []
          keys.forEach(async (key) => {
            const fileName = `${Math.random().toString(36)}`
            const fileObject = req.files[key]
            const fileExtension = fileObject.name.split('.').pop()
            const destination = `${path.join(__dirname, '..')}/uploads/${fileName}.${fileExtension}`            
            res.json({
                result: "ok",
                message: "Upload files 33333",
                data: "haha test"
              })              
              return
            let error = await fileObject.mv(destination) //mv = move 
            
            if (error) {
                console.log("failed")
                res.json({
                    result: "failed",
                    message: `Cannot upload files: ${error}`,
                    time: Date.now()
                })
                return
            }
           
            imageNames.push(`${fileName}.${fileExtension}`)
            //Kiểm tra file cuối cùng trong list ?            
            if (key === keys[keys.length - 1]) {                
              res.json({
                result: "ok",
                message: "Upload files successfully",
                data: imageNames
              })
            }
          })
    }catch(error) {        
        console.log(`error = ${error.toString()}`)
        res.json({
            data: {},
            message: "upload images failed"+error.toString(),
            status: "failed"
        })
    }
})
//http://10.1.35.148:3000/photos/getImage?fileName=0.5asuwr2ytw3.jpg
router.get('/getImage', async (req, res) =>{        
    let {fileName, locale} = req.query       
    const destination = `${path.join(__dirname, '..')}/uploads/${fileName}`
    ;
    try {           
        fs.readFile(destination, function(err, data) {
            if (err) {
                res.json({
                    result: 'failed',
                    message: "Error getting detail's product",
                })
                return
            }
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.
        });
    } catch(error) {
        res.json({
            result: 'failed',
            message: `Error getting detail's product: ${err}`,
        })
    }
  })
module.exports = router