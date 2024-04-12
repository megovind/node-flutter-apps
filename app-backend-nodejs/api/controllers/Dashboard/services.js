const Services = require("../../models/Services");

module.exports.monthWiseCranes = async () => {
  const data = await Services.aggregate([
    { $match: { serviceType: "crane" } },
    {
      $project: {
        year: { $year: "$created_at" },
        month: { $month: "$created_at" }
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        count: {
          $sum: 1
        }
      }
    }
  ]);
  return data;
};

module.exports.dayWiseCranes = async () => {
  const data = await Services.aggregate([
    { $match: { serviceType: "crane" } },
    {
      $project: {
        year: { $year: "$created_at" },
        month: { $month: "$created_at" },
        day: { $dayOfMonth: "$created_at" }
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month", day: "$day" },
        count: {
          $sum: 1
        }
      }
    }
  ]);
  return data;
};

module.exports.monthWiseMechanics = async () => {
  const data = await Services.aggregate([
    { $match: { serviceType: "mechanic" } },
    {
      $project: {
        year: { $year: "$created_at" },
        month: { $month: "$created_at" }
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        count: {
          $sum: 1
        }
      }
    }
  ]);
  return data;
};

module.exports.dayWiseMechanics = async () => {
  const data = await Services.aggregate([
    { $match: { serviceType: "mechanic" } },
    {
      $project: {
        year: { $year: "$created_at" },
        month: { $month: "$created_at" },
        day: { $dayOfMonth: "$created_at" }
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month", day: "$day" },
        count: {
          $sum: 1
        }
      }
    }
  ]);
  return data;
};
