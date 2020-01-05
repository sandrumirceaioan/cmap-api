import * as mongoose from 'mongoose';

export interface Country extends mongoose.Document {
    countryName: String,
    countryCode: String,
    countryFlag: String,
    countryCreatedBy: String,
    countryCreated: Date
}