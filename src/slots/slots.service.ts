import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slot } from './slots.interface';
import { mapLimit } from 'async';
import * as _ from 'underscore';
import * as Jimp from 'jimp';
import * as rgb2hex from 'rgb2hex';
import * as fs from 'fs';
import { join } from 'path';

const ObjectId = Types.ObjectId;

@Injectable()
export class SlotsService {

    async onModuleInit() {
    }

    constructor(
        @InjectModel('Slot') private readonly slotsModel: Model<Slot>
    ) { }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async updateCasinosAndLogos(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let casinos = await this.getAll();
            let index = 0;

            mapLimit(casinos, 1, async (casino) => {
                index++;
                await this.timeout(50);
                let logoPath = join(__dirname + './../../assets/casinos/' + casino.casinoLogo);

                let logoExt = casino.casinoLogo.split('.').pop();
                let logoName = casino.casinoLogo.split('.').shift();

                let newLogoPath = join(__dirname + './../../assets/casinos/' + 'review-' + logoName + '-' + 'online' + '.' + logoExt);
                let slotLogoNew = 'review-' + logoName + '-' + 'online' + '.' + logoExt;

                // console.log(logoPath);
                // console.log(logoExt);
                // console.log(logoName);
                // console.log(newLogoPath);

                if (fs.existsSync(logoPath)) {
                    let logo = await Jimp.read(logoPath);
                    if (!logo) return Promise.reject();
                    logo
                        .crop(5, 5, 140, 140)
                        .quality(100)
                        .write(newLogoPath);
                    await this.updateOneById(casino._id, { casinoLogo: slotLogoNew });
                    console.log(index);
                } else {
                    console.log('NOT EXISTS');
                }

                return Promise.resolve(casino.casinoLogo);
            }, async (err, result) => {
                if (err) {
                    console.log('ERROR', err);
                } else {
                    console.log('RESULT: ', result);
                    return resolve(result);
                }
            });

        });
    }

    async add(slot): Promise<Slot> {
        let newSlot = new this.slotsModel(slot);
        let response = newSlot.save();
        return response;
    }

    async getAll(): Promise<Slot[]> {
        return await this.slotsModel.find();
    }

    async getOneById(id): Promise<Slot> {
        let slot = await this.slotsModel.findOne({ _id: new ObjectId(id) });
        if (!slot) throw new HttpException('Slot not found!', HttpStatus.BAD_REQUEST);
        return slot;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedSlot = await this.slotsModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedSlot) throw new HttpException('Slot not updated!', HttpStatus.BAD_REQUEST);
        return updatedSlot;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedSlot = await this.slotsModel.findByIdAndRemove(query);
        if (!deletedSlot) throw new HttpException('Slot not deleted!', HttpStatus.BAD_REQUEST);
        return deletedSlot;
    }
}

    // async removeDuplicates(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let uniqueSlots = await this.slotsModel.aggregate([{ $group: { _id: "$slotUrlDetails", cs: { $addToSet: "$_id" } } }]);
    //         let slotsToRemove = [];
    //         slotsToRemove = uniqueSlots.filter(item => item.cs.length > 1);
    //         console.log(uniqueSlots.length);
    //         console.log(slotsToRemove.length);

            // mapLimit(slotsToRemove, 1, async (item) => {
            //     console.log(item.cs);
            //     //let deleted = await this.deleteOneById(item.cs[0]);
            //     return Promise.resolve(item);
            // }, async (err, result) => {
            //     if (err) {
            //         console.log('ERROR', err);
            //     } else {
            //         console.log('DONE:', result.length);
            //         return resolve(result);
            //     }
            // });
    //     });
    // }


        // async updateSlotsAndImages(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let slots = await this.getAll();

    //         mapLimit(slots, 1, async (slot) => {
    //             let logoPath = join(__dirname + './../../assets/slots/screenshot/' + slot.slotScreenshot);
    //             let logoExt = slot.slotScreenshot.split('.').pop();
    //             let logoName = slot.slotScreenshot.split('.').shift();
    //             let newLogoPath = join(__dirname + './../../assets/slots/screenshot/' + 'try-' + logoName + '-' + 'game' + '.' + logoExt);
    //             let slotLogoNew = 'try-' + logoName + '-' + 'game' + '.' + logoExt;

    //             // console.log(logoPath);
    //             // console.log(logoExt);
    //             // console.log(logoName);
    //             // console.log(newLogoPath);

    //             try {
    //                 if (fs.existsSync(logoPath)) {
    //                     fs.renameSync(logoPath, newLogoPath);
    //                     let updated = await this.updateOneById(slot._id, {slotScreenshot: slotLogoNew})
    //                     // console.log('EXISTS');
    //                 } else {
    //                     console.log('NOT EXISTS');
    //                 }
    //             } catch (err) {
    //                 console.error(err);
    //             }
    //             // console.log('----------------------------');

    //             return Promise.resolve(slot);
    //         }, async (err, result) => {
    //             if (err) {
    //                 console.log('ERROR', err);
    //             } else {
    //                 return resolve(result);
    //             }
    //         });

    //     });
    // }

    // timeout(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    // async updateCasinosAndLogos(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let logos = await this.getAll();
    //         let index = 0;

    //         mapLimit(logos, 1, async (slot) => {
    //             index++;
    //             await this.timeout(50);
    //             let logoPath = join(__dirname + './../../assets/slots/logo/' + slot.slotLogo);

    //             let logoExt = slot.slotScreenshot.split('.').pop();
    //             let logoName = slot.slotScreenshot.split('.').shift();
    //             let newLogoPath = join(__dirname + './../../assets/slots/logo/' + 'play-' + logoName + '-' + 'game2' + '.' + logoExt);
    //             let slotLogoNew = 'play-' + logoName + '-' + 'game' + '.' + logoExt;

    //             // console.log(logoPath);
    //             // console.log(logoExt);
    //             // console.log(logoName);
    //             // console.log(newLogoPath);

    //             if (fs.existsSync(logoPath)) {
    //                 let logo = await Jimp.read(logoPath);
    //                 if (!logo) return Promise.reject();
    //                 logo
    //                     .opacity(0.1)

    //                     .write(newLogoPath);
    //                 //await this.updateOneById(slot._id, { slotLogo: slotLogoNew });
    //                 console.log(index);
    //             } else {
    //                 console.log('NOT EXISTS');
    //             }

    //             return Promise.resolve(slot.slotLogo);
    //         }, async (err, result) => {
    //             if (err) {
    //                 console.log('ERROR', err);
    //             } else {
    //                 console.log('RESULT: ', result);
    //                 return resolve(result);
    //             }
    //         });

    //     });
    // }

    // async checkImages(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let slots = await this.getAll();
    //         let missingImages = {
    //             logosMissing: [],
    //             screenshotMissing: []
    //         };

    //         mapLimit(slots, 1, async (slot) => {
    //             let logoPath = join(__dirname + './../../assets/slots/logo/' + slot.slotLogo);
    //             let screenPath = join(__dirname + './../../assets/slots/screenshot/' + slot.slotScreenshot);

    //             try {
    //                 if (fs.existsSync(logoPath)) {
    //                 } else {
    //                     if (slot.slotLogoUrl.indexOf('undefined') == -1) {
    //                         missingImages.logosMissing.push(slot.slotLogoUrl);
    //                     }
    //                 }
    //             } catch (err) {
    //                 console.error(err)
    //             }

    //             try {
    //                 if (fs.existsSync(screenPath)) {
    //                 } else {
    //                     if (slot.slotScreenshotUrl.indexOf('undefined') == -1) {
    //                         missingImages.screenshotMissing.push(slot.slotScreenshotUrl);
    //                     }
    //                 }
    //             } catch (err) {
    //                 console.error(err)
    //             }

    //             return Promise.resolve(slot);
    //         }, async (err, result) => {
    //             if (err) {
    //                 console.log('ERROR', err);
    //             } else {
    //                 return resolve(missingImages.screenshotMissing);
    //             }
    //         });

    //     });
    // }
