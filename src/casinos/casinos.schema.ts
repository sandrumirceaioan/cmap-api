import * as mongoose from 'mongoose';

export const CasinosSchema = new mongoose.Schema({
    casinoName: String,
    casinoUrl: String,
    casinoUrlCustom: {
        type: Boolean,
        default: false
    },
    casinoUrlDetails: String,
    casinoPlayUrl: String, // MANUAL AFFILIATE URLS
    casinoTermsUrl: String,
    casinoWebsiteUrl: String,
    casinoLogo: String,
    casinoLogoBg: String,
    casinoThemeColor: String,
    casinoSpecs: { positives: [], negatives: [] },
    casinoScore: Number,
    casinoReputation: String,
    casinoLanguages: [],
    casinoLiveChat: String,
    casinoContact: { email: String, phone: String },
    casinoOwner: String,
    casinoEstablished: String,
    casinoWithdrawalLimit: String,
    casinoLicensingAuthorities: [],
    casinoBonusesUrl: String, // TO BE SCRAPED LATER
    casinoRestrictedCountries: [],
    casinoType: [],
    casinoAffiliateProgram: { name: String, url: String }, // TO BE SCRAPPED LATER
    casinoAffiliateUsername: String,
    casinoAffiliatePassword: String,
    casinoRtp: String,
    casinoCurrencies: [],
    casinoSoftwareProviders: [], // TO BE SCRAPPED LATER
    casinoDepositMethods: [],
    casinoWithdrawalMethods: [],
    casinoWithdrawalTimes: [],
    casinoDescription: String,
    casinoMetaDescription: String,
    casinoFullDescription: String,
    casinoCreatedBy: String,
    casinoCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    },
    casinoStatus: Boolean,
    casinoDraft: Boolean,
    casinoPublished: Boolean
});

CasinosSchema.index({_id: 1, casinoName: 1, casinoUrl: 1}, {unique: true});