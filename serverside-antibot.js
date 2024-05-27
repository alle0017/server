const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');



schedule.scheduleJob('0 * * * * *', ()=>{
      fs.writeFile( path.join(__dirname, 'time.json'), JSON.stringify( { blacklist: {}, rate: {} } ), err =>{
            if(err) console.error(err);
      } )
})

const CHALLENGE_RATE = 300;
const RATE_LIMIT = 1000;

/**
 * update the timestamp file and update the blacklist if needed
 * @param {number} hash the hash of the user
 */
const checkRateLimit = ( timestamps, hash, res )=>{

      if( !timestamps.rate[hash] ){
            timestamps.rate[hash] = {
                  rate: 1,                        
                  since: new Date().toString(),
            }
            res.send({ ok: true });
      }else{
            const date = new Date( timestamps.rate[hash].since );
            const now = new Date();

            if( now.getFullYear() > date.getFullYear() || now.getMonth() > date.getMonth() || now.getDate() > date.getDate() || now.getHours() > date.getHours() || now.getMinutes() > date.getMinutes() ){
                  timestamps.rate[hash] = {
                        rate: 1,                        
                        since: new Date().toString(),
                  }
                  res.send({ ok: true });
            }else{
                  timestamps.rate[hash].rate++;
                  if( timestamps.rate[hash].rate > RATE_LIMIT ){
                        timestamps.blacklist[hash] = true;
                        res.send({ ok: false });
                  }else{
                        res.send({ ok: true });
                  }
            }
      }
      fs.writeFile( path.join(__dirname, 'time.json'), JSON.stringify( timestamps ), err =>{
            if(err) console.error(err);
      } )
}

const setupAntiBot = (app)=>{
      app.get('/bot', (req, res)=>{
                  fs.readFile( path.join(__dirname, 'detect.js'), 'utf8', (err, text)=>{
                        if( err ) return;

                        res.send({
                              script: text,
                              seed: 1033394,
                        });
                  })
      });
      app.post('/fingerprint', (req, res)=>{
            
            fs.readFile(path.join(__dirname, 'time.json'), ( err, file )=>{
                  if( err ) return;

                  try{
                        file = JSON.parse(file);
                  }catch{
                        file = {
                              blacklist: {},
                              rate: {},
                        }
                  }
                  checkRateLimit( file, req.body.hash, res )
            } )
      })
}

module.exports = { setupAntiBot };