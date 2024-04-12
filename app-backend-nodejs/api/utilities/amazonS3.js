const fs = require("fs");
const AWS = require("aws-sdk");
const _ = require("lodash");

// exports.uploadToS3 = (file, cb) => {
//     const s3bucket = new AWS.S3({
//         accessKeyId: process.env.amazonS3AccessKeyID,
//         secretAccessKey: process.env.amazonS3SecretAccessKey,
//         Bucket: process.env.amazonS3BucketName
//     });

//     if (!_.isEmpty(file)) {
//         // s3bucket.createBucket(() => {
//         // file.forEach((file) => {
//         const params = {
//             Bucket: process.env.amazonS3BucketName,
//             Key: new Date().toISOString() + '-' + file.originalname,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//             ACL: 'public-read'
//         };
//         s3bucket.upload
//             (params, (err, data) => {
//                 if (err) {
//                     cb(err, null)
//                 } else {
//                     cb(null, data);
//                 }
//             });
//         //}
//         //});
//     } else {
//         cb(null, []);
//     }
// }

exports.uploadToS3 = (req, res, next) => {
  const s3bucket = new AWS.S3({
    accessKeyId: process.env.amazonS3AccessKeyID,
    secretAccessKey: process.env.amazonS3SecretAccessKey,
    Bucket: process.env.amazonS3BucketName
  });

  if (!_.isEmpty(req.file)) {
    const file = req.file;
    // s3bucket.createBucket(() => {
    // file.forEach((file) => {
    const params = {
      Bucket: process.env.amazonS3BucketName,
      Key: new Date().toISOString() + "-" + file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read"
    };
    s3bucket.upload(params, (err, data) => {
      if (err) {
        res.send({
          status: err.name,
          message: err.message
        });
      } else {
        res.send({
          status: "SUCCESS",
          response: data
        });
      }
    });
    //}
    //});
  } else {
    res.send({
      status: "EMPTY",
      message: "File is Empty",
      response: []
    });
  }
};

//this need to change when files will be made secure
exports.getFilesFromS3 = async () => {
  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: "AKIA2MH53LXGZOXDUYXH",
    secretAccessKey: "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",
    region: "Asia Pacific (Mumbai)"
  });
  const s3 = new AWS.S3();
  const response = await s3
    .listObjectsV2({
      Bucket: "root"
    })
    .promise();
  console.log(response);
};
