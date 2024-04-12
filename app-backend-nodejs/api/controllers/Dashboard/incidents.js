const Incident = require("../../models/Incident");

module.exports.monthWiseIncidents = async () => {
  const data = await Incident.aggregate([
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

module.exports.dayWiseIncidents = async () => {
  const data = await Incident.aggregate([
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
