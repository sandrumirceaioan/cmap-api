import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
    firstName: string;
    lastName: string;
    userName: string;
    userEmail: string;
    userRole: string;
    userPassword: string;
}