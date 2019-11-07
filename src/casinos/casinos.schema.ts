import * as mongoose from 'mongoose';

export const CasinosSchema = new mongoose.Schema({
    // casino.guru
    casinoName: String,
    casinoUrlDetails: String, // to be used and removed
    casinoPlayUrl: String,
    casinoLogo: String,
    casinoSpecs: { positives: [], negatives: [] },
    casinoScore: String,
    // casinoVotes: { up: Number, down: Number },
    casinoReputation: String, // bad, acceptable, good, very-good, perfect
    // // casino.guru details
    // casinoVpnUsage: Boolean,
    // casinoLanguages: [],
    // casinoChatLanguages: [],
    // casinoEmailLanguages: [],
    // casinoOwner: String,
    // casinoEstablished: String,
    // casinoWithdrawallimit: String,
    // casinoLicensingAuthorities: [], // {authority: 'Country', authorityRating: 'same as casinoRepotation' }
    // casinoRelated: [], // same management { casinoName, casinoId, casinoUrlDetails }
    // // askgamblers
    casinoBonusesUrl: String,
    // casinoBonuses: [], // new collection
    // casinoProviders: [], // new collection
    // casinoRestrictedCountries: [],
    // casinoType: String,
    // casinoRtp: String,
    // casinoContact: { email: String, phone: String },
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