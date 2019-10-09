import * as mongoose from 'mongoose';

export interface Casino extends mongoose.Document {
    casinoName: String;
    casinoUrlDetails: String;
    casinoUrlVisit: String; 
    casinoUrlBonus: String;
    casinoLogo: String;
    casinoSpecs: Object;
    casinoScore: String;
    casinoVotes: Object;
    casinoReputation: String;
    casinoVpnUsage: Boolean;
    casinoLanguages: Object;
    casinoChatLanguages: Object;
    casinoEmailLanguages: Object;
    casinoOwner: Object;
    casinoEstablished: Object;
    casinoWithdrawallimit: Object;
    casinoLicensingAuthorities: Object;
    casinoRelated: Object;
    casinoBonuses: Object;
    casinoProviders: Object;
    casinoRestrictedCountries: Object;
    casinoType: String;
    casinoRtp: String;
    casinoContact: Object;
    casinoReviews: [];
    casinoComplaints: [];
    casinoNews: [];
    casinoSlots: [];
    casinoDescription: String,
    casinoCreated: Date;
}