//  Tracks position of where letters should
var letters;
var letterPos = 0;

var outputLetters;
var outputLetterRow = 0;

//  List of all valid words
var wordList = [];

//  Word to guess
var guessWord;

var guessRestrictions = {0:["[a-z]", ""], 1:["[a-z]", ""], 2:["[a-z]", ""], 3:["[a-z]", ""], 4:["[a-z]",""]};

var found = false;

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
        result = xmlhttp.responseText.toLowerCase();
        wordList = result.split(/\s+/);
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
        guessWord = "";
        for(var i = 0; i < 5; i++)
            guessWord += letters[i].innerHTML.toLowerCase();
        if(wordList.indexOf(guessWord) >= 0)
            FindBestWord();
        else
        {
            document.getElementById("Error-Display").innerHTML = "Please enter an actual word. Example: " + 
            wordList[Math.floor(Math.random() * wordList.length)];
        }
    }
}
function FindBestWord() {
    if(found)
        return;
    console.log(wordList.length);
    /* Naive Approach 
        Go through every possible word and calculate the information gain of each possible word
        Then select the word that would give you the most information.

        for each word, generate each possible outcome
            generate possibility of outcome
            generate information gain of outcome
            store expected information gain
    */
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
    console.log(word + " " + highest + " for " + guessWord);
    
    WriteOutputWordToRow(word);
    WriteOutputInformation(highest);
    outputLetterRow++;
    if(outputLetterRow < 6 && word.toUpperCase() != guessWord.toUpperCase())
    {
        //  Generate OutcomeString from word
        var outcomeString = GenerateOutcomeString(word, guessWord);
        
        //  Update restrictions
        for(var greenLetter = 0; greenLetter < outcomeString.length; greenLetter++)
        {
            if(outcomeString[greenLetter] == "2") //    Only that letter can exist in that spot
            {
                guessRestrictions[greenLetter][0] = word[greenLetter];
            }
        }
        for(var yellowLetter = 0; yellowLetter < outcomeString.length; yellowLetter++)
        {
            if(outcomeString[yellowLetter] == "1") //   Letter cannot exist in that spot
            {
                guessRestrictions[yellowLetter][1] += word[yellowLetter];
            }
        }
        for( var grayLetter = 0; grayLetter < outcomeString.length; grayLetter++)
        {
            if(outcomeString[grayLetter] == "0") //   gray letters cannot be in any sport
            {
                for(var spot = 0; spot < outcomeString.length; spot++)
                    guessRestrictions[spot][1] += word[grayLetter];
            }
        }
        var pattern = "";
        for(const [key, value] of Object.entries(guessRestrictions))
        {
            if(value[1].length == 0)
                pattern += "(" + value[0] +")";
            else
                pattern += "(?=" + value[0] + ")([^" + value[1] + "])";  
        }
        console.log(outcomeString + " " + pattern);
        pattern = new RegExp(pattern);
        var newWordList = [];
        //  word list is shrunk to possible matches
        for(var i = 0; i < wordList.length; i++)
        {
            if(pattern.test(wordList[i]))
                newWordList.push(wordList[i]);
        }
        wordList = newWordList;
        wordList = wordList.filter(function(value, index, arr){ 
            return value != word;   //  previous guess made
        });
        console.log(wordList.length);
    }
    else if(word.toUpperCase() == guessWord.toUpperCase())
    {
        found = true;
        console.log("found");
    }
    else
        console.log("couldn't find word");
}
function GenerateOutcomeString(originalWord, actualWord)  {
    originalWord = originalWord.toUpperCase();
    actualWord = actualWord.toUpperCase();
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

