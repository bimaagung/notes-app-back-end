const AWS = require('aws-sdk');

class StorageService {
  constructor() {
    this._S3 = new AWS.S3();
  }

  writeFile(file, meta) {
    const parameter = {
      Bucket: process.env.AWS_BUCKET_NAME, // nama S3 bucket yang digunakan
      Key: +new Date() + meta.filename, // Nama berkas yang disimpan
      Body: file._data, // Berkas (dalam bentuk buffer) yang disimpan
      ContentType: meta.headers['content-type'], // MIME type berkas yang akan disimpan
    };

    return new Promise((resolve, reject) => {
      this._S3.upload(parameter, (error, data) => {
        if (error) {
        // upload error
          return reject(error);
        }

        return resolve(data.Location);
      });
    });
  }
}

module.exports = StorageService;
