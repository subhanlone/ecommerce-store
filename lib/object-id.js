import mongoose from "mongoose";

export function isValidObjectId(value) {
  return mongoose.isObjectIdOrHexString(value);
}
