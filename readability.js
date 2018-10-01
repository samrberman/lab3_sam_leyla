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


        let title = process.argv[2].split('.')[0];

        let db = new sqlite3.Database('./texts.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            };
            db.get(`SELECT * FROM text_info WHERE title='${title}'`, (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                if (typeof row == 'undefined') {

                    let sentence_count = tokenizeEnglish.sentences()(contents).length;
                    let char_count = tokenize.characters()(contents).length;
                    let word_count = tokenize.words()(contents).length;

                    let extract_letters = tokenize.re(/[A-Za-z]/);
                    let letter_count = extract_letters(contents).length;
                    let extract_numbers = tokenize.re(/[0-9]/);
                    let number_count = extract_numbers(contents).length;

                    let CL_value = colemanLiau(letter_count, word_count, sentence_count);
                    let ARI_value = automatedReadabilityIndex(letter_count, number_count, word_count, sentence_count);


                    store_info(db, sentence_count, char_count, word_count, letter_count,
                        number_count, CL_value, ARI_value, title);

                    callback(sentence_count + " sentences\n" +
                        char_count + " characters\n" +
                        word_count + " words\n" +
                        letter_count + " letters\n" +
                        number_count + " numbers\n" +
                        "\nColeman Liau: " + CL_value +
                        "\nAutomated Readability Index: " + ARI_value + "\n");
                }
                else {

                    let sentence_count = row.sentence_count;
                    let char_count = row.char_count;
                    let word_count = row.word_count;
                    let letter_count = row.letter_count;
                    let number_count = row.number_count;
                    let CL_value = row.CL_value;
                    let ARI_value = row.ARI_value;

                    callback(sentence_count + " sentences\n" +
                        char_count + " characters\n" +
                        word_count + " words\n" +
                        letter_count + " letters\n" +
                        number_count + " numbers\n" +
                        "\nColeman Liau: " + CL_value +
                        "\nAutomated Readability Index: " + ARI_value + "\n");
                }
            })
        })
        db.close();
        })};


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

//function read_info (db, title) {}

function store_info (db, sentences, characters, words, letters, numbers, CL_value, ARI_value, title) {
      db.run(`INSERT INTO text_info(sentence_count, char_count, word_count, letter_count, number_count, CL_value, ARI_value, title) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
              [sentences, characters, words, letters, numbers, CL_value, ARI_value, title], function(err) {
        if (err) {
          return console.log(err.message);
        }
      });
}