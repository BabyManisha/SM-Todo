var express = require("express");
var router = express.Router();
var base64 = require("base-64");
var { Client } = require("pg");


var pgclient = new Client({
    host: 'sessiondb',
    port: 5432,
    user: 'sessiondb',
    database: 'sessiondb'
});

pgclient.connect((err) => {
    if(err){
        console.log('PGDB COnnection Error', err.stack);
    }else{
        console.log('connected to PastgressDB');
    }
})

router.get('/getUserDetails', (req, resp) => {
    // console.log(req.method);
    // console.log(req.path);
    // console.log(req.headers['x-access-token']);
    // console.log(req.cookies);
    // var session_key = req.cookies['sessionid'];
    // var access_token = req.headers['x-access-token'];

    // pgclient.query('SELECT * FROM django_session where session_key = $1',[session_key] , (err, res) => {
    //     if(err){
    //         console.log("error in the query....", err);
    //     }else{
    //         console.log("PGDB response is:", res);
    //         if(res.rowCount == 1){ 
    //             let sessionDatab64 = res.rows[0]['session_data'];
    //             let sessionData = base64.decode(sessionDatab64);
    //             let sIndex = sessionData.indexOf(':');
    //             let sData = JSON.parse(sessionData.slice(sIndex+1));
    //             let appsDetails = sData['apps'][access_token];
    //             uName = appsDetails['schema_name'];
    //             console.log(uName);
    //             resp.json(appsDetails);
    //         }else{
    //             console.log("invalid session");
    //         }
    //     }
    // })
    resp.json(req['appDetails']);
});

module.exports = router;