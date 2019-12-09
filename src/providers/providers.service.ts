import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Provider } from './providers.interface';
import { mapLimit, parallel } from 'async';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProvidersService {

    async onModuleInit() {
    }

    constructor(
        @InjectModel('Provider') private readonly providersModel: Model<Provider>
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
    }

    async getOneById(id): Promise<Provider> {
        let provider = await this.providersModel.findOne({ _id: new ObjectId(id) });
        if (!provider) throw new HttpException('Provider not found!', HttpStatus.BAD_REQUEST);
        return provider;
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

}