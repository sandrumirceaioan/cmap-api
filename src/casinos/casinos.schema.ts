import * as mongoose from 'mongoose';
import * as beautifyUnique from 'mongoose-beautiful-unique-validation';

export const CasinosSchema = new mongoose.Schema({
    // casino.guru
    casinoName: String,
    casinoUrlDetails: String, // to be used and removed
    casinoUrlVisit: String, 
    casinoUrlBonus: String, // to be used and replaced
    casinoLogo: String,
    casinoSpecs: { positives: [], negatives: [], interesting: [] },
    casinoScore: [], // new collection same as casinoReviews
    casinoVotes: { up: Number, down: Number },
    casinoReputation: String, // bad, acceptable, good, very-good, perfect
    // casino.guru details
    casinoVpnUsage: Boolean,
    casinoLanguages: [],
    casinoChatLanguages: [],
    casinoEmailLanguages: [],
    casinoOwner: String,
    casinoEstablished: String,
    casinoWithdrawallimit: String,
    casinoLicensingAuthorities: [], // {authority: 'Country', authorityRating: 'same as casinoRepotation' }
    casinoRelated: [], // same management { casinoName, casinoId, casinoUrlDetails }
    // askgamblers
    casinoBonuses: [], // new collection
    casinoProviders: [], // new collection
    casinoRestrictedCountries: [],
    casinoType: String,
    casinoRtp: String,
    casinoContact: { email: String, phone: String },
    casinoReviews: [], // new collection
    casinoComplaints: [], // new collection
    casinoNews: [], // new collection
    casinoSlots: [], // new collection
    casinoDescription: String,
    casinoCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});

CasinosSchema.plugin(beautifyUnique);