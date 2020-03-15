import * as mongoose from 'mongoose';

export const BonusesSchema = new mongoose.Schema({
    bonusCasino: String,
    bonusCasinoName: String,
    bonusName: String,
    bonusTerms: String,
    bonusUrl: String,
    bonusType: String,
    bonusMinDeposit: String,
    bonusWageringRequirements: String,
    bonusMaxAmount: String,
    bonusValue: String,
    bonusExclusive: String,
    bonusRestrictedCountries: [],
    bonusAllowedCountries: [],
    bonusCashable: String,
    bonusAllowedGames: [],
    bonusInformation: String,
    bonusCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    },
    bonusStatus: Boolean,
    bonusPublished: Boolean
});