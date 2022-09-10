import cryptoJS from "crypto-js";
import { encrypt } from "@metamask/eth-sig-util";
import JSZip from "jszip";
import forge from "node-forge";
import { ethers } from "ethers";
import { ethUtil, bufferToHex } from "ethereumjs-util";
import { useToasts } from "@geist-ui/core";

//Forge Attempt
export async function aes(file) {
  var key = forge.random.getBytesSync(16);
  var iv = forge.random.getBytesSync(16);
  let encrypted;
  let filetype = file.type;
  let filename = file.name;

  console.log("file", file);

  // console.log('file.type', file.type)

  // encrypt some bytes using CBC mode
  // (other modes include: ECB, CFB, OFB, CTR, and GCM)
  // Note: CBC and ECB modes use PKCS#7 padding as default
  // var cipher = forge.cipher.createCipher("AES-CBC", key);
  // cipher.start({ iv: iv });
  // cipher.update(forge.util.createBuffer(file));
  // cipher.finish();
  // var encrypted = cipher.output;
  // // outputs encrypted hex
  // console.log("encrypted 1 ", encrypted);
  // console.log("encrypted.toHex() 1 ", encrypted.toHex());

  // if (encrypted.toHex() != undefined && encrypted.toHex() != "") {
  //   console.log("hit");
  //   await decryptAES(encrypted, iv, key);
  // }

  ////

  // encrypt some bytes using CBC mode
  // (other modes include: ECB, CFB, OFB, CTR, and GCM)
  // Note: CBC and ECB modes use PKCS#7 padding as default

  var reader = new FileReader();
  var fileByteArray = [];
  // reader.readAsArrayBuffer(file);
  reader.readAsDataURL(file);
  // reader.readAsArrayBuffer(file);
  // reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    console.log("promise hit");
    reader.onloadend = async function (evt) {
      if (evt.target.readyState == FileReader.DONE) {
        let result = reader.result;
        let publicKey = await getPublicKey();
        let cipher = forge.cipher.createCipher("AES-CBC", key);
        cipher.start({ iv: iv });
        var length = result.length;
        let encryptedkey = bufferToHex(
          Buffer.from(
            JSON.stringify(
              encrypt({
                publicKey: publicKey,
                data: key,
                // data: e.target.files[0],
                version: "x25519-xsalsa20-poly1305",
              })
            ),
            "utf8"
          )
        );
        console.log("encryptedkey", encryptedkey);

        console.log("length2", length);
        // var chunkSize = 1024 * 64;
        var chunkSize = 1024 * 64;
        var index = 0;
        var encrypted = "";
        let completedIndex = 0;
        do {
          encrypted += cipher.output.getBytes();

          console.log("chunkSize", chunkSize);
          var buf = forge.util.createBuffer(result.slice(index, chunkSize));
          console.log("buf", buf);
          cipher.update(buf);
          completedIndex = index;
          index = chunkSize;

          chunkSize += 1024 * 64;
        } while (completedIndex < length);
        let cipherResult = cipher.finish();
        console.log("cipherResult", cipherResult);
        encrypted += cipher.output.getBytes();
        // console.log("encrypted", encrypted);

        let encryptedResult = {
          encrypted: encrypted,
          iv: iv,
          key: encryptedkey,
          filetype: filetype,
          filename: filename,
        };

        console.log("encryptedResult", encryptedResult);
        resolve(encryptedResult);
        // resolve([encrypteﬁﬁ›d, iv, key, filetype, filename]);
      }

      // return [encrypted, iv, key];
    };

    reader.onerror = reject;
  });

  // var cipher = forge.cipher.createCipher("AES-CBC", key);
  // cipher.start({ iv: iv });
  // cipher.update(forge.util.createBuffer(someBytes));
  // cipher.finish();
  // var encrypted = cipher.output;
  // // outputs encrypted hex
  // console.log(encrypted.toHex());

  // if (encrypted.toHex() != undefined && encrypted.toHex() != "") {
  //   console.log("hit");
  //   await decryptAES(encrypted, iv, key);
  // }
}

