import * as mongoose from 'mongoose';

export interface Casino extends mongoose.Document {
    casinoName: String;
    casinoUrlDetails: String;
    casinoPlayUrl: String, // MANUAL AFFILIATE URLS
    casinoWebsiteUrl: String;
    casinoLogo: String;
    casinoSpecs: Object;
    casinoScore: String;
    casinoReputation: String;
    casinoLanguages: Object
    casinoLiveChat: String;
    casinoContact: Object;
    casinoOwner: String;
    casinoEstablished: String;
    casinoWithdrawalLimit: String;
    casinoLicensingAuthorities: Object;
    casinoBonusesUrl: String; // TO BE SCRAPED LATER
    // casinoBonuses: [],
    casinoRestrictedCountries: Object;
    casinoType: Object;
    casinoAffiliateProgram: Object; // TO BE SCRAPPED LATER
    casinoRtp: String;
    casinoCurrencies: Object;
    casinoSoftwareProviders: Object; // TO BE SCRAPPED LATER
    casinoDepositMethods: Object;
    casinoWithdrawalMethods: Object;
    casinoWithdrawalTimes: Object;
    // casinoReviews: [], // new collection
    // casinoComplaints: [], // new collection
    // casinoNews: [], // new collection
    // casinoSlots: [], // new collection
    // casinoDescription: String,
    casinoCreated: Date;
    casinoClosed: Boolean;
}