import * as mongoose from 'mongoose';

export const CasinosSchema = new mongoose.Schema({
    // casino.guru
    casinoName: String,
    casinoUrlDetails: String,
    casinoPlayUrl: String, // MANUAL AFFILIATE URLS
    casinoWebsiteUrl: String,
    casinoLogo: String,
    casinoSpecs: { positives: [], negatives: [] },
    casinoScore: String,
    casinoReputation: String,
    casinoLanguages: [],
    casinoLiveChat: String,
    casinoContact: { email: String, phone: String },
    casinoOwner: String,
    casinoEstablished: String,
    casinoWithdrawalLimit: String,
    casinoLicensingAuthorities: [],
    casinoBonusesUrl: String, // TO BE SCRAPED LATER
    // casinoBonuses: [],
    casinoRestrictedCountries: [],
    casinoType: String,
    casinoAffiliateProgram: { name: String, url: String }, // TO BE SCRAPPED LATER
    casinoRtp: String,
    casinoCurrencies: [],
    casinoSoftwareProviders: [], // TO BE SCRAPPED LATER
    casinoDepositMethods: [],
    casinoWithdrawalMethods: [],
    // casinoWithdrawalTimes: [],
    // casinoReviews: [], // new collection
    // casinoComplaints: [], // new collection
    // casinoNews: [], // new collection
    // casinoSlots: [], // new collection
    // casinoDescription: String,
    casinoCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});