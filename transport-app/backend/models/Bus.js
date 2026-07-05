import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  routeNumber: {
    type: String,
    required: true
  },
  stops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true
    }
  ]
});

export default mongoose.model("Bus", busSchema);