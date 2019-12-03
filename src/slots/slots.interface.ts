import * as mongoose from 'mongoose';

export interface Slot extends mongoose.Document {
    slotName: String;
    slotPlayUrl: String;
    slotUrlDetails: String;
    slotDescription: String;
    slotLogo: String;
    slotLogoUrl: String;
    slotScreenshot: String;
    slotScreenshotUrl: String;
    slotSoftware: String;
    slotType: String;
    slotSpecialFeatures: Object;
    slotPaylines: String;
    slotReels: String;
    slotMinCoinPerLine: String;
    slotMaxCoinPerLine: String;
    slotMinCoinSize: String;
    slotMaxCoinSize: String;
    slotJackpot: String;
    slotRtp: String;
    slotBonusGame: String;
    slotProgressive: String;
    slotWildSymbol: String;
    slotScatterSymbol: String;
    slotAutoPlayOption: String;
    slotMultiplier: String;
    slotFreeSpins: String;
    slotCreated: Date;
}