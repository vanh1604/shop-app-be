import Vendor from "../models/vendor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const vendorSignUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Vendor with same email already exist !" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const vendor = new Vendor({ fullName, email, password: hashedPassword });
      await vendor.save();
      res.json({ vendor });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const vendorSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findVendor = await Vendor.findOne({ email });
    if (findVendor) {
      const isMatched = await bcrypt.compare(password, findVendor.password);
      if (!isMatched) {
        return res.status(400).json({ message: "Incorrect Password" });
      } else {
        const token = jwt.sign({ id: findVendor._id }, "PasswordKey");
        const { password, ...vendorWithoutPassword } = findVendor._doc;
        return res.json({
          message: "Login successfully",
          user: vendorWithoutPassword,
          token: token,
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Vendor not found with this emal" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { vendorSignUp, vendorSignIn };
