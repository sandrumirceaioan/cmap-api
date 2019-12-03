import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slot } from './slots.interface';
import { mapLimit } from 'async';
import * as _ from 'underscore';
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



    async checkImages(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let slots = await this.getAll();
            let missingImages = {
                logosMissing: [],
                screenshotMissing: []
            };

            mapLimit(slots, 1, async (slot) => {
                let logoPath = join(__dirname + './../../assets/slots/logo/' + slot.slotLogo);
                let screenPath = join(__dirname + './../../assets/slots/screenshot/' + slot.slotScreenshot);

                try {
                    if (fs.existsSync(logoPath)) {
                    } else {
                        if (slot.slotLogoUrl.indexOf('undefined') == -1) {
                            missingImages.logosMissing.push(slot.slotLogoUrl);
                        }
                    }
                } catch (err) {
                    console.error(err)
                }

                try {
                    if (fs.existsSync(screenPath)) {
                    } else {
                        if (slot.slotScreenshotUrl.indexOf('undefined') == -1) {
                            missingImages.screenshotMissing.push(slot.slotScreenshotUrl);
                        }
                    }
                } catch (err) {
                    console.error(err)
                }

                return Promise.resolve(slot);
            }, async (err, result) => {
                if (err) {
                    console.log('ERROR', err);
                } else {
                    return resolve(missingImages.screenshotMissing);
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
        return await this.slotsModel.find().limit(100);
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
