import mongoose from "mongoose";

const bannerSchema = mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
});

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;