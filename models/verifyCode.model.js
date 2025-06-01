const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verifyCodeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7200, // 2 hours
  },
});

module.exports = mongoose.model("VerifyCode", verifyCodeSchema);
