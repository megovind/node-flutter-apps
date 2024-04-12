const mongoose = require("mongoose");
const cryptoRandomString = require('crypto-random-string');
const _ = require("lodash");

const {
    addIncident,
    addTruck,
    updateAvailableRepsWithIncident,
    updateAvailableServicesWithIncident,
    saveUser } = require("../Incident/utility");

const sendSms = require("../../utilities/send-sms").sendMsg;
const staticMsg = require("../../static-messages/message");

const ReferralSource = require("../../models/ThirdPartyAPIs");
const Truck = require("../../models/Truck");
const User = require("../../models/Users");
const Incident = require("../../models/Incident");
const Specilizations = require("../../models/Specialization");

exports.create_incident_by_referrel = async (req, res) => {
    try {
        const queryData = {
            referral_source: req.query.source,
            restricted_to: _.upperFirst(_.lowerCase(req.query.platform)),
            platform_packages: req.query.package_url,
            api_key: req.query.key
        };
        const referral = await ReferralSource.findOne({ api_key: queryData.api_key }).select("referral_source restricted_to platform_packages api_key");
        if (_.isEmpty(referral)) {
            return res.send({ status: 'INVALID', message: 'Invalid api key, Please use valid api key!' });
        }
        if (!_.isEqual(queryData.referral_source, referral.referral_source)
            || !referral.restricted_to.includes(queryData.restricted_to)
            || !referral.platform_packages.includes(queryData.platform_packages)) {
            return res.send({ status: "INVALID_CREDENTIALS", message: "Please check you api, Somthing is not correct!" });
        }
        let owner = '';
        let truck = await Truck.findOne({ regNo: req.body.truckRegNo }).exec();
        if (!_.isEmpty(truck)) {
            owner = truck.owner;
        } else {
            const transporter = await User.findOne({ $and: [{ phone: req.body.ownerNum }, { type: "transporter" }] }).select("_id").exec();
            if (!_.isEmpty(transporter)) {
                owner = transporter._id;
            } else {
                const user = await saveUser(req.body, 'transporter');
                owner = user._id;
            }
            truck = await addTruck(req.body, owner);
        }
        const checkIncident = await Incident.find({ truckRegNo: req.body.truckRegNo, $or: [{ status: 'in-progress' }, { status: 'open' }] }).exec();
        if (!_.isEmpty(checkIncident)) {
            return res.send({ status: "ALREADY_EXISTS", message: `An incident is already open or in-progress for the truck: ${req.body.truckRegNo}.` });
        }
        await Truck.findOneAndUpdate(
            { _id: truck._id }, { $inc: { incidents: 1 } }
        ).exec();
        const incident = await addIncident(req.body, truck, referral.referral_source);
        const response = await Incident.findById({ _id: incident._id })
            .populate("specilization", "_id type ")
            .populate("owner", "_id name phone")
            .populate("driver", "_id name phone")
            .populate("representative", "_id name phone")
            .populate("service", "_id name phone")
            .populate("truck").exec();
        await updateAvailableServicesWithIncident(incident);
        await updateAvailableRepsWithIncident(incident);
        //send message to owner
        const truckLocation = `https://maps.google.com/?q=${response.location.lat},${response.location.lng}`;

        const messageToOwner = encodeURI(
            `An Incident Registered By ${response.owner.phone} for truck ${req.body.truckRegNo}. ${staticMsg.truckLocation} ${truckLocation}.  ${staticMsg.rootApp}`
        );
        const messageToAdmins = encodeURI(
            `An Incident Registered By ${response.owner.phone} for truck ${req.body.truckRegNo}. They Need help with ${req.body.description}. ${staticMsg.truckLocation} ${truckLocation}.  ${staticMsg.rootAgentLink}`
        );
        const adminsMobile = [
            process.env.adminMobileNumber,
            process.env.admin1,
            process.env.admin2,
            process.env.admin3
        ];
        sendSms(adminsMobile, messageToAdmins); //send message to admins
        sendSms([response.owner.phone], messageToOwner); //send message
        return res.send({ status: "SUCCESS", message: "Incident has been added successfully", response })

    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }
}

exports.fetch_problems_types = async (req, res) => {
    try {
        const checkRef = await ReferralSource.findOne({ api_key: req.query.key }).exec();
        if (_.isEmpty(checkRef)) {
            return res.send({ status: 'INVALID', message: 'Invalid api key, Please use valid api key!' });
        }
        const response = await Specilizations.find().exec();
        return res.send({ status: "SUCCESS", response });
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }
}


exports.fetch_referrels = async (req, res) => {
    try {
        const response = await ReferralSource.find().exec();
        if (_.isEmpty(response)) {
            return res.send({ status: "NOT_FOUND", message: "No referrels found!" });
        }
        return res.send({ status: "SUCCESS", response });
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }
}

exports.manage_api_access = async (req, res) => {
    try {
        const apiKey = cryptoRandomString({ length: 64, type: 'url-safe' });
        const newreferral = new ReferralSource({
            _id: mongoose.Types.ObjectId(),
            referral_source: req.body.referral_source,
            restricted_to: req.body.restricted_to,
            platform_packages: req.body.platforms,
            api_key: apiKey
        });
        const response = await newreferral.save();
        if (_.isEmpty(response)) {
            return res.send({ status: "ERROR", message: "Something went wrong!" });
        }
        return res.send({ status: "SUCCESS", response });
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }
}


exports.update_api_access = async (req, res) => {
    try {
        const id = req.params.id;
        const apiKey = cryptoRandomString({ length: 64, type: 'url-safe' });
        const data = {
            referral_source: req.body.referral_source,
            restricted_to: req.body.restricted_to,
            platform_packages: req.body.platforms,
            api_key: apiKey
        };
        const response = await ReferralSource.findByIdAndUpdate({ _id: id }, { $set: data });
        if (_.isEmpty(response)) {
            return res.send({ status: "ERROR", message: "Something went wrong!" });
        }
        return res.send({ status: "SUCCESS", response });
    } catch (error) {
        return res.send({ status: "ERROR", message: error.message });
    }
}
