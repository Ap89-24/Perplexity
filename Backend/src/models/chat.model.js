import mongoose from "mongoose";
const { Schema, model } = mongoose;

const chatSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    default: "New Chat",
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

chatSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const chatModel = model("Chat", chatSchema);

export default chatModel;
