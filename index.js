const words = require('./words_dictionary');
const axios = require('axios');
const commandLineArgs = require('command-line-args');
const assert = require('assert');
const fs = require('fs');

const optionDefinitions = [
  { name: 'realm', type: String },
  { name: 'amount', type: Number }
];

const options = commandLineArgs(optionDefinitions);
assert.ok(options.realm && options.amount, 'realm and amount must be set');

console.log(options);

const realm = options.realm;

const AMOUNT_TO_SCAN = options.amount;
const MIN_LENGTH = 5;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}


const slicedWords = shuffle(Object.keys(words))
  .filter(w => w.length >= MIN_LENGTH)
  .sort((a, b) => a.length - b.length)
  .slice(0, AMOUNT_TO_SCAN);

const scan = async() => {
  for (let i = 0; i < slicedWords.length; i++) {
    const word = slicedWords[i];

    console.log(`Checking ${word}`);
    let response;
    try {
      response = await axios.get(`https://worldofwarcraft.com/en-us/character/${realm}/${word}`);

      throw new Error(200);
    } catch(err) {
      if (!err.response || +err.response.status !== 404) {
        continue;
      }
    }



    await new Promise((resolve, reject) => {
      fs.appendFile('names.txt', `${word}\n`, err => {
        if (err) return reject(err);

        resolve();
      });
    });

    console.log(`${word} is available`);
  }
};
scan();