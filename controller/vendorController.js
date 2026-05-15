import Vendor from "../models/vendor.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendToTopic } from "../services/notificationService.js";
const vendorSignUp = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      storeName,
      storeImage,
      storeDescription,
    } = req.body;
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Vendor with same email already exist !" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const vendor = new Vendor({
        fullName,
        email,
        password: hashedPassword,
        storeName,
        storeImage,
        storeDescription,
      });
      await vendor.save();

      // Notify all customers about the new store (fire-and-forget)
      sendToTopic(
        'all_users',
        {
          title: '🏪 Cửa hàng mới!',
          body: `'${storeName}' vừa tham gia nền tảng`,
        },
        { type: 'new_store', vendorId: vendor._id.toString() }
      ).catch((e) => console.error('[FCM] vendorSignUp notify error:', e.message));

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
        const token = jwt.sign({ id: findVendor._id }, process.env.JWT_SECRET);
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

const updateVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the authenticated vendor is updating their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        message: "Access denied. You can only update your own profile.",
      });
    }

    const {
      fullName,
      number,
      province,
      district,
      ward,
      address,
      storeName,
      storeImage,
      storeDescription,
    } = req.body;

    // Check if phone number is already in use by another vendor or user
    if (number) {
      const existingVendor = await Vendor.findOne({ number, _id: { $ne: id } });
      const existingUser = await User.findOne({ number });
      if (existingVendor || existingUser) {
        return res
          .status(400)
          .json({ message: "Phone number already in use by another account" });
      }
    }

    const updateData = { $set: {} };

    if (fullName !== undefined) updateData.$set.fullName = fullName;
    if (number !== undefined) updateData.$set.number = number;
    if (province !== undefined) updateData.$set.province = province;
    if (district !== undefined) updateData.$set.district = district;
    if (ward !== undefined) updateData.$set.ward = ward;
    if (address !== undefined) updateData.$set.address = address;
    if (storeName !== undefined) updateData.$set.storeName = storeName;
    if (storeImage !== undefined) updateData.$set.storeImage = storeImage;
    if (storeDescription !== undefined)
      updateData.$set.storeDescription = storeDescription;

    const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.status(200).json({ vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");
    res.status(200).json({ vendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVendorsStore = async (req, res) => {
  try {
    const vendors = await Vendor.find().select(
      "storeName storeImage storeDescription",
    );
    res.status(200).json({ vendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  vendorSignUp,
  vendorSignIn,
  getVendors,
  getAllVendorsStore,
  updateVendorProfile,
};
