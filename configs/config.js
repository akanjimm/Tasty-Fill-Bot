require('dotenv').config();

let nodeEnv = process.env.NODE_ENV;

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 3000,
    HOST: (nodeEnv === "development") ? process.env.HOST_DEV : process.env.HOST_PROD,
    MONGO_DB_CONNECTION_URL: (nodeEnv === "development") ? process.env.MONGO_DB_CONNECTION_URL_DEV : process.env.MONGO_DB_CONNECTION_URL_PROD
}