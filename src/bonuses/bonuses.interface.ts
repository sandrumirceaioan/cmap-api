import * as mongoose from 'mongoose';

export interface Bonus extends mongoose.Document {
    bonusCasino: String;
    bonusName: String;
    bonusTerms: String;
    bonusUrl: String;
    bonusType: String;
    bonusMinDeposit: String;
    bonusWageringRequirements: String;
    bonusAmount: String;
    bonusValue: String;
    bonusExclusive: String;
    bonusRestrictedCountries: Object;
    bonusAllowedCountries: Object;
    bonusCashable: String;
    bonusAllowedGames: Object;
    bonusInformation: String;
    bonusCreated: Date;
    bonusStatus: Boolean;
    bonusPublished: Boolean;
}