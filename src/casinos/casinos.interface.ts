import * as mongoose from 'mongoose';

export interface Casino extends mongoose.Document {
    casinoName: String; ///
    casinoUrl: String; ///
    casinoUrlCustom: boolean;
    casinoUrlDetails: String;
    casinoPlayUrl: String,
    casinoWebsiteUrl: String; ///
    casinoLogo: String; ///
    casinoLogoBg: String; ///
    casinoThemeColor: String; ///
    casinoSpecs: Object; ///
    casinoScore: Number; ///
    casinoReputation: String; ///
    casinoLanguages: Object
    casinoLiveChat: String;
    casinoContact: Object; ///
    casinoOwner: String; ///
    casinoEstablished: String;
    casinoWithdrawalLimit: String;
    casinoLicensingAuthorities: Object;
    casinoBonusesUrl: String; // needed for scrape
    casinoRestrictedCountries: Object;
    casinoType: Object;
    casinoAffiliateProgram: Object;
    casinoAffiliateUsername: String;
    casinoAffiliatePassword: String;
    casinoRtp: String;
    casinoCurrencies: Object;
    casinoSoftwareProviders: Object;
    casinoDepositMethods: Object;
    casinoWithdrawalMethods: Object;
    casinoWithdrawalTimes: Object;
    casinoDescription: String; ///
    casinoMetaDescription: String;
    casinoFullDescription: String; ///
    casinoCreatedBy: String;
    casinoCreated: Date;
    casinoStatus: Boolean;
    casinoDraft: Boolean;
    casinoPublished: Boolean;
}