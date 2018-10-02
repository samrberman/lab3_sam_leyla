# lab3

This program computes the readability of texts. Given a text file, it uses
features like the number of sentences, words, and characters to compute the
grade-level readability of the text. It produces two values according to
the Coleman-Liau readability index and the Automated Readability Index.

Once a text is evaluated for the first time, its data are stored in a SQLite
database and identified by a hash function. This means that program produces
results much faster after it has already computed and store the information
for a text.

The correct usage is: node readability.js <file>.

The program, data, and texts are in the following files:
readability.js contains the main program.
package.json stores the packages required by readability.js.
texts.db stores data about analyzed texts.
The texts directory stores all the text files that the program can analyze.
