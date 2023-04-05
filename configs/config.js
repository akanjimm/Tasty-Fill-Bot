require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 4000,
    HOST: process.env.HOST,
    MONGO_DB_CONNECTION_URL: process.env.MONGO_DB_CONNECTION_URL,
    DB_NAME: process.env.DB_NAME,
    COLLECTION_NAME: process.env.COLLECTION_NAME,
    COOKIE_MAX_AGE: process.env.COOKIE_MAX_AGE,
    SESSION_SECRET: process.env.SESSION_SECRET
}