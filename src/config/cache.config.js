const NodeCache = require('node-cache');

const searchCache = new NodeCache({ 
  stdTTL: 18000, 
  checkperiod: 600 
});

module.exports = searchCache;