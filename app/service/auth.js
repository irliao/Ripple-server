var jwt = require('jsonwebtoken');
var nconf = require('nconf');




var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',// update to encryption with GCM later
  key = nconf.get('secrete-key')['encription'];

function encrypt(text) {
    //var iv = new Buffer(crypto.randomBytes(12)); // ensure that the IV (initialization vector) is random
    var cipher = crypto.createCipher(algorithm, key);//crypto.createDecipheriv(algorithm, key, iv);
    console.log('text');
    console.log(text);
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    //var tag = cipher.getAuthTag();
    return encrypted//+'$'+ tag+'$'+ iv.toString('hex')
}

function decrypt(encrypted) {
    console.log('encrypted');
    console.log(encrypted);
    //var blob = encrypted.spilt('$');
    //var iv = new Buffer(blob[2], 'hex');
    var decipher = crypto.createDecipher(algorithm, key);
    //decipher.setAuthTag(blob[1]);
    var dec = decipher.update(encrypted, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}


var signToken =  function( type, payload)
{
    var token = jwt.sign(payload, nconf.get('secrete-key')['token'][type] );
    return token;
};

var verifyToken = function(type, token, verified) {
  return jwt.verify(token, nconf.get('secrete-key')['token'][type] , {}, verified);
};

module.exports.verifySecret = function( secret, key, res, next) {
  req['action_token'] = decript(secret);
  console.log('secrete')
  console.log(req['secret'])
  /*
    if(err)
            {
                res.status(401).json( { err:'invalid auth token' } );
            }else
            {
                req['auth_token'] = payload;
                next();
            }
  */
};

module.exports.newBaseToken = function(device, next)
{

    var token =  signToken('auth',
    {
        device_id : device.device_id
    });
    next(device, token);
};

module.exports.authenticate = function( req, res, next )
{
    var token = req.body.auth_token || '';
    console.log('auth_token:'+ token);
    if( token == 'new' )
    {
        req['auth_token'] = 'new';
        next();
    }
    else
    {
        verifyToken('auth',token, function( err, payload)
        {
            if(err)
            {
                res.status(401).json( { err:err } );
            }else
            {
                req['auth_token'] = payload;
                next();
            }
        });
    }

};

module.exports.parseAction = function( req, res, next)
{
    var token = req.body.action_token || '';
    console.log( 'auth  parse action token');
    console.log(token);
    verifyToken('action',token, function( err, payload)
    {
        if(err)
        {
            res.status(401).json( { err:err} );
        }else
        {
            if(payload['encrypted'] &&payload['encrypted'] != '')
            {
                console.log('payload');
                console.log(payload);
                var secret = JSON.parse(JSON.parse(decrypt(payload['encrypted'])));
                payload['encrypted'] = secret;
            }
            req['action_token'] = payload;
            next();
        }
    });
}

module.exports.issueActionToken = function( action, secrets, options, next)
{
    console.log( 'auth  issue action token');
    console.log(options);

    var tasks = {
        like: function(options, next)
        {
            var secret = encrypt(JSON.stringify(JSON.stringify(secrets)));
            var token = signToken('action',
                {
                    action : 'like',
                    encrypted:secret
                });

            next( {action_type:'like',action_token:token} );
        },
        connect: function(options, next)
        {
            var secret = encrypt(JSON.stringify(JSON.stringify(secrets)));
            var token = signToken('action',
                {
                    action : 'connect',
                    encrypted: secret
                });
            next({action_type:'connect',action_token:token} );
        }
    };

    tasks[action](options, next);
}