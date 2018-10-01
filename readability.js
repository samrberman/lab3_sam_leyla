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

        let title = (filename.split("/")[1]).split(".")[0]

        // open db file containing text information
        let db = new sqlite3.Database('./texts.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            };

            // hash for current text file
            const hash = md5File.sync(filename);

            // retrieve row from database (if such exists) matching text file's hash
            db.get(`SELECT * FROM text_info WHERE hash='${hash}'`, (err, row) => {
                if (err) {
                    return console.error(err.message);
                }

                // if the row does not exist, calculate information and call function store_info to create a new row
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
                        number_count, CL_value, ARI_value, hash);

                    // callback to user with text statistics
                    callback("\nREADABILITY OF " + title.toUpperCase() + ":\n\n" +
                        sentence_count + " sentences\n" +
                        char_count + " characters\n" +
                        word_count + " words\n" +
                        letter_count + " letters\n" +
                        number_count + " numbers\n" +
                        "--------------------------------" +
                        "\nColeman Liau: " + CL_value +
                        "\nAutomated Readability Index: " + ARI_value + "\n");
                }
                else {

                    // if the row does exist, extract statistics for text
                    let sentence_count = row.sentence_count;
                    let char_count = row.char_count;
                    let word_count = row.word_count;
                    let letter_count = row.letter_count;
                    let number_count = row.number_count;
                    let CL_value = row.CL_value;
                    let ARI_value = row.ARI_value;

                    // callback to user with text statistics
                    callback("\nREADABILITY OF " + title.toUpperCase() + ":\n\n" +
                        sentence_count + " sentences\n" +
                        char_count + " characters\n" +
                        word_count + " words\n" +
                        letter_count + " letters\n" +
                        number_count + " numbers\n" +
                        "--------------------------------" +
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

// insert new row into database with text statistics
function store_info (db, sentences, characters, words, letters, numbers, CL_value, ARI_value, hash) {
      db.run(`INSERT INTO text_info(sentence_count, char_count, word_count, letter_count, number_count, CL_value, ARI_value, hash) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
              [sentences, characters, words, letters, numbers, CL_value, ARI_value, hash], function(err) {
        if (err) {
          return console.log(err.message);
        }
      });
}
