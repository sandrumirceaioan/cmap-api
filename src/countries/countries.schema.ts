import * as mongoose from 'mongoose';

export const CountriesSchema = new mongoose.Schema({
    countryName: String,
    countryCode: String,
    countryFlag: String,
    countryCreatedBy: String,
    countryCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});