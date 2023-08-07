const cronJob = require('cron').CronJob;
const scraper = require('./scraper');

function cronJobs(db){
  //scraper(db)
    var cronjob = new cronJob({
        cronTime: "0 * * * *", 
        start:    true            , 
        timeZone: "Asia/Tokyo"    , 
        onTick: async function() {
          scraper(db)
        }
    });
  
}
module.exports = cronJobs