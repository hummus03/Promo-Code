const { Shopify } = require('@shopify/shopify-api');
const logger = require('../utils/logger');

const webhookHandlers = {
  ORDERS_PAID: {
    path: '/api/webhooks/orders/paid',
    callback: async (topic, shop, body) => {
      const order = JSON.parse(body);
      logger.info(`Order paid webhook received for shop ${shop}`, { orderId: order.id });
      // Add logic to handle paid orders
    },
  },
  
  APP_UNINSTALLED: {
    path: '/api/webhooks/app/uninstalled',
    callback: async (topic, shop, body) => {
      logger.info(`App uninstalled from shop ${shop}`);
      // Clean up shop data when app is uninstalled
    },
  }
};

module.exports = webhookHandlers; 