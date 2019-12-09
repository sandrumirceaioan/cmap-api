import * as mongoose from 'mongoose';

export const AffiliatesSchema = new mongoose.Schema({
    affiliateName: String,
    affiliateDescription: String,
    affiliateUrl: String,
    affiliateScore: Number,
    affiliateLogo: String,
    affiliateSpecs: Object,
    affiliateSoftware: String,
    affiliateWebsite: String,
    affiliateRevenueShare: String,
    affiliateSubaffiliates: String,
    affiliateCookieDuration: String,
    affiliateNegativeCarryover: String,
    affiliateBundling: String,
    affiliateAdminFee: String,
    affiliatePaymentDate: String,
    affiliateMinimumEwallets: String,
    affiliateMinimumBankWire: String,
    affiliatePaymentMethods: String,
    affiliateCurrencies: Object,
    affiliateWithdrawalLimit: String,
    affiliateCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    },
    affiliateStatus: Boolean,
    affiliatePublished: Boolean
});