export async function decryptAES(
  encrypted,
  iv,
  encryptedkey,
  filetype,
  filename
) {
  // var decipher = forge.cipher.createDecipher("AES-CBC", key);
  // // decipher.setAutoPadding(false);
  // decipher.start({ iv: iv });
  // console.log("encrypted 2 ", encrypted);
  // console.log("encrypted.toHex() 2", encrypted.toHex());

  // // decipher.update(encrypted);
  // // decipher.update(forge.util.createBuffer(encrypted));
  // let decipherBOOL = decipher.update(encrypted);
  // console.log("decipherBOOL", decipherBOOL);
  // var result = decipher.finish(); // check 'result' for true/false
  // // outputs decrypted hex
  // console.log("result", result);
  // if (result == true) {
  //   console.log("true", true);
  //   console.log("decipher.output", decipher.output.data);
  //   console.log("decipher", decipher.output.toString());
  //   console.log("decipher.output.toHex()", decipher.output.toHex());
  // }

  ///

  // decrypt some bytes using CBC mode
  // (other modes include: CFB, OFB, CTR, and GCM)
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.listAccounts();
  const decryptedKey = await provider.send("eth_decrypt", [
    encryptedkey,
    accounts[0],
  ]);

  console.log("decrpyt hit");

  /////
  let decipher = forge.cipher.createDecipher("AES-CBC", decryptedKey);
  decipher.start({ iv: iv });
  var buf = forge.util.createBuffer(encrypted);
  console.log("buf", buf);
  // let length = buf.length();
  console.log("length", length);
  // var length = encrypted.byteLength;
  var length = encrypted.length;

  // var chunkSize = 1024 * 64;
  var chunkSize = 1024 * 64;
  var index = 0;
  var decrypted = "";
  let completedIndex = 0;
  do {
    decrypted += decipher.output.getBytes();
    // console.log("encrypted", encrypted);
    // var buf = forge.util.createBuffer(str.substr(index, chunkSize));
    console.log("chunkSize", chunkSize);
    var buf = forge.util.createBuffer(encrypted.slice(index, chunkSize));
    // console.log("buf", buf);
    decipher.update(buf);
    completedIndex = index;
    index = chunkSize;
    // index = index + 1024;
    // chunkSize += 1024 * 64;
    chunkSize += 1024 * 64;
    // console.log("new index before round", index);
    // console.log("new chunkSize before round", chunkSize);
    // console.log("completedIndex", completedIndex);
    // console.log("decrypted", decrypted);
  } while (completedIndex < length);
  let result = decipher.finish();
  console.log("decipher complete");
  // console.log("decipherResult", decipherResult);
  decrypted += decipher.output.getBytes();
  // console.log('bytesToHex', forge.util.bytesToHex(decrypted));

  // decrypted = forge.util.bytesToHex(decrypted);

  // console.log("decrypted", decrypted);
  console.log("decrypt complete");

  if ((result = true)) {
    ////// CONVERT TO BASE64
    console.log("convert to base64 started");
    ////
    console.log("base64 convert started ");
    // const base64 = decrypted;
    // const base64 = forge.util.encode64(decrypted);

    ///
    // console.log("base64", base64);
    console.log("filetype", filetype);
    // const linkSource = "data:" + filetype + ";base64," + base64;
    // const linkSource = base64;
    // console.log("linkSource", linkSource);
    ////
    const urlToFile = async (url, filename, mimeType) => {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      return new File([buf], filename, { type: mimeType });
    };

    let file = await urlToFile(decrypted, filename);
    const url = URL.createObjectURL(file);
    ///

    const downloadLink = document.createElement("a");
    const fileName = filename;

    downloadLink.href = url;
    downloadLink.download = fileName;
    console.log("downloadLink", downloadLink);
    downloadLink.click();
  }
}

///Encrypt File
///Encrypts File using AES256 CryptoJS
// export async function encryptFile(base64) {
//   let bytecount = byteCount(base64);
//   console.log("base64", base64);
//   const sliceSize = 10_485_760; // 10 MiB
//   let start = 0;
//   let key = generateKey();
//   console.log("key", key);
//   let ciphertext;
//   while (start < bytecount) {
//     ciphertext += cryptoJS.AES.encrypt(base64, key).toString();
//     console.log("ciphertext", ciphertext);
//   }
//   console.log("ciphertext", ciphertext);
//   // let ciphertext += cryptoJS.AES.encrypt(base64, key).toString();
//   // console.log("ciphertext", ciphertext);
//   // return [key, ciphertext];
// }

///EncryptStrg
//Encrypts AES256 key via ECIES Key
export const encryptStrg = () => {};

//zipFiles
export async function zipFiles(file, filename) {
  console.log("zip file");
  console.log(filename, file);
  console.log("filename", filename);
  const zip = JSZip();
  // const folder = zip.folder(filename);
  // console.log("folder before add", folder);
  console.log("file", file);
  // file = await file.toString();
  file = await JSON.stringify(file);
  console.log("file after json ", file);
  // let folder = zip.folder(filename).file("envelope.json", file);
  zip.file("envelope.json", file);

  // console.log("folder after add", folder);
  let blob = zip.generateAsync({ type: "blob" });
  blob.name = filename;
  console.log("blob", blob);
  return blob;
}

//unzip file
export async function unzipFiles(data) {
  const zip = new JSZip();
  const files = (await zip.loadAsync(data)).files;

  console.log("files", files);
  return files;
}

const getPublicKey = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.listAccounts();
  const pubkey = await provider.send("eth_getEncryptionPublicKey", [
    accounts[0],
  ]);
  console.log(pubkey); // zpKOsHVU1YdbTKwZJ4u/YBSsu+q6VxJvTfnU8LLCmCg=
  // setpubKey(pubkey);
  return pubkey;
};

//unPackIPFS
//sendToEstuary

