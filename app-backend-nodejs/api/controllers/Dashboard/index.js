const mongoose = require("mongoose");
const _ = require("lodash");

const Incident = require("../../models/Incident");
const Truck = require("../../models/Truck");
const User = require("../../models/Users");
const Services = require("../../models/Services");

const { monthWiseIncidents, dayWiseIncidents } = require("./incidents");
const { monthWiseTrucks, dayWiseTrucks } = require("./trucks");
const {
  monthWiseCranes,
  dayWiseCranes,
  monthWiseMechanics,
  dayWiseMechanics
} = require("./services");
const {
  monthWiseTransporters,
  dayWiseTransporters
} = require("./transporters");

exports.incidentStatistics = async (req, res, next) => {
  try {
    const dayWise = await dayWiseIncidents();
    const monthWise = await monthWiseIncidents();
    const dataCnt = await dataCount();
    const dayWiseCrans = await dayWiseCranes();
    const monthWiseCrans = await monthWiseCranes();
    const dayWiseMechnics = await dayWiseMechanics();
    const monthWiseMechnics = await monthWiseMechanics();
    const dayWiseTrcks = await dayWiseTrucks();
    const monthWiseTrcks = await monthWiseTrucks();
    const dayWiseTrptrs = await dayWiseTransporters();
    const monthWiseTrptrs = await monthWiseTransporters();

    return res.send({
      status: "SUCCESS",
      data: dataCnt,
      response: {
        dayWiseIncidents: dayWise,
        monthWiseIncidents: monthWise,
        dayWiseCranes: dayWiseCrans,
        monthWiseCranes: monthWiseCrans,
        dayWiseMechanics: dayWiseMechnics,
        monthWiseMechanics: monthWiseMechnics,
        dayWiseTrucks: dayWiseTrcks,
        monthWiseTrucks: monthWiseTrcks,
        dayWiseTransporters: dayWiseTrptrs,
        monthWiseTransporters: monthWiseTrptrs
      }
    });
  } catch (error) {
    return res.send({
      status: "ERROR",
      message: error.message
    });
  }
};

const dataCount = async () => {
  const totalIncidents = await Incident.countDocuments();
  const totalTransporters = await User.countDocuments({
    $and: [{ type: "transporter" }, { isDeleted: false }]
  });
  const totalMechanics = await Services.countDocuments({
    $and: [{ serviceType: "mechanic" }, { isDeleted: false }]
  });
  const totalCranes = await Services.countDocuments({
    $and: [{ serviceType: "crane" }, { isDeleted: false }]
  });
  const totalAgents = await User.countDocuments({
    $and: [{ type: "representative" }, { isDeleted: false }]
  });
  const totalTrucks = await Truck.countDocuments();
  const count = [
    {
      for: "Cases",
      label: "Cases Registered Till Now",
      count: totalIncidents ? totalIncidents : 0
    },
    {
      for: "Trucks",
      label: "Registered with root",
      count: totalTrucks ? totalTrucks : 0
    },
    {
      for: "Transporters",
      label: "Registered Till Now",
      count: totalTransporters ? totalTransporters : 0
    },
    {
      for: "Mechanics",
      label: "Keep Increasing",
      count: totalMechanics ? totalMechanics : 0
    },
    {
      for: "Cranes",
      label: "Keep Increasing",
      count: totalCranes ? totalCranes : 0
    },
    {
      for: "Agents",
      label: "Working with root",
      count: totalAgents ? totalAgents : 0
    }
  ];
  return count;
};
