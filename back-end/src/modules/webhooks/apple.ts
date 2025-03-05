import { Router } from 'express';
import { verifyJWS } from '../../utils/jwsVerify';
import { processAppleNotification } from './appleService';
import Logger from '../../utils/Logger';

const router = Router();

/**
 * Apple App Store Server Notifications webhook endpoint
 * Receives and processes notifications from Apple
 */
router.post('/', async (req, res) => {
  try {
    const { signedPayload } = req.body;
    
    if (!signedPayload) {
      Logger.error('Missing signedPayload in Apple webhook request');
      return res.status(400).json({ error: 'Missing signedPayload' });
    }

    // Verify and decode the signed payload
    const notification = await verifyJWS(signedPayload);
    
    // Process the notification asynchronously
    // We don't await this to respond quickly to Apple
    processAppleNotification(notification)
      .catch(error => {
        Logger.error('Error in async notification processing:', error);
      });
    
    // Respond to Apple immediately with 200 OK
    res.status(200).send();
  } catch (error: any) {
    Logger.error('Error processing Apple webhook:', error);
    // Always return 200 to Apple to prevent retries
    // Apple expects a 200 response regardless of our internal processing
    res.status(200).send();
  }
});

export default router;