///Decrypt
export async function decryptCypher(encryptedData, key) {
  console.log("encryptedData", encryptedData);
  console.log("key", key);

  let decryptData = cryptoJS.AES.decrypt(encryptedData, key).toString();
  console.log("decryptData", decryptData);
  return decryptData;
}

//generateKey
function generateKey() {
  return cryptoJS.lib.WordArray.random(24).toString(cryptoJS.enc.Base64);
}
//

//
async function byteCount(s) {
  return encodeURI(s).split(/%..|./).length - 1;
}

// export async function aes(files) {
//   var key = cryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
//   var iv = cryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");

//   // encrypt
//   var aesEncryptor = cryptoJS.algo.AES.createEncryptor(key, { iv: iv });

//   var ciphertextPart1 = aesEncryptor.process("Message Part 1");
//   var ciphertextPart2 = aesEncryptor.process("Message Part 2");
//   var ciphertextPart3 = aesEncryptor.process("Message Part 3");
//   var ciphertextPart4 = aesEncryptor.finalize();

//   console.log("ciphertextPart4", ciphertextPart4.toString());

//   // decrypt
//   var aesDecryptor = cryptoJS.algo.AES.createDecryptor(key, { iv: iv });

//   var plaintextPart1 = aesDecryptor.process(ciphertextPart1);
//   console.log("plaintextPart1", plaintextPart1.toString(cryptoJS.enc.Utf8));
//   var plaintextPart2 = aesDecryptor.process(ciphertextPart2);
//   console.log("plaintextPart2", plaintextPart2.toString(cryptoJS.enc.Utf8));

//   var plaintextPart3 = aesDecryptor.process(ciphertextPart3);
//   var plaintextPart4 = aesDecryptor.process(ciphertextPart4);
//   var plaintextPart5 = aesDecryptor.finalize();
//   var utf8 = cryptoJS.enc.Utf16.stringify(plaintextPart5);
//   console.log("utf8", utf8);
//   console.log("plaintextPart5", plaintextPart5.toString(cryptoJS.enc.Utf8));
// }

// //chunk attempt
// export async function aes(file) {
//   let bytecount = await byteCount(file);
//   var iv = cryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
//   console.log("bytecount", bytecount);
//   let key = generateKey();
//   console.log("checkpoint 1 plus key", key);
//   let aesEncryptor = cryptoJS.algo.AES.createEncryptor(key, { iv: iv });
//   console.log("aesEncryptor 1", aesEncryptor);
//   console.log("checkpoint 2");
//   const sliceSize = 10_485_760; // 10 MiB
//   let start = 0;
//   console.log('file.size',file.size)
//   console.log('sliceSize',sliceSize)

//   while (start < file.size) {
//     console.log("at byte ", start);
//     console.log("file", file);
//     let slice = await readSlice(file, start, sliceSize);
//     // const wordArray = CryptoJS.lib.WordArray.create(slice);
//     console.log("slice", slice);
//     // var string = new TextDecoder().decode(slice);
//     // console.log("string", string);
//     console.log("aesEncryptor 2", aesEncryptor);
//     console.log(typeof slice);
//     slice = slice.toString();
//     console.log(typeof slice);
//     console.log("slice", slice);
//     if (slice != undefined || slice != "0" || slice != 0) {
//       console.log("slice", slice);
//       var ciphertextPart1 = aesEncryptor.process(slice);
//     } else {
//       console.log("it is undefined");
//     }
//     console.log("ciphertextPart1", ciphertextPart1);
//     console.log("aesEncryptor", aesEncryptor);
//     start += sliceSize;
//   }
//   let ciphertextFinal = aesEncryptor.finalize();

//   console.log("aesEncryptor after final", ciphertextFinal.toString());

//   var aesDecryptor = cryptoJS.algo.AES.createDecryptor(key, { iv: iv });

//   var plaintextPart1 = aesDecryptor.process(ciphertextFinal);
//   var plaintextPart5 = aesDecryptor.finalize();
//   console.log('plaintextPart1',plaintextPart1)
//   console.log('plaintextPart5',plaintextPart5.toString(cryptoJS.enc.Base64))
//   return ciphertextFinal.toString();
// }

// async function readSlice(file, start, size) {
//   console.log("readSlice hit");
//   return new Promise((resolve, reject) => {
//     console.log("file", file);
//     const fileReader = new FileReader();
//     console.log("start", start);
//     console.log("size", size);
//     const slice = file.slice(start, start + size);
//     console.log("file slice 1", file);
//     fileReader.readAsDataURL(file);
//     console.log("file slice 2", file);

//     fileReader.onload = () => resolve(fileReader.result);
//     fileReader.onerror = reject;
//     return fileReader.result;
//     // return slice;
//     // fileReader.readAsArrayBuffer(slice);
//   });
// }

// fileReader.onload = () =>
// resolve(console.log("fileReader.result", fileReader.result));
// console.log("fileReader.result", fileReader.result);
// fileReader.onerror = reject;
// // fileReader.readAsArrayBuffer(slice);
