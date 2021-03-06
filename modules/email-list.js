'use strict';

module.exports = {
  listFromS3: (s3) => {
    let stuff = {}
    return new Promise((resolve, reject) => {
      s3.listObjectsV2({
        Bucket: 'alittlefiction.ses',
        Delimiter: '/',
        Prefix: 'email/'
      }, (err, result) => {
        if(err) {
          return reject(new Error('Error: listObjects failed...'))
        } else {
          return resolve(result)
        }
      })
    })
  },
  getFromS3: () => {
    s3.getObject({
      Bucket: '',
      Key: ''
    }, (err, result) => {
      if(err) {

      } else {

      }
    })
  },
  parseEmail: (x) => {
    return x;
  }
}