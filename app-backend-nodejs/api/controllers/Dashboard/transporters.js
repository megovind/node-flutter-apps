const User = require("../../models/Users");

module.exports.monthWiseTransporters = async () => {
  const data = await User.aggregate([
    { $match: { type: "transporter" } },
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

module.exports.dayWiseTransporters = async () => {
  const data = await User.aggregate([
    { $match: { type: "transporter" } },
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
