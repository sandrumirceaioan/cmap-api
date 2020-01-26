import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentMethod } from './payment-methods.interface';
import { mapLimit, parallel } from 'async';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class PaymentMethodsService {

    async onModuleInit() {
    }

    constructor(
        @InjectModel('PaymentMethod') private readonly paymentMethodsModel: Model<PaymentMethod>
    ) { }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async add(paymentMethod): Promise<PaymentMethod> {
        let newPaymentMethod = new this.paymentMethodsModel(paymentMethod);
        let response = newPaymentMethod.save();
        return response;
    }

    async getAll(): Promise<PaymentMethod[]> {
        return await this.paymentMethodsModel.find();
    }

    async getOneById(id): Promise<PaymentMethod> {
        let paymentMethod = await this.paymentMethodsModel.findOne({ _id: new ObjectId(id) });
        if (!paymentMethod) throw new HttpException('Payment Method not found!', HttpStatus.BAD_REQUEST);
        return paymentMethod;
    }

    async getOneByName(name): Promise<PaymentMethod> {
        let paymentMethod = await this.paymentMethodsModel.findOne({ paymentMethodName: name });
        return paymentMethod;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedPaymentMethod = await this.paymentMethodsModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedPaymentMethod) throw new HttpException('Paymen Method not updated!', HttpStatus.BAD_REQUEST);
        return updatedPaymentMethod;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedPaymentMethod = await this.paymentMethodsModel.findByIdAndRemove(query);
        if (!deletedPaymentMethod) throw new HttpException('Payment Method not deleted!', HttpStatus.BAD_REQUEST);
        return deletedPaymentMethod;
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
                        response.all = await this.paymentMethodsModel.count();
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

        async searchPayments(params): Promise<any> {
            let query = {};
    
            if (params.search != null) {
                var searchFilter = [];
                searchFilter.push({ paymentMethodName: { $regex: ".*" + params.search + ".*", $options: '-i' } });
                query['$or'] = searchFilter;
            }
    
            let result: PaymentMethod[] = await this.paymentMethodsModel.find(query);
            return result;
        }

}