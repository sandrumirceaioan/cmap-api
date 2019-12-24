import * as mongoose from 'mongoose';

export interface Casino extends mongoose.Document {
    casinoName: String; // +++
    casinoUrl: String; // +++
    casinoUrlDetails: String; // +++
    casinoPlayUrl: String,
    casinoWebsiteUrl: String; // +++
    casinoLogo: String; // +++
    casinoLogoBg: String; // +++
    casinoSpecs: Object; // +++
    casinoScore: Number;
    casinoReputation: String;
    casinoLanguages: Object
    casinoLiveChat: String;
    casinoContact: Object; // +++
    casinoOwner: String; // +++
    casinoEstablished: String;
    casinoWithdrawalLimit: String;
    casinoLicensingAuthorities: Object;
    casinoBonusesUrl: String;
    casinoRestrictedCountries: Object;
    casinoType: Object;
    casinoAffiliateProgram: Object;
    casinoRtp: String;
    casinoCurrencies: Object;
    casinoSoftwareProviders: Object;
    casinoDepositMethods: Object;
    casinoWithdrawalMethods: Object;
    casinoWithdrawalTimes: Object;
    // casinoBonuses: [],
    // casinoReviews: [], // new collection
    // casinoComplaints: [], // new collection
    // casinoNews: [], // new collection
    // casinoSlots: [], // new collection
    casinoDescription: String; // +++
    casinoFullDescription: String; // +++
    casinoCreated: Date;
    casinoStatus: Boolean;
    casinoPublished: Boolean;
}