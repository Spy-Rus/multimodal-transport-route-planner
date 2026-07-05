import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: Number,
  lng: Number
});

export default mongoose.model("Stop", stopSchema);