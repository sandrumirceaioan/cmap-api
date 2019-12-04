import * as mongoose from 'mongoose';
import * as beautifyUnique from 'mongoose-beautiful-unique-validation';

export const UsersSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  userName: {
    type: String
  },
  userEmail: {
    type: String,
    required: true,
    unique: 'User with {VALUE} email already exist!'
  },
  userRole: {
    type: String,
    default: 'admin'
  },
  userPassword: {
    type: String,
    required: true,
    select: false
  },
  created: {
    type: Date,
    default: function(){
        return new Date().getTime()
    }
  }
});

UsersSchema.plugin(beautifyUnique);