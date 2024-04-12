const mongoose = require("mongoose");
const _ = require("lodash");
const axios = require("axios");

const serviceProvider = require("../../models/ServiceProvider");
const User = require("../../models/Users");
const services = require("../../models/Services");
const sendOtp = require("../../utilities/send-otp").sendOtp;

exports.serviceProviderSignUp = async (req, res, next) => {
  try {
    let serviceProviderData = await User.findOne({
      $and: [{ phone: req.body.phone }, { type: req.body.type }]
    }).exec();
    if (!_.isEmpty(serviceProviderData) && !serviceProviderData.isDeleted) {
      return res.send({
        status: "ERROR",
        message: `Service Privider With ${req.body.phone} Number already exists`
      });
    } else if (
      !_.isEmpty(serviceProviderData) &&
      serviceProviderData.isDeleted
    ) {
      let response = await User.findByIdAndUpdate(
        { _id: serviceProviderData._id },
        {
          $set: {
            name: req.body.name,
            location: {
              address: req.body.address,
              lat: req.body.lat,
              lng: req.body.lng,
              cityName: req.body.cityName,
              stateName: req.body.stateName
            },
            isDeleted: false
          }
        },
        { new: true }
      ).exec();
      sendOtp(response, (error, data) => {
        return res.send({
          status: "SUCCESS",
          message:
            "You have Registered Successfully With Root as Service Provider",
          response: response
        });
      });
    } else if (_.isEmpty(serviceProviderData)) {
      const servicesProvider = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        phone: req.body.phone,
        location: {
          address: req.body.address,
          lat: req.body.lat,
          lng: req.body.lng,
          cityName: req.body.cityName,
          stateName: req.body.stateName
        },
        firmName: req.body.firmName,
        partnerFcmToken: req.body.partnerFcmToken,
        type: req.body.type,
        created_by: null,
        isDeleted: false,
        acceptTerms: req.body.acceptTerms
      });
      let response = await servicesProvider.save();
      // send otp
      sendOtp(response, (error, data) => {
        return res.send({
          status: "SUCCESS",
          message:
            "You have Registered Successfully With Root as Service Provider",
          response: response
        });
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.serviceProviderLogin = (req, res, next) => {
  User.findOne({
    $and: [
      { phone: req.body.phone },
      { type: req.body.type },
      { isDeleted: false }
    ]
  })
    .exec()
    .then(serviceProvider => {
      if (_.isEmpty(serviceProvider)) {
        return res.send({
          status: "ERROR",
          message: "You are not Registered User"
        });
      } else {
        sendOtp(serviceProvider, (error, result) => {
          return res.send({
            status: "SUCCESS",
            message: "Login Successfull",
            response: {
              _id: serviceProvider._id,
              regId: result._id,
              phone: serviceProvider.phone,
              type: serviceProvider.type,
              name: serviceProvider.name,
              location: serviceProvider.location
            }
          });
        });
      }
    })
    .catch(err => {
      return res.send({
        error: "ERROR",
        message: err.message
      });
    });
};

exports.getAllServiceProvider = async (req, res, next) => {
  try {
    let result = await User.find({
      $and: [
        {
          $or: [{ type: "crane" }, { type: "mechanic" }]
        },
        {
          isDeleted: false
        }
      ]
    }).exec();
    if (_.isEmpty(result)) {
      return res.send({
        status: "NOT_FOUND",
        response: result
      });
    }
    return res.send({
      status: "SUCCESS",
      response: result
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.getServiceProviderById = (req, res, next) => {
  const id = req.params.id;
  User.findOne({ $and: [{ _id: id }, { isDeleted: false }] })
    .exec()
    .then(response => {
      if (_.isEmpty(response)) {
        return res.send({
          status: "NOT_FOUND",
          response: response
        });
      }
      return res.send({
        status: "SUCCESS",
        response: response
      });
    })
    .catch(error => {
      return res.send({
        status: "ERROR",
        message: error.message
      });
    });
};

exports.getServiceProviderByCreatedBy = (req, res, next) => {
  const createdBy = req.params.id;
  User.find({
    $and: [
      { created_by: createdBy },
      { $or: [{ type: "mechanic" }, { type: "crane" }] },
      { isDeleted: false }
    ]
  })
    .exec()
    .then(response => {
      if (_.isEmpty(response)) {
        return res.send({
          status: "NOT_FOUND",
          response: response
        });
      }
      return res.send({
        status: "SUCCESS",
        response: response
      });
    })
    .catch(error => {
      return res.send({
        status: "ERROR",
        message: error.message
      });
    });
};

exports.deleteServiceProvider = async (req, res, next) => {
  try {
    let serviceProviderData = await User.findOne({
      $and: [{ _id: req.params.id }, { isDeleted: false }]
    }).exec();
    if (!_.isEmpty(serviceProviderData)) {
      let serviceData = await services
        .find({
          $and: [
            { ownerNumber: req.body.phone },
            { serviceType: req.body.type.toLowerCase() },
            { isDeleted: false }
          ]
        })
        .exec();
      if (!_.isEmpty(serviceData)) {
        await services
          .updateMany(
            {
              $and: [
                { ownerNumber: req.body.phone },
                { serviceType: req.body.type.toLowerCase() }
              ]
            },
            {
              $set: {
                isDeleted: true,
                created_by: null,
                updated_by: req.body.created_by
              }
            }
          )
          .exec();
        const user = await User.updateOne(
          { _id: serviceProviderData._id },
          {
            $set: {
              isDeleted: true,
              created_by: null,
              updated_by: req.body.created_by
            }
          }
        ).exec();
        if (_.isEmpty(user)) {
          return res.send({
            status: "NOT_FOUND",
            message: "User is not found"
          });
        }
        return res.send({
          status: "SUCCESS",
          response: user
        });
      }
    } else {
      return res.send({
        status: "NOT_FOUND",
        response: serviceProviderData
      });
    }
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

exports.updateServiceProvider = async (req, res, next) => {
  try {
    // TODO
    // need to update name in services also
    let serviceProviderData = await User.findOne({
      $and: [{ _id: req.params.id }, { isDeleted: false }]
    }).exec();
    if (!_.isEmpty(serviceProviderData)) {
      return res.send({
        status: "NOT_FOUND",
        response: serviceProviderData
      });
    }
    const user = await User.updateOne(
      { _id: serviceProviderData._id },
      { $set: { name: req.body.name } }
    ).exec();

    return res.send({
      status: "SUCCESS",
      response: user
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

// update city and state in service-provider
exports.updateCityAndStateName = (req, res, next) => {
  serviceProvider
    .find()
    .exec()
    .then(response => {
      if (!_.isEmpty(response)) {
        _.each(response, data => {
          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.location.lat},${data.location.lng}&key=AIzaSyCkW3dRvniHDCJPEfAliU9O9GuauZBkkj0`
            )
            .then(async result => {
              cityName = result.data.results[0].address_components.find(
                element => {
                  if (element.types.includes("locality")) {
                    return element.long_name;
                  }
                }
              );
              stateName = result.data.results[0].address_components.find(
                element => {
                  if (element.types.includes("administrative_area_level_1")) {
                    return element.long_name;
                  }
                }
              );
              data.location = {
                address: data.location.address,
                lat: data.location.lat,
                lng: data.location.lng,
                cityName: cityName.long_name,
                stateName: stateName.long_name
              };
              await serviceProvider
                .updateOne(
                  { _id: data._id },
                  {
                    $set: {
                      location: data.location
                    }
                  }
                )
                .exec();
            });
        });
        serviceProvider
          .find()
          .exec()
          .then(data => {
            return res.status(200).json({
              status: "User Updated Successfully",
              response: data
            });
          });
      }
    })
    .catch(error => {
      res.status(500).json({
        status: error.name,
        message: error.message
      });
    });
};

// moved all data of service provider to user
exports.copyServiceProviderToUser = async (req, res, next) => {
  let serviceProviderData = await serviceProvider.find().exec();
  if (!_.isEmpty(serviceProviderData)) {
    _.forEach(serviceProviderData, async (value, key) => {
      const user = new User({
        _id: value._id,
        phone: value.phone,
        type: value.type,
        name: value.name,
        location: {
          address: value.location.address,
          lat: value.location.lat,
          lng: value.location.lng,
          cityName: value.location.cityName,
          stateName: value.location.stateName
        },
        firmName: value.firmName,
        partnerFcmToken: value.partnerFcmToken,
        created_by: value.created_by,
        acceptTerms: value.acceptTerms,
        isDeleted: value.isDeleted,
        updated_by: value.updated_by,
        created_at: value.created_at,
        updated_at: value.updated_at
      });
      response = await user.save();
    });
    return res.send({
      status: "SUCCESS",
      message: "Successfully Update"
    });
  }
};
