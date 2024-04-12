const _ = require("lodash");

const User = require("../../../models/Users");
const Incident = require("../../../models/Incident");
const Truck = require("../../../models/Truck");
const serviceProvider = require("../../../models/ServiceProvider");
const Services = require("../../../models/Services");

exports.getUser = (req, res, next) => {
  User.findOne({ $and: [{ _id: req.params.userId }, { isDeleted: false }] })
    .exec()
    .then(async response => {
      if (!_.isEmpty(response)) {
        response = JSON.parse(JSON.stringify(response));
        // if type is transporter, then show total number of trucks
        // total number of case
        if (response.type === "transporter") {
          let totalCases = await Incident.find({ owner: response._id })
            .countDocuments()
            .exec();
          let totalTrucks = await Truck.find({ owner: response._id })
            .countDocuments()
            .exec();
          response.totalCases = totalCases;
          response.totalTrucks = totalTrucks;

          response.cases = await Incident.find({ owner: response._id })
            .select("_id caseId location created_at status")
            .exec();

          response.trucks = await Truck.find({ owner: response._id })
            .select("_id regNo truckModel created_at incidents")
            .exec();
        }

        //if type is representative, then show total number of cases handled
        if (response.type === "representative") {
          let totalCasesHandled = await Incident.find({
            representative: { $in: [response._id] }
          })
            .countDocuments()
            .exec();
          response.totalCases = totalCasesHandled;
          response.cases = await Incident.find({
            representative: { $in: [response._id] }
          })
            .populate("specialization", "_id type")
            .exec();
        }

        return res.send({
          status: "SUCCESS",
          response: response
        });
      }
      return res.send({
        status: "NOT_FOUND",
        message: "No Users Found"
      });
    })
    .catch(error => {
      return res.send({
        status: "ERROR",
        message: error.message
      });
    });
};

exports.editUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          name: req.body.name,
          organization: req.body.organization,
          image: req.body.imageUrl,
          updated_at: new Date()
        }
      }
    ).exec();

    if (_.isEmpty(user)) {
      return res.send({
        status: "NOT_FOUND",
        message: "User not found"
      });
    }
    return res.send({
      status: "SUCCESS",
      message: "User Updated Successfully",
      response: user
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

//drivers data only
exports.getDriversForDashboard = async (req, res, next) => {
  try {
    let startDate = "";
    let endDate = "";
    const query = req.query.q;
    if (req.params.all === "false") {
      //start date
      const start = new Date(req.params.start_date);
      start.setHours(23, 59, 59, 999);
      //end date
      const end = new Date(req.params.end_date);
      end.setHours(00, 00, 00, 000);
      //formating in exact start date
      startDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        05,
        30,
        00
      ).toISOString();
      //formatting in exact end date
      endDate = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        29,
        29,
        59
      ).toISOString();
    }
    const all = req.params.all === "false" ? false : true;
    let response;
    if (query) {
      response = all ? await User.find({
        $or: [{ "location.cityName": { $regex: query } }, { "location.stateName": { $regex: query } }, { needed_help: { $regex: query } },]
      }
      ).exec() : await User.find({
        $or: [{ "location.cityName": { $regex: query } }, { "location.stateName": { $regex: query } }, { needed_help: { $regex: query } }, {
          $and: [{
            created_at: {
              $gte: startDate,
              $lt: endDate
            }
          }]
        }]
      });
    } else {
      response = all ? await User.find().exec() : await User.find({
        $and: [{
          created_at: {
            $gte: startDate,
            $lt: endDate
          }
        }]
      });
    }



    if (_.isEmpty(response)) {
      return res.send({ status: "ERROR", message: "Data Not Found!" });
    }
    return res.send({ status: "SUCCESS", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
}


//to edit user status
exports.editUserStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const response = await User.findByIdAndUpdate({ _id: id }, { $set: { logged_in: req.body.status, verified: req.body.verified } }).exec();
    if (_.isEmpty(response)) {
      return res.send({ status: "ERROR", message: "Something went wrong, Please check" });
    }
    return res.send({ status: "SUCCESS", message: "Details updated successfully", response });
  } catch (error) {
    return res.send({ status: "ERROR", message: error.message });
  }
}

// get service provider
exports.getServiceProvider = (req, res, next) => {
  serviceProvider
    .findOne({ $and: [{ _id: req.params.userId }, { isDeleted: false }] })
    .exec()
    .then(async response => {
      if (!_.isEmpty(response)) {
        response = JSON.parse(JSON.stringify(response));
        let service = await Services.findOne({
          $and: [
            { serviceType: response.type },
            { ownerNumber: response.phone }
          ]
        }).exec();
        let totalCasesHandled = await Incident.find({
          service: { $in: [service._id] }
        })
          .countDocuments()
          .exec();
        response.totalCasesHandled = totalCasesHandled;
        response.case = await Incident.find({ service: { $in: [service._id] } })
          .populate("specialization", "_id type")
          .exec();
        return res.status(200).json({
          status: "SUCCESS",
          response: response
        });
      }
      return res.send({
        status: "NOT_FOUND",
        message: "No Users Found"
      });
    })
    .catch(error => {
      res.status(500).json({
        status: "INTERNAL_SERVER",
        message: error.message
      });
    });
};

