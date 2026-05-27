import Banner from "../models/banner.js";

const createBanner = async (req, res) => {
    try {
        const { image } = req.body;
        const banner = new Banner({ image });
        await banner.save();
        res.status(201).json({ banner });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBanner = async (req, res) => {
    try {
        const banner = await Banner.find();
        res.status(200).json({ banner });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByIdAndDelete(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }
        res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { createBanner, getBanner, deleteBanner };