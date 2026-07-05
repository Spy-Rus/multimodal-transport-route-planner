import mongoose from "mongoose";

const metroRouteSchema = new mongoose.Schema({
  name: String,
  line: String,
  stations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MetroStation"
    }
  ]
});



export default mongoose.model("MetroRoute", metroRouteSchema);