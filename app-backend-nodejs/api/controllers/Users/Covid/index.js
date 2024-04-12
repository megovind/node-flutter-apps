const mongoose = require("mongoose");
const _ = require("lodash");

const User = require("../../../models/Users");


exports.registerUser = async (req, res, next) => {
    try {
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            phone: req.body.phone,
            type: req.body.type,
            needed_help: req.body.neededHelp,
            location: {
                address: req.body.address,
                lat: req.body.lat,
                lng: req.body.lng,
                cityName: req.body.cityName,
                stateName: req.body.stateName,
                country: req.body.country,
                zipcode: req.body.zipcode
            },
            created_by:
                req.body.hasOwnProperty("created_by") && req.body.created_by !== ""
                    ? req.body.created_by
                    : null,
            acceptTerms: req.body.acceptTerms,
            isDeleted: false
        });
        let response;
        const exists = await User.findOne({ phone: req.body.phone }).exec();
        if (!_.isEmpty(exists)) {
            return res.send({ status: "ERROR", message: "We already have your details!" })
        } else {
            response = await user.save();
        }
        if (_.isEmpty(response)) {
            return res.send({ status: "ERROR", message: "Something went wrong" });
        }
        return res.send({ status: "SUCCESS", response: response });
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }
}

exports.editRequestHelp = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                phone: req.body.phone,
                needed_help: req.body.neededHelp,
                type: req.body.type,
                dl_image: req.body.dl_image,
                logged_in: req.body.status,
                verified: req.body.verified,
                "location.address": req.body.address,
                "location.cityName": req.body.cityName,
                "location.stateName": req.body.stateName,
                "location.country": req.body.country,
                "location.zipcode": req.body.zipcode
            }
        })
        if (_.isEmpty(response)) {
            return res.send({ status: "ERROR", message: "Something went wrong!" })
        }
        return res.send({ status: "SUCCESS", response })
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message })
    }
}