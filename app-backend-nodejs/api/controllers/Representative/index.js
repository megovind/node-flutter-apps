const mongoose = require("mongoose");
const _ = require("lodash");

const User = require("../../models/Users");
const sendSMS = require("../../utilities/send-sms").sendMsg;
const staticMsg = require("../../static-messages/message.json");

// add repreentative to user table
exports.addRepresentative = async (req, res, next) => {
  try {
    // check the representative is already exists or not
    const userData = await User.findOne({
      $and: [{ phone: req.body.phone }, { type: req.body.type }]
    }).exec();
    // if userData is empty, save the userData in db
    if (_.isEmpty(userData)) {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        phone: req.body.phone,
        type: 'representative',
        name: req.body.name,
        created_by:
          req.body.hasOwnProperty("created_by") && req.body.created_by !== ""
            ? req.body.created_by
            : null,
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        },
      });
      const response = await user.save();
      // after adding the representative, send sms to newly registred representative
      sendSMS(
        [response.phone],
        `${staticMsg.addRepresentative} ${staticMsg.rootAgentLink}`
      );
      return res.send({
        status: "SUCCESS",
        message: "User has been added succefully",
        response
      });
    } else {
      if (userData.isDeleted) {
        // update the user
        const response = await User.updateOne(
          { _id: userData.id },
          {
            $set: {
              isDeleted: false,
              name: req.body.name,
              location: {
                address: req.body.address,
                lat: req.body.lat,
                lng: req.body.lng,
                cityName: req.body.cityName,
                stateName: req.body.stateName
              }
            }
          }
        ).exec();
        return res.send({
          status: "SUCCESS",
          message: "User has been added succefully",
          response
        });
      } else {
        return res.send({
          status: "ERROR",
          message: "User with Register Numbered already Exists"
        });
      }
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//representative: make active or inactive
exports.changeRepresentativeStatus = async (req, res, next) => {
  try {
    const status = req.body.status;
    const id = req.params.id;
    const response = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { isDeleted: status } }
    ).exec();
    if (_.isEmpty(response)) {
      return res.send({ status: "NOT_FOUND", message: "User not found" });
    }
    return res.send({ status: "SUCCESS", message: "User Updated", response });
  } catch (error) {
    res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//invite people
exports.invitePeople = (req, res, next) => {
  const type = req.params.type;
  const byTransporter = req.params.transporter;
  const userName = req.params.user;
  let link;
  let message;

  if (byTransporter !== "Yes") {
    if (type === "agent") {
      link = staticMsg.agentLink;
      message = staticMsg.inviteToAgent;
    } else if (type === "transporter") {
      link = staticMsg.transporterLink;
      message = staticMsg.inviteToTransporter;
    } else if (type === "partner") {
      link = staticMsg.partnerLink;
      message = staticMsg.inviteToPartner;
    }
  } else {
    link = staticMsg.transporterLink;
    message = `You Have been Invited To root By ${userName}.`;
  }

  if (req.body.phone !== "") {
    sendSMS([req.body.phone], `${message} ${link}`);
    return res.send({
      status: "SUCCESS",
      message: "Invitation send Successfully"
    });
  } else {
    return res.send({
      status: "ERROR",
      message: "Phone Number is Empty"
    });
  }
};

exports.getRepresentativeByCreatedBy = async (req, res, next) => {
  try {
    const createdBy = req.params.id;
    let representative = await User.find({
      $and: [
        { created_by: createdBy },
        { type: "representative" },
        { isDeleted: false }
      ]
    }).exec();
    if (_.isEmpty(representative)) {
      return res.send({
        status: "NOT_FOUND",
        message: "Representatives not found"
      });
    }
    return res.send({
      status: "SUCCESS",
      response: representative
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getAllRepresentative = async (req, res, next) => {
  try {
    const repData = await User.find({
      $and: [{ type: "representative" }]
    }).exec();
    if (_.isEmpty(repData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Representative Found"
      });
    }
    const allAdminData = await User.find({ type: "admin" }).exec();
    return res.send({
      status: "SUCCESS",
      response: repData,
      allAdmin: allAdminData
    });
  } catch (err) {
    return res.send({ status: "ERROR", message: err.message });
  }
};

exports.deleteRepresentativeById = async (req, res, next) => {
  try {
    const repData = await User.find({
      $and: [{ _id: req.params.repId }, { type: "representative" }]
    }).exec();
    if (_.isEmpty(repData)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Representative Found"
      });
    }
    const response = User.updateOne(
      { $and: [{ _id: req.params.repId }, { type: "representative" }] },
      {
        $set: {
          isDeleted: true,
          created_by: null,
          updated_by: req.body.created_by
        }
      }
    ).exec();
    return res.send({
      status: "SUCCESS",
      response: response
    });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};

exports.updateRepresentative = async (req, res, next) => {
  try {
    let representative = await User.find({ _id: req.body._id }).exec();
    if (_.isEmpty(representative)) {
      return res.send({
        status: "NOT_FOUND",
        message: "No Representative Found"
      });
    }
    const data = await User.updateOne(
      { _id: req.body._id },
      {
        $set: {
          name: req.body.name,
          location: {
            address: req.body.address,
            lat: req.body.lat,
            lng: req.body.lng,
            stateName: req.body.stateName,
            cityName: req.body.cityName
          }
        }
      }
    ).exec();
    return res.send({
      status: "SUCCESS",
      response: data
    });
  } catch (err) {
    return res.send({ status: "ERROR", message: err.message });
  }
};

exports.changeAgentStatus = async (req, res, next) => {
  const id = req.params.id;
  try {
    const response = await User.findOneAndUpdate(
      { $and: [{ _id: id }, { type: "representative" }] },
      { $set: { isDeleted: req.body.isDeleted } }
    ).exec();
    if (_.isEmpty(response)) {
      return res.send({ status: "ERROR", message: "Something went wrong" });
    }
    return res.send({
      status: "SUCCESS",
      message: "Agent status updated!",
      response
    });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};
