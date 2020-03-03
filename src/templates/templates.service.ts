import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template } from './templates.interface';
import { mapLimit, parallel } from 'async';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class TemplatesService {

    async onModuleInit() {
    }

    constructor(
        @InjectModel('Template') private readonly templatesModel: Model<Template>
    ) { }

    async add(template): Promise<Template> {
        let newTemplate = new this.templatesModel(template);
        let response = newTemplate.save();
        return response;
    }

    async getAll(): Promise<Template[]> {
        return await this.templatesModel.find();
    }

    async getOneById(id): Promise<Template> {
        let template = await this.templatesModel.findOne({ _id: new ObjectId(id) });
        if (!template) throw new HttpException('Template not found!', HttpStatus.BAD_REQUEST);
        return template;
    }


    async updateOneById(id, params): Promise<Template> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedTemplate = await this.templatesModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedTemplate) throw new HttpException('Template not updated!', HttpStatus.BAD_REQUEST);
        return updatedTemplate;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedTemplate = await this.templatesModel.findByIdAndRemove(query);
        if (!deletedTemplate) throw new HttpException('Template not deleted!', HttpStatus.BAD_REQUEST);
        return deletedTemplate;
    }

}