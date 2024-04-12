const mongoose = require("mongoose");
const _ = require("lodash");

const sendPromSMS = require("./send-sms").promoMsg;
const Truck = require("../models/Truck");
const User = require("../models/Users");

const totalDocs = async () => {
  let userTruckDoc = [];
  return User.find({ $and: [{ isDeleted: false }, { type: "transporter" }] })
    .exec()
    .then(async response => {
      if (!_.isEmpty(response)) {
        let users = JSON.parse(JSON.stringify(response));
        for (let user of users) {
          let trucksOfTransporter = await Truck.find({ ownerId: user._id })
            .populate(
              "documents",
              "_id type url expiryDate created_at updated_at"
            )
            .exec();
          if (!_.isEmpty(trucksOfTransporter)) {
            let trucks = JSON.parse(JSON.stringify(trucksOfTransporter));
            for (const truck of trucks) {
              truck.documents.forEach(doc => {
                userTruckDoc.push({
                  phone: user.phone,
                  truckNum: truck.regNo,
                  docType: doc.type,
                  expiryDate: doc.expiryDate
                });
              });
            }
          } else {
            console.log("there are no truck found for this transporter");
          }
        }
        return userTruckDoc;
      } else {
        console.log("no transporter found!");
      }
    });
};

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

const remindeInterval = async days => {
  let totalDocsments = await totalDocs();

  //check if the expiry date comes after days
  var afterDays = addDays(new Date(), days);
  var docs = totalDocsments.filter(doc => {
    return (
      doc.expiryDate.split("T")[0] == afterDays.toISOString().split("T")[0]
    );
  });
  docs.forEach(d => {
    var typeInHindi = null;
    if (d.docType.toLowerCase() === "Fitness Certificate".toLowerCase()) {
      typeInHindi = "स्वस्थता-प्रमाणपत्र";
    } else if (d.docType.toLowerCase === "State Permit".toLowerCase()) {
      typeInHindi = "स्टेट परमिट";
    } else if (
      d.docType.toLowerCase() === "National Permit Type B".toLowerCase()
    ) {
      typeInHindi = "राष्ट्रीय परमिट प्रकार बी";
    } else if (d.docType.toLowerCase() === "Road Tax".toLowerCase()) {
      typeInHindi = "रोड टैक्स";
    } else if (d.docType.toLowerCase() === "Pollution".toLowerCase()) {
      typeInHindi = "प्रदूषण प्रमाण पत्र";
    } else if (d.docType.toLowerCase() === "Permit".toLowerCase()) {
      typeInHindi = "परमिट";
    } else {
      typeInHindi = "बीमा परमिट";
    }
    let message = `प्रिये root सदस्य, आपको सूचित किया जाता है की आपके वाहन ${
      d.truckNum
    } की ${typeInHindi} की वैद्यता दिनांक ${
      d.expiryDate.split("T")[0]
    } को समाप्त होने वाली है। असुविधा से बचने के लिए शिघ्र ही रिन्यूवल कराये। धन्यवाद! Call root on Toll Free 1800-121-980000`;
    sendPromSMS([d.phone], message);
  });
};

module.exports.runDocRemindCron = async () => {
  await remindeInterval(5);
  await remindeInterval(2);
};
