import * as mongoose from 'mongoose';

export const SlotsSchema = new mongoose.Schema({
    slotName: String,
    slotPlayUrl: String,
    slotUrlDetails: String,
    slotDescription: String,
    slotLogo: String,
    slotLogoUrl: String,
    slotScreenshot: String,
    slotScreenshotUrl: String,
    slotSoftware: String,
    slotType: String,
    slotSpecialFeatures: [],
    slotPaylines: String,
    slotReels: String,
    slotMinCoinPerLine: String,
    slotMaxCoinPerLine: String,
    slotMinCoinSize: String,
    slotMaxCoinSize: String,
    slotJackpot: String,
    slotRtp: String,
    slotBonusGame: String,
    slotProgressive: String,
    slotWildSymbol: String,
    slotScatterSymbol: String,
    slotAutoPlayOption: String,
    slotMultiplier: String,
    slotFreeSpins: String,
    bonusCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});