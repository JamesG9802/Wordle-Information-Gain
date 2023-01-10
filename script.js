//  Tracks position of where letters should
var letters;
var letterPos = 0;

var outputLetters;
var outputLetterRow = 0;

//  List of all valid words
var wordList = [];

//  Word to guess
var guessWord;

window.onload = function() {    //  Initializer
    //  Load Letter Display
    letters = document.getElementsByClassName("Wordle-Letter-Input");
    outputLetters = document.getElementsByClassName("Wordle-Letter-Output");
    for(var i = 0; i < letters.length; i++)
        letters[i].innerHTML = "";  

    //  https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript

    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "./Data/english_five.txt", false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
        wordList = result.split(/\s+/);
        wordList = wordList.slice(0,1000);
    }
    else    {
        document.getElementsByTagName("body")[0].innerHTML = "Couldn't load English database.";
    }
}

function WriteLetter(letter)    //  Safe way to update letters in HTML
{
    if(letterPos >= 5)
        console.log("Character overflow");
    if(letterPos < 5)
    {    
        letters[letterPos].innerHTML = letter;
        letterPos++;
    }    
    
}
function DeleteLetter()
{
    if(letterPos == 0)
    {
        console.log("Can't delete nothing");
    }    
    if(letterPos > 0)
        letterPos--;
    letters[letterPos].innerHTML = "";
}

function WriteOutputWordToRow(word)  {
    for(var i = 0; i < 5; i++)
    {
        outputLetters[outputLetterRow*5 + i].innerHTML = word.toUpperCase()[i]; 
    }
}
function WriteOutputInformation(value)  {
    https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding
    var with2Decimals = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    var list = document.getElementsByClassName("Wordle-Letter-Information");
    list[outputLetterRow].innerHTML = with2Decimals;
}
function Submit(){
    if(letterPos == 5)
    {    
        for(var i = 0; i < 5; i++)
            guessWord += letters[i].innerHTML;
        FindBestWord();
    }
}
function FindBestWord() {
    /* Naive Approach 
        Go through every possible word and calculate the information gain of each possible word
        Then select the word that would give you the most information.

        for each word, generate each possible outcome
            generate possibility of outcome
            generate information gain of outcome
            store expected information gain
    */
   
    console.log("check");
    var wordScore = {};
    for(var i = 0; i < wordList.length;i++){
        var expectedValue = 0.0;
        var outcomes = {};
        for(var j = 0; j < wordList.length; j++){
            var outcome = GenerateOutcomeString(wordList[i], wordList[j]);
            if(!(outcome in outcomes))
                outcomes[outcome] = 1.0;
            else
                outcomes[outcome]++;
        }
        for(const [key, value] of Object.entries(outcomes))
        {
            expectedValue += value / wordList.length   //  probability
            * -Math.log(value / wordList.length) / Math.log(2);  //  information gain -log2(probability)
        }
        wordScore[wordList[i]] = expectedValue;
    }
    var highest = 0;
    var word = "";
    for(const [key, value] of Object.entries(wordScore))
    {
        if(value > highest)
        {    
            highest = value;
            word = key;
        }
    }
    console.log(word + " " + highest);
    
    WriteOutputWordToRow(word);
    WriteOutputInformation(highest);
    outputLetterRow++;
    if(outputLetterRow < 6 && word != guessWord)
    {
        //  Generate OutcomeString from word
        var outcomeString = GenerateOutcomeString(word, guessWord);
        //  Green letters
        var greenLetters = {};
        for(var letter = 0; letter < outcomeString.length; letter++)
            if(outcomeString[letter] == "2")
            {
                if(!(outcomeString[letter] in greenLetters))
                    greenLetters[outcomeString[letter]] = [letter];
                else
                    greenLetters[outcomeString[letter]].push(letter);
            }
        //  Yellow letters
        var yellowLetters = {};
        for(var letter = 0; letter < outcomeString.length; letter++)
        {
            if(outcomeString[letter] == "1")
            {
                if(!(outcomeString[letter] in yellowLetters))
                    yellowLetters[outcomeString[letter]] = [letter];
                else
                    yellowLetters[outcomeString[letter]].push(letter);
            }
        }
        var newWordList = [];
        //  word list is shrunk to possible matches
        for(var i = 0; i < wordList.length; i++)
        {
            //  Green Letter compliance
            for(const [key, value] of Object.entries(greenLetters))
            {
                for(var j = 0; j < value.length;j++)
                    if(key != wordList[i][value[j]])
                        continue;
            }
            //  Yellow Letter compliance
            for(const [key, value] of Object.entries(yellowLetters))
            {
                for(var k = 0; k < value.length;k++)
                {
                    //  Yellow letter must not be in the same spot AND
                    //  if it is in green letter, can't be there either
                    var found = false;
                    for(var j = 0; j < wordList[i].length; j++)
                    {
                        if(key == wordList[i][value[k]])   // in the same position so not helpful
                            break;
                        else if(key in greenLetters && j in greenLetters[key])  // same as green letter
                            continue;
                        else if(key == wordList[i][j])
                        {    
                            found = true;
                            break;
                        }
                    }
                    if(found)
                        newWordList.push(wordList[i]);
                }
            }
        }
        wordList = newWordList;
    }
}
function GenerateOutcomeString(originalWord, actualWord)  {
    /*  A word's letters can become green, yellow, or gray 
        0 = Gray, 1 = Yellow, 2 = Green
        There are 3^5 different outcomes to examine

        Green if letter is in the exact same spot.
        Yellow if the letter is in a different spot AND
        the number of times it has appeared + the number of times it is in the correct spot
        is less than the number of times it actually appears in the word
    */
    var outcomeString = "00000";
    var letterCount = {};
    //  Green Pass
    for(var i = 0; i < actualWord.length; i++)
        if(actualWord[i] == originalWord[i])
        {   
            outcomeString = outcomeString.substring(0, i) + "2" + outcomeString.substring(i+1);
            if(!(originalWord[i] in letterCount))
                letterCount[originalWord[i]] = [1];
            else
                letterCount[originalWord[i]]++;
        }
    //  Yellow Pass
    for(var i = 0; i < actualWord.length; i++)
    {
        //  Checking if the word is in the word but in the wrong spot\
        for(var j = 0; j < actualWord.length; j++)
        {
            if(j == i)
                continue;
            if(originalWord[i] == actualWord[j])
            {
                //  Only becomes yellow if the number of times it has appeared is < than # in actual word
                if(!(originalWord[i] in letterCount))
                    letterCount[originalWord[i]] = [1];
                else
                    letterCount[originalWord[i]]++;
                var actualLetterNum = 0;
                for(var k = 0; k < actualWord.length; k++)
                    if(actualWord[k] == originalWord[i])
                        actualLetterNum ++;
                if(letterCount[originalWord[i]] <= actualLetterNum)
                    outcomeString = outcomeString.substring(0, i) + "1" + outcomeString.substring(i+1);
            }
        }
    }
    return outcomeString;
}
document.addEventListener('keydown', (event) => {
    if(event.repeat)
        return;
    //  https://stackoverflow.com/questions/2257070/detect-numbers-or-letters-with-jquery-javascript
    const input = event.key.toUpperCase();
    console.log(input);
    if(/^[a-zA-Z ]$/.test(input))
        WriteLetter(input);
    else if(input == "BACKSPACE")
        DeleteLetter();
    else if(input == "ENTER")
        Submit();
});

