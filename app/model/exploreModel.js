var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var exploreSchema = new Schema(
{
    mid : String,
    image_url: String,
    location : { type: [Number], index: '2d'},
    status: String,
    like : false,
    connect : false,
    chat_channel: String
})
