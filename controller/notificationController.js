import User from '../models/user.js';
import Vendor from '../models/vendor.js';
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from '../services/notificationService.js';

const registerToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'FCM token is required' });
  }

  try {
    const isVendor = req.user.role === 'vendor';
    const Model = isVendor ? Vendor : User;
    const topic = isVendor ? 'all_vendors' : 'all_users';

    await Model.findByIdAndUpdate(req.user._id, {
      $addToSet: { fcmTokens: token },
    });

    await subscribeToTopic([token], topic);

    return res.status(200).json({ message: 'Token registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'FCM token is required' });
  }

  try {
    const isVendor = req.user.role === 'vendor';
    const Model = isVendor ? Vendor : User;

    await Model.findByIdAndUpdate(req.user._id, {
      $pull: { fcmTokens: token },
    });

    // Unsubscribe from both topics to be safe
    await unsubscribeFromTopic([token], 'all_users');
    await unsubscribeFromTopic([token], 'all_vendors');

    return res.status(200).json({ message: 'Token removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { registerToken, removeToken };
