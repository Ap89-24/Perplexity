import mongoose from "mongoose";
const { Schema, model } = mongoose;

const messageSchema = new Schema({
  chat: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ["user", "AI"],
    required: true,
    default: "user"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

messageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const messageModel = model("Message", messageSchema);

export default messageModel;
