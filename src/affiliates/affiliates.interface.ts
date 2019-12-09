import * as mongoose from 'mongoose';

export interface Affiliate extends mongoose.Document {
    affiliateName: String;
    affiliateDescription: String;
    affiliateUrl: String;
    affiliateScore: Number;
    affiliateLogo: String;
    affiliateSpecs: Object;
    affiliateSoftware: String;
    affiliateWebsite: String;
    affiliateRevenueShare: String;
    affiliateSubaffiliates: String;
    affiliateCookieDuration: String;
    affiliateNegativeCarryover: String;
    affiliateBundling: String;
    affiliateAdminFee: String;
    affiliatePaymentDate: String;
    affiliateMinimumEwallets: String;
    affiliateMinimumBankWire: String;
    affiliatePaymentMethods: String;
    affiliateCurrencies: Object;
    affiliateWithdrawalLimit: String;
    affiliateCreated: Date;
    affiliateStatus: Boolean;
    affiliatePublished: Boolean;
}