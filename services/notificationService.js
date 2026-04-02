import { admin, initializeFirebase } from '../config/firebaseConfig.js';

const getMessaging = () => {
  try {
    return admin.messaging();
  } catch {
    return null;
  }
};

const toStringValues = (data) =>
  Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]));

/**
 * Send to a list of FCM device tokens.
 * Returns an array of tokens that are no longer valid (to be removed from DB).
 */
const sendToTokens = async (tokens, notification, data = {}) => {
  if (!tokens || tokens.length === 0) return [];
  const messaging = getMessaging();
  if (!messaging) return [];

  try {
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification,
      data: toStringValues(data),
    });

    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });
    return invalidTokens;
  } catch (error) {
    console.error('[FCM] sendToTokens error:', error.message);
    return [];
  }
};

/**
 * Broadcast to a topic (e.g. "all_users", "all_vendors").
 */
const sendToTopic = async (topic, notification, data = {}) => {
  const messaging = getMessaging();
  if (!messaging) return;

  try {
    await messaging.send({
      topic,
      notification,
      data: toStringValues(data),
    });
  } catch (error) {
    console.error('[FCM] sendToTopic error:', error.message);
  }
};

const subscribeToTopic = async (tokens, topic) => {
  const messaging = getMessaging();
  if (!messaging || !tokens || tokens.length === 0) return;
  try {
    await messaging.subscribeToTopic(tokens, topic);
  } catch (error) {
    console.error('[FCM] subscribeToTopic error:', error.message);
  }
};

const unsubscribeFromTopic = async (tokens, topic) => {
  const messaging = getMessaging();
  if (!messaging || !tokens || tokens.length === 0) return;
  try {
    await messaging.unsubscribeFromTopic(tokens, topic);
  } catch (error) {
    console.error('[FCM] unsubscribeFromTopic error:', error.message);
  }
};

export { sendToTokens, sendToTopic, subscribeToTopic, unsubscribeFromTopic };
