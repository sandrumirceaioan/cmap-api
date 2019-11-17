import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Casino } from './casinos.interface';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class CasinosService {

    constructor(
        @InjectModel('Casino') private readonly casinoModel: Model<Casino>
    ) { }

    async add(casino): Promise<Casino> {
        let newCasino = new this.casinoModel(casino);
        let response = newCasino.save();
        return response;
    }

    async getAll(): Promise<Casino[]> {
        return await this.casinoModel.find();
    }

    async getAllActive(): Promise<Casino[]> {
        const casinos = await this.casinoModel.find({casinoWebsiteUrl: { $ne: "" }});
        let list = [];
        let uniqueCasinos = casinos.filter((casino) => {
            if (!_.contains(list, casino.casinoName)) {
                list.push(casino.casinoName);
                return casino;
            }
        });
        return uniqueCasinos;
    }

    async getGroupedCasinos(): Promise<any> {
        return await this.casinoModel.aggregate([{$group:{ _id:"$casinoName", cs: { $addToSet :  "$_id" }}}]);
    }

    async getOneById(id): Promise<Casino> {
        let casino = await this.casinoModel.findOne({_id: new ObjectId(id)});
        if (!casino) throw new HttpException('Casino not found!', HttpStatus.BAD_REQUEST);
        return casino;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedCasino = await this.casinoModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedCasino) throw new HttpException('Casino not updated!', HttpStatus.BAD_REQUEST);
        return updatedCasino;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedCasino = await this.casinoModel.findByIdAndRemove(query);
        if (!deletedCasino) throw new HttpException('CAsino not deleted!', HttpStatus.BAD_REQUEST);
        return deletedCasino;
    }
}
