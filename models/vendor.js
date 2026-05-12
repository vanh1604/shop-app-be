import mongoose from "mongoose";

const vendorSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => {
        const result =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return result.test(value);
      },
      message: "Please enter a valid email address",
    },
  },
  province: {
    type: String,
    default: "",
  },
  district: {
    type: String,
    default: "",
  },
  ward: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "vendor",
  },
  storeName: {
    type: String,
    required: true,
  },
  storeImage: {
    type: String,
    required: true,
  },
  storeDescription: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return value.length >= 8;
      },
      message: "Password must be least 8 characters long",
    },
  },
  refreshToken: {
    type: String,
    default: null,
  },
  fcmTokens: {
    type: [String],
    default: [],
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
