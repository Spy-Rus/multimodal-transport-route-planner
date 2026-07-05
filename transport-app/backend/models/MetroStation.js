import mongoose from "mongoose";

const metroStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lat: Number,
  lng: Number,
  line: String // e.g. "Purple Line"
});

export default mongoose.model("MetroStation", metroStationSchema);