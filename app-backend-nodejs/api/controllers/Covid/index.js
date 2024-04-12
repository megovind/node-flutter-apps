const mongoose = require("mongoose");
const _ = require("lodash");

const Covid = require("../../models/Covid");

exports.addInfo = async (req, res, next) => {
    try {
        const covidData = new Covid({
            _id: new mongoose.Types.ObjectId(),
            type: req.body.type,
            name: req.body.name,
            contact_number: req.body.contactNumber,
            available_service: req.body.availableService,
            is_corona_authenticated: req.body.isAuthenticated,
            is_govt: req.body.isGovt,
            is_ayurvedic: req.body.isAyurevedic,
            location: req.body.location,
        });
        const response = await covidData.save();

        if (_.isEmpty(response)) {
            return res.send({
                status: "ERROR",
                message: "Something went wrong, info cant be saved"
            })
        }
        return res.send({
            status: "SUCCESS",
            message: "Info Added successfully",
            response
        })
    } catch (error) {
        return res.send({
            status: "ERROR",
            message: error.message
        })
    }
};

exports.getAllCovidInfo = async (req, res, next) => {
    try {
        const response = await Covid.find({status: 'Active' }).exec();
        if (_.isEmpty(response)) {
            return res.send({
                status: "ERROR",
                message: "No data Found",
                response: []
            })
        }
        return res.send({
            status: "SUCCESS",
            response
        })
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message })
    }
}


exports.getAllCovidInfoDashboard = async (req, res, next) => {
    try {
        const response = await Covid.find().exec();
        if (_.isEmpty(response)) {
            return res.send({
                status: "ERROR",
                message: "No data Found",
                response: []
            })
        }
        return res.send({
            status: "SUCCESS",
            response
        })
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message })
    }
}

exports.updateCovidInfo = async (req, res, next) => {

    try {
        const id = req.params.id;
        const response = await Covid.findByIdAndUpdate({ _id: id }, {
            $set: {
                name: req.body.name,
                contact_number: req.body.contactNumber,
                available_service: req.body.availableService,
                is_corona_authenticated: req.body.isAuthenticated,
                is_govt: req.body.isGovt,
                is_ayurvedic: req.body.isAyurevedic,
                location: req.body.location,
            }
        }).exec();

        if (_.isEmpty(response)) {
            return res.send({ status: "ERROR", message: "Something went wrong, please check" });
        }
        return res.send({ status: "SUCCESS", response });
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }

}

exports.markActiveInavctive = async (req, res, next) => {
    try {
        const id = req.params.id;
        const response = await Covid.findByIdAndUpdate({ _id: id }, { $set: { status: req.body.status } }).exec();
        if (_.isEmpty(response)) {
            return res.send({ status: "ERROR", message: "Something went wrong, pleasae check" });
        }
        return res.send({ status: "SUCCESS", response })
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message })
    }
}