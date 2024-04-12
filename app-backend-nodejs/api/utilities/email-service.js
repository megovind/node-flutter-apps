const _ = require("lodash");
const nodemailer = require("nodemailer");

exports.mailService = (req, res, next) => {
  let body = req.body;
  main(body)
    .then(response => {
      res.send({
        status: "success",
        message: "Mail Sent Successfully"
      });
      console.log("response", response);
    })
    .catch(console.error);
};

// async..await is not allowed in global scope, must use a wrapper
main = async body => {
  console.log("body", body);
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();
  // console.log("testAccount", testAccount);

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 465, //587,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.GENERATED_USER, // generated ethereal user
      pass: process.env.pass // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter
    .sendMail({
      from: `"${body.name}" ${body.email}`, // sender address
      to: body.receiver, // list of receivers
      subject: `${body.msg_subject}`, // Subject line
      text: `${body.message}`, // plain text body
      html: "<b>Hello world?</b>" // html body
    })
    .then(response => {
      console.log("inforespo", response);
    });

  // console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  let returnItem = await nodemailer.getTestMessageUrl(info);
  return returnItem;
};
