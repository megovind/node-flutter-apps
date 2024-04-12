const mongoose = require("mongoose");
const _ = require("lodash");
const Contacts = require("../../models/Contact");
const Services = require("../../models/Services");

exports.contactInfoFromWebsite = async (req, res, next) => {
  try {
    const userContact = await Contacts.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          created_at: new Date(),
          subject: req.body.subject,
          message: req.body.message
        }
      }
    ).exec();
    if (!_.isEmpty(userContact)) {
      return res.send({
        status: "SUCCESS",
        message: "Thank you for contacting us, we will get back to you soon"
      });
    }
    const data = new Contacts({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });
    const response = await data.save();
    if (_.isEmpty(response)) {
      return res.send({
        status: "ERROR",
        message:
          "Something went wrong, Please wait for a while and then try again"
      });
    }
    return res.send({
      status: "SUCCESS",
      message: "Thank you for contacting us, We will get back to you"
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getServicesState = async (req, res, next) => {
  try {
    const states = await Services.aggregate([
      {
        $group: {
          _id: { state: "$location.stateName" }
        }
      }
    ]);
    const data = await getCitiesByState(
      states.filter(d => d._id.state !== "").filter(d => d._id.state !== null)
    );
    return res.send({
      response: data
    });
  } catch (error) {
    return res.send({ message: error });
  }
};

const getCitiesByState = async data => {
  return await Promise.all(
    data.map(async d => {
      const res = await Services.aggregate([
        { $match: { "location.stateName": d._id.state } },
        { $group: { _id: { city: "$location.cityName" } } }
      ]);
      const newdata = {
        state: d._id.state,
        cities: res.filter(d => d._id.city !== "")
      };
      return newdata;
    })
  );
};

exports.getServicesByCity = async (req, res, next) => {
  try {
    const cityName = req.params.city_name;
    const response = await Services.find({
      "location.cityName": cityName
    })
      .select("name phone location serviceType")
      .exec();
    return res.send({ status: "SUCCESS", response: response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
};
