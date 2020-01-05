import * as mongoose from 'mongoose';

export interface Provider extends mongoose.Document {
    providerName: String;
    providerWebsite: String;
    providerLogo: String;
    providerCreatedBy: String;
    providerCreated: Date;
}