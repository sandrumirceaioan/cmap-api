import * as mongoose from 'mongoose';

export interface PaymentMethod extends mongoose.Document {
    paymentMethodName: String;
    paymentMethodWebsite: String;
    paymentMethodLogo: String;
    paymentMethodCreated: Date;
}