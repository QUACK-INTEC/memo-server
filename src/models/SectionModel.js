const mongoose = require('mongoose');

const { Schema } = mongoose;

const { String, Boolean, ObjectId } = Schema.Types;

const ScheduleDaySchema = new Schema({
    from: {
        type: Number,
        required: true,
    },
    to: {
        type: Number,
        required: true,
    },
});

const ScheduleSchema = new Schema({
    monday: {
        type: ScheduleDaySchema,
        required: false,
    },
    tuesday: {
        type: ScheduleDaySchema,
        required: false,
    },
    wednesday: {
        type: ScheduleDaySchema,
        required: false,
    },
    thursday: {
        type: ScheduleDaySchema,
        required: false,
    },
    friday: {
        type: ScheduleDaySchema,
        required: false,
    },
    saturday: {
        type: ScheduleDaySchema,
        required: false,
    },
});

const SectionModel = new Schema({
    professorName: {
        type: String,
    },
    schedule: {
        type: ScheduleSchema,
        required: true,
    },
    classRoom: {
        type: String,
    },
    code: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    students: [{
        type: ObjectId,
        required: true,
        ref: 'user',
    }],
    posts: [{
        type: ObjectId,
        required: true,
        ref: 'post',
    }],
    subject: {
        type: ObjectId,
        required: true,
        ref: 'subject',
    },
    discriminator: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('section', SectionModel);
