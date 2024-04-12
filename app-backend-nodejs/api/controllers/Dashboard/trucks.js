const Truck = require("../../models/Truck");

module.exports.monthWiseTrucks = async () => {
  const data = await Truck.aggregate([
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

module.exports.dayWiseTrucks = async () => {
  const data = await Truck.aggregate([
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
