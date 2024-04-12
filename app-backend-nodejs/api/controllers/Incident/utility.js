const mongoose = require("mongoose");
const _ = require("lodash");

const Incident = require("../../models/Incident");
const Truck = require("../../models/Truck");
const User = require("../../models/Users");
const Services = require("../../models/Services");

const { getCoordsInDistance } = require("../../utilities/getcoord")

//func: to create user
exports.saveUser = async (data, type) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        phone: data.ownerNum,
        type: type,
        name: data.ownerName,
        created_by: data.created_by,
        acceptTerms: true,
        isDeleted: false,
        location: {
            address: data.address,
            lat: data.lat,
            lng: data.lng,
            cityName: data.cityName,
            stateName: data.stateName
        }
    });
    const response = await user.save();
    return response;
};


//func: add truck
exports.addTruck = async (data, owner) => {
    const truck = new Truck({
        _id: new mongoose.Types.ObjectId(),
        truckModel: data.truckModel,
        regNo: data.truckRegNo.trim().toUpperCase(),
        owner: owner,
        driver: null,
        location: {
            address: data.address,
            lat: data.lat,
            lng: data.lng,
            cityName: data.cityName,
            stateName: data.stateName
        }
    });
    const truckData = await truck.save();
    return truckData;
};


//func: add incident
exports.addIncident = async (incident, truck, source = 'Root') => {
    let inicdentLength = await Incident.countDocuments().exec();
    const incidentModel = new Incident({
        _id: new mongoose.Types.ObjectId(),
        truckRegNo: incident.truckRegNo.toUpperCase(),
        caseId: createId("INCIDENT", inicdentLength),
        truck: truck._id,
        owner: truck.owner,
        driver: truck.driver ? truck.driver : null,
        specialization: incident.specialization,
        description: incident.description,
        location: {
            address: incident.address,
            lat: incident.lat,
            lng: incident.lng,
            cityName: incident.cityName,
            stateName: incident.stateName
        },
        source: source,
        paymentStatus: null,
        created_by: incident.created_by // display on it CRM who added the incidents
    });
    const incidentData = await incidentModel.save();
    return incidentData;
};

//func: to create id(random string)
const createId = (type, count) => {
    let result = "";
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const text = charset.charAt(Math.floor(Math.random() * charset.length));
    if (count < 9) {
        result = type.toUpperCase().substring(0, 3) + text + "0" + (count + 1);
    } else {
        result = type.toUpperCase().substring(0, 3) + text + (count + 1);
    }
    return result;
};

//func: to update service(crane/mechanic) status
exports.updateServiceStatus = async (incidentId, service, incidentStatus) => {
    // Here we are just updating incident values like push value in the services and remove from the available services
    // and update the incident status accordingly
    const result = await Incident.updateOne(
        { _id: incidentId },
        {
            $push: { service: service._id },
            $pull: { availServices: service._id },
            $set: { status: incidentStatus }
        }
    ).exec();
    //here we are increasing incidents count in the services which is assigned
    await Services.findByIdAndUpdate(
        { _id: service._id },
        { $inc: { incidents: 1 } }
    );
    return result;
};


//func: to update rep status
exports.updateRepsStatus = async (incidentId, data, incidentStatus) => {
    if (!data.representativeId) {
        // check if representative is in req.body
        const userExists = await User.findOne({
            $and: [
                { phone: data.phone },
                { type: "representative" },
                { isDeleted: false }
            ]
        });
        if (!_.isEmpty(userExists)) {
            const convertedJSON = JSON.parse(JSON.stringify(userExists));
            data.representativeId = convertedJSON._id.valueOf();
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                phone: data.phone,
                type: "representative",
                name: data.name,
                created_by:
                    data.hasOwnProperty("created_by") && data.created_by !== ""
                        ? data.created_by
                        : null,
                acceptTerms: true,
                location: {
                    address: data.address,
                    lat: data.lat,
                    lng: data.lng,
                    cityName: data.cityName,
                    stateName: data.stateName
                },
                isDeleted: false
            });
            const response = await user.save();
            const convertedJSON = JSON.parse(JSON.stringify(response));
            data.representativeId = convertedJSON._id.valueOf();
        }
    }
    const result = await Incident.updateOne(
        { _id: incidentId },
        {
            $push: {
                representative: data.representativeId.valueOf()
            },
            $pull: { availRepesentative: data.representativeId },
            $set: {
                status: incidentStatus
            }
        }
    ).exec();
    return result;
};


//new for showing available services
exports.updateAvailableServicesWithIncident = async incident => {
    const data = await Services.find({ isDeleted: false }).exec(); //get all services which are not deleted
    if (!_.isEmpty(data)) {
        console.log("ava serv");

        let result = getCoordsInDistance(data, incident, 20000, 20); //take services which is under 20KM radius
        console.log("result");

        if (result.length < 2) {
            result = getCoordsInDistance(data, incident, 50000, 50); //if services less than 2 then go for 50KM
        }
        if (result.length < 2) {
            result = getCoordsInDistance(data, incident, 200000, 200);
        }

        const sortServices = _.sortBy(result, res => res.distance); // sort by distance
        sortServices.map(async d => {
            await Incident.findOneAndUpdate(
                { _id: incident._id },
                { $push: { availServices: d._id } }
            );
        });
    }
    return true;
};

//new available representative
exports.updateAvailableRepsWithIncident = async incident => {
    const response = await User.find({
        $and: [{ type: "representative" }, { isDeleted: false }]
    }).exec(); //get all the representative
    if (!_.isEmpty(response)) {
        const data = response.filter(d => d.location.lat != null);
        let result = getCoordsInDistance(data, incident, 20000, 20); // get agents in 20KM
        if (result.length < 2) {
            result = getCoordsInDistance(data, incident, 50000, 50);
        }
        if (result.length < 2) {
            result = getCoordsInDistance(data, incident, 200000, 200);
        }
        const sortedReps = _.sortBy(result, res => res.distance); //sorted by distance
        let mobileNumber = [];
        _.each(sortedReps, async rep => {
            mobileNumber.push(rep.phone);
            await Incident.findOneAndUpdate(
                { _id: incident._id },
                { $push: { availRepesentative: rep._id } }
            );
        });
        const message = encodeURI(
            `${staticMsg.sendIncidentTORepresentative}  ${staticMsg.rootAgentLink}`
        );
        sendSms(mobileNumber, message);
    }
    return true;
};