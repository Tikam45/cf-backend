
// const multer = require("multer");

// const storage = multer.diskStorage({
//     destination: function(req, file , cb){
//         cb(null,  'uploads/');
//     },
//     filename: function(req, file, cb){
//         console.log("hello ji" , req.user.email, path.extname(file.originalname));
//         cb(null, req.user.email + file.originalname + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     storage,
//     // storage: storage,
//     // limits : {fileSize : 15*1024*1024},
//     // fileFilter: function (req, file, cb){
//     //     console.log("kya hua" , file);
//     //     const fileTypes = /jpeg|png|jpg|gif/;
//     //     const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     //     const mimeType = fileTypes.test(file.mimetype);
    
//     //     if(extName && mimeType) {
//     //         return cb(null, true);
//     //     }
//     //     else{
//     //         cb(new Error('Only images are allowed'));
//     //     }
//     // },
// });

// exports.uploadFile = (req, res, next) => {
//     console.log("multer");
//     upload.single([
//         { name: 'coverPhoto', maxCount: 1 },
//         { name: 'firstPic', maxCount: 1 },
//         { name: 'secondPic', maxCount: 1 },
//         { name: 'thirdPic', maxCount: 1 },
//         {name: 'landDocument', maxCount: 1},
//     ])(req, res, (err) => {
//         console.log("error hai");
//         if(err){
//             return res.status(400).json({error: err.message});
//         }

//         next();
//     });
// };




const multer = require('multer');

const storage = multer.diskStorage({
  filename: function (req,file,cb) {
    console.log(" h i ", file.originalname);
    cb(null, file.originalname)
  }
});

const upload = multer({storage: storage},
  console.log(" hi ")
);

module.exports = upload;