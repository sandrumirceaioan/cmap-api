import * as mongoose from 'mongoose';

export interface Template extends mongoose.Document {
    templateType: String;
    templateName: String;
    templateContent: String;
    templateCreated: Date;
}