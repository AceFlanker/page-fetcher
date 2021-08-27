const argv = process.argv.slice(2);
const request = require('request');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const hostAddress = argv[0];
const filePath = argv[1];

const download = function(url) {
  request('http://' + url, (error, response, body) => {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    if (body) {
      let targetFile = body;
      console.log('File body received');
      fs.writeFile(filePath, body, err => {
        if (err) {
          // if (err.errno === )
          console.error(err);
          return;
        }
        const fileSize = fs.statSync(filePath).size;
        console.log(`File successfully downloaded and saved ${targetFile.length} bytes (.length)/${fileSize} (statSync().size) to ${filePath}`);
        process.exit();
      });
    }
  });
};

const sadPathList = [
  '====================================', // 0
  'Invalid URL specified.\nDownload Terminated...\nPlease enter a valid http:// URL.', // 1
  'Invalid URL specified.\nDownload Terminated...\nPelase enter a valid URL with the domain name ONLY.', // 2
  'Invalid file name spcified.\nDownload Terminated...\nPlease change it to "index.html".', // 3
  'Invalid file path specified.\nDownload Terminated...\nPlease enter a valid path.', // 4
  'File already exists, name "yes" to confirm to overwrite => ' // 5
];
const schemeNegCheck = /^([A-Za-z]+.)+[A-Z-a-z]+\/?$/; // Checks if the URL has a scheme/protocol specified
const httpCheck = /^http:\/\/.*/; // Checks if the scheme is an http protocol
const httpless = /(?<=^http:\/\/).*[^\/]/; // Removes "http://" from the URL to match request function's URL format
const domainCheck1 = /^.*(?<=(:|(:?\/+)))([A-Za-z.]+$|[A-Za-z.]+\/$)/; // Checks if the URL has specfieid only the domain without extra path with a scheme
const domainCheck2 = /(^[A-Za-z.]+$|^[A-Za-z.]+\/$)/; // Without a scheme
const nameCheck = /index.html$/; // Checks if the download path has a valid "index.html" ending
const pathCheck = /.*(?=\/index\.html$)/; // Checks if the download directory already exists

const message = msgNum => {
  console.log(sadPathList[0]);
  console.log(sadPathList[msgNum]);
  console.log(sadPathList[0]);
};

// Pretty robust URL check that only allows the following formats:
// http://domainname.com/
// http://domainname.com
// domainname.com
// domainname.com/
// Anything else will be rejected. Such as
// https://badurl.com
// http://badbadurl.com/verybad

// The error message may not be 100% accurate in describing where
// the URL specified has gone wrong, but very close usually.
// However, the entire checking system needs some good refactoring
// cleaning up for efficiency and accuracy.

if (!schemeNegCheck.test(hostAddress)) {
  if (!httpCheck.test(hostAddress) && domainCheck1.test(hostAddress)) {
    message(1);
    process.exit();
  }
  hostAddress = hostAddress.match(httpless)[0];
}

if (!domainCheck2.test(hostAddress)) {
  message(2);
  process.exit();
}

// Checks if the download path is specified in the format of:
// ./xxxx/index.html
if (!nameCheck.test(filePath)) {
  message(3);
  process.exit();
} else if (!fs.existsSync(filePath.match(pathCheck)[0])) {
  message(4);   // Checks if the directory actually exists
  process.exit();
} else if (fs.existsSync(filePath)) { // Asks user to confirm an overwrite
  rl.question(sadPathList[5], answer => {
    if (answer !== 'yes') {
      rl.close();
      return;
    }
    download(hostAddress);
  });
} else {
  download(hostAddress);
}