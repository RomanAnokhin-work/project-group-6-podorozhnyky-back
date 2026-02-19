import {Schema, model} from "mongoose";

const userSchema = new Schema(
    {
        name:{
            type: String,
            required:true,
            trim: true
        },
        avatarUrl:{
            type:String,
            // trim: true,
        },
        articlesAmount:{
            type: Number,
            default: 0
        },
        description: {
            type:String,
            trim:true,
            default: ''
        }
    }
)
export const User = model('User', userSchema)