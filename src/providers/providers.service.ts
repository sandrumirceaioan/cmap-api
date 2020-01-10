import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Provider } from './providers.interface';
import { mapLimit, parallel } from 'async';
import * as _ from 'underscore';
import { CasinosService } from '../casinos/casinos.service';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProvidersService {

    async onModuleInit() {
        //this.createProviders();
    }

    constructor(
        @InjectModel('Provider') private readonly providersModel: Model<Provider>,
        private casinosService: CasinosService
    ) { }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async add(slot): Promise<Provider> {
        let newProvider = new this.providersModel(slot);
        let response = newProvider.save();
        return response;
    }

    async getAll(): Promise<Provider[]> {
        return await this.providersModel.find();
        //return await this.providersModel.find({providerLogo: {$eq: 'provider-logo.png'}});
    }

    async getOneById(id): Promise<Provider> {
        let provider = await this.providersModel.findOne({ _id: new ObjectId(id) });
        if (!provider) throw new HttpException('Provider not found!', HttpStatus.BAD_REQUEST);
        return provider;
    }

    async getManyByCasino(id): Promise<Provider> {
        let casino = await this.casinosService.deleteOneById(id);
        let casinoProviders = casino.casinoProviders;

        //mapLimit(casinoProviders);

  
        return casinoProviders;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedProvider = await this.providersModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedProvider) throw new HttpException('Provider not updated!', HttpStatus.BAD_REQUEST);
        return updatedProvider;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedProvider = await this.providersModel.findByIdAndRemove(query);
        if (!deletedProvider) throw new HttpException('Provider not deleted!', HttpStatus.BAD_REQUEST);
        return deletedProvider;
    }

    /* admin */

    async countDashboard(): Promise<any> {
        return new Promise((resolve, reject) => {
            let response = {
                all: null,
                published: null
            };
            parallel([
                async () => {
                    response.all = await this.providersModel.count();
                    return Promise.resolve();
                }
            ],
                // optional callback
                (err, result) => {
                    if (err) {
                        console.log('Parallel count: ', err);
                        reject(err);
                    }
                    resolve(response);
                });
        });
    }

    // // add providers from casino - NOT TESTED
    // async createProviders(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         let addedProviders = [];
    //         let casinos: any = await this.casinosService.getAll();

    //         mapLimit(casinos, 1, (casino, cb) => {
    //             let providers = casino.casinoSoftwareProviders;
    //             let countriesUpdated = [];

    //             mapLimit(providers, 1, async (provider) => {
    //                 let saveData = {};
    //                 if (!addedProviders.includes(provider.name)) {
    //                     saveData = {
    //                         providerName: provider.name,
    //                         providerWebsite: provider.url || '',
    //                         providerLogo: 'provider-logo.png',
    //                     };
    //                     let addProvider = await this.add(saveData);
    //                     if (addProvider) {
    //                         addedProviders.push(addProvider.providerName);
    //                     } else {
    //                         console.log('not saved: ', provider.name);
    //                     }
    //                 }
    //                 return Promise.resolve();
    //             }, (err, res) => {
    //                 if (err) console.log('inner ERROR: ', err);
    //                 console.log(addedProviders.length);
    //                 cb();
    //             });

    //         }, (error, result) => {
    //             if (error) console.log('main ERROR: ', error);
    //             console.log('DONE: ', result.length);
    //             return resolve();
    //         });

    //     });
    // }

}