import * as mongoose from 'mongoose';
import { logicalExpression } from '@babel/types';

export const ProvidersSchema = new mongoose.Schema({
    providerName: String,
    providerWebsite: String,
    providerLogo: {
        type: String,
        default: 'provider-logo.png'
    },
    providerCreatedBy: String,
    providerCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});