import * as mongoose from 'mongoose';

export const PaymentMethodsSchema = new mongoose.Schema({
    paymentMethodName: String,
    paymentMethodWebsite: String,
    paymentMethodLogo: {
        type: String,
        default: 'payment-logo.png'
    },
    paymentMethodCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});