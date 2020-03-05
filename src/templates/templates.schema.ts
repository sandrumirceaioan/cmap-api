import * as mongoose from 'mongoose';

export const TemplatesSchema = new mongoose.Schema({
    templateType: String,
    templateName: String,
    templateContent: String,
    templateCreated: {
        type: Date,
        default: function () {
            return new Date().getTime()
        }
    }
});

TemplatesSchema.index({_id: 1, templateName: 1, templateType: 1}, {unique: true});