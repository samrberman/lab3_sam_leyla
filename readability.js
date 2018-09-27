const fs = require("fs");
const md5File = require('md5-file');
const sqlite3 = require('sqlite3');
const Tokenizer = require('tokenize-text');
const tokenize = new Tokenizer();
const tokenizeEnglish = require("tokenize-english")(tokenize);

// Parses a text file into words, sentences, characters
function readability(filename, callback) {
    fs.readFile(filename, "utf8", (err, contents) => {
        if (err) throw err;

        // TODO: parse and analyze the file contents

        let sentence_count = tokenizeEnglish.sentences()(contents).length;
        let char_count = tokenize.characters()(contents).length;
        let word_count = tokenize.words()(contents).length;

        let extract_letters = tokenize.re(/[A-Za-z]/);
        let letter_count = extract_letters(contents).length;
        let extract_numbers = tokenize.re(/[0-9]/);
        let number_count = extract_numbers(contents).length;

        let CL_value = colemanLiau(letter_count, word_count, sentence_count);
        let ARI_value = automatedReadabilityIndex(letter_count, number_count, word_count, sentence_count);

        callback(sentence_count + " sentences\n" +
                 char_count + " characters\n" +
                 word_count + " words\n" +
                 letter_count + " letters\n" +
                 number_count + " numbers\n" +
                 "\n" +
                 "Coleman Liau: " + CL_value +
                 "\nAutomated Readability Index: " + ARI_value + "\n")
        });
}

// Computes Coleman-Liau readability index
function colemanLiau(letters, words, sentences) {
    return (0.0588 * (letters * 100 / words))
        - (0.296 * (sentences * 100 / words))
        - 15.8;
}

// Computes Automated Readability Index
function automatedReadabilityIndex(letters, numbers, words, sentences) {
    return (4.71 * ((letters + numbers) / words))
        + (0.5 * (words / sentences))
        - 21.43;
}

// Calls the readability function on the provided file and defines callback behavior
if (process.argv.length >= 3) {
    readability("texts/"+process.argv[2], data => {
        console.log(data);
    });
}
else {
    console.log("Usage: node readability.js <file>");
}
