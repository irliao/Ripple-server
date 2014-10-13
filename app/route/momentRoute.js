var MomentCtr     = require('../controller/moment');

var express = require('express');
var moment = express.Router();

moment.route('/')
    /*
    *   Initiate a moment, request when photo taken
    *   TODO:
            posting multiple moment, determine active one
    */
    .post( function( req, res )
    {
        var params =
        {
            my_device_id : req.body.device_id,
            image   :   req.body.image,
            lat : req.body.lat,
            lon : req.body.lon
        };

        MomentCtr.init( params,
            function onInit( err, status )
            {
                res.json(
                    {
                        status: status
                    });
            });
    })

    /*
    *   Complete a moment and login
        TODO:
            finish return value
    */
    .put( function( req, res )
    {
        var params =
        {
            my_device_id : req.body.device_id,
            status : req.body.status,
            skip : 0,
            offset : 20
        };

        MomentCtr.login( params,
            function onLogin( err, explore, friends )
            {
                res.json(
                    {
                        explore: explore,
                        friends: friends
                    });
            });
    });

/*
*   status code:
        0: succsefully become friends
        1: already friends
        2: waiting to be liked
*/
moment.route('/like')
    .post( function( req, res )
    {
        var params =
        {
            like_mid : req.body.target_mid,
            my_device_id : req.body.device_id
        };

        MomentCtr.like( params,
            function onLike( err, status, connection )
            {
                res.json(
                    {
                        status : status,
                        connection : connection
                    });
            });
    });


module.exports = moment