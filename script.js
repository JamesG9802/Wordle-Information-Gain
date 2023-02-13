const MAX_WORKER_COUNT = navigator.hardwareConcurrency;
var threadsFinished = 0;
//  Tracks position of where letters should
var letters;
var letterPos = 0;

var outputLetters;
var outputLetterRow = 0;

//  List of all valid words
var wordList = [];
var frequencyList = {};
//  Word score calculation
var wordScore = {};

//  Word to guess
var guessWord;
var guessRestrictions = {0:["[a-z]", ""], 1:["[a-z]", ""], 2:["[a-z]", ""], 3:["[a-z]", ""], 4:["[a-z]",""]};

var found = false;
var isSolving = false;
var isRunning = false;
var numWords;
window.onload = function() {    //  Initializer
    //  Load Letter Display
    letters = document.getElementsByClassName("Wordle-Letter-Input");
    outputLetters = document.getElementsByClassName("Wordle-Letter-Output");
    for(var i = 0; i < letters.length; i++)
        letters[i].innerHTML = "";  

    //  https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript

    //  Loading Word List
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "./Data/english_five.txt", false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText.toLowerCase().trim();
        wordList = result.split(/\s+/);
    }
    else    {
        document.getElementsByTagName("body")[0].innerHTML = "Couldn't load English database.";
        return;
    }
    //  Loading Frequency Word List
    xmlhttp.open("GET", "./Data/english_five_frequency.txt", false);
    xmlhttp.send();

    if(xmlhttp.status==200) {
        result = xmlhttp.responseText.toLowerCase().trim().split(/\n/);
        //  For consistency, only words from the original 5 letter database have their frequencies checked
        //  also in case a word does not have a frequency, default probability is 1%.
        for(var i = 0; i < wordList.length; i++)
            frequencyList[wordList[i]] = .01;  
        for(var i = 0; i < result.length; i++)
        {
            var line = result[i].split(/\s/);
            var word = line[0];
            var count = line[1];
            if(!(word in frequencyList))    //  word not in list
                continue;
            frequencyList[word] = parseFloat(count) + 1;
        }
        //  Changing frequencies to appropriate probability value
        //  Based on Grant Sanderson (3Blue1Brown)'s implementation
        //  https://github.com/3b1b/videos/blob/master/_2022/wordle/simulations.py
        //  see line 61 as of January 24 2023

        var numCommonWords = 3000;
        var intervalLength = 11;
        var midPoint = intervalLength * (-.5 + numCommonWords / wordList.length);
        var maxPoint = midPoint + intervalLength/2;
        //  https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
        var items = Object.keys(frequencyList).map(function(key) {
            return [key, frequencyList[key]];
        });
        // Sort the array based on the second element
        items.sort(function(first, second) {
            return second[1] - first[1];
        });
        var counter = maxPoint;
        for(var i = 0; i < items.length; i++)
        {
            frequencyList[items[i][0]] = 1/(1+Math.pow(Math.E, -counter));
            counter -= intervalLength / items.length;
        }
    }
    
    //  Listeners
    document.addEventListener('keydown', (event) => {
        if(event.repeat)
            return;
        //  https://stackoverflow.com/questions/2257070/detect-numbers-or-letters-with-jquery-javascript
        const input = event.key.toUpperCase();
        console.log(input);
        if(!isSolving && /^[a-zA-Z ]$/.test(input))
            WriteLetter(input);
        else if(!isSolving && input == "BACKSPACE")
            DeleteLetter();
        else if(!isRunning && input == "ENTER")
            Submit();
    });
    document.getElementById("Mobile-Input").addEventListener("keyup", (event) => {
        const input = event.key.toUpperCase();
        if(input == "ENTER")
        {
            MobileWriteWord();
            Submit();
        }
    });
}

function WriteLetter(letter)    //  Safe way to update letters in HTML
{
    console.log(letter);
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

function WriteOutputWordToRow(word, outputString)  {
    for(var i = 0; i < 5; i++)
    {
        var textElement = outputLetters[outputLetterRow*5 + i];
        textElement.innerHTML = word.toUpperCase()[i]; 

        var classTag = "";
        switch(outputString[i])
        {
            case "0":   // gray
                classTag = "Gray";
                break;
            case "1":   // yellow
                classTag = "Yellow";
                break;
            case "2":
                classTag = "Green";
                break;
        }
        textElement.classList.add("Answered");
        textElement.parentElement.classList.add(classTag);
    }
}
function WriteOutputInformation(value)  {
    https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding
    var with2Decimals = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    var list = document.getElementsByClassName("Wordle-Letter-Information");
    list[outputLetterRow].innerHTML = with2Decimals;
}
function MobileWriteWord()
{
    var text = document.getElementById("Mobile-Input").value.toUpperCase();
    for(var i = 0; i < 5; i++)
        DeleteLetter();
    for(var i = 0; i < text.length; i++)
        WriteLetter(text[i]);
}
function Submit(){
    if(letterPos == 5)
    {    
        guessWord = "";
        for(var i = 0; i < 5; i++)
            guessWord += letters[i].innerHTML.toLowerCase();
        if(wordList.indexOf(guessWord) >= 0)
        {
            document.getElementById("Mobile-Input").disabled = true;
            isSolving = true;
            FindBestWord();
        }    
        else
        {
            document.getElementById("Error-Display").innerHTML = "Please enter an actual word. Example: " + 
            wordList[Math.floor(Math.random() * wordList.length)];
        }
    }
}
//  Web Worker Not Supported Version
function CalculateWordScore(i)   {
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
//  Web Worker Not Supported Version
function CalculateWordScoreWithFrequency(i)   {
    var expectedValue = 0.0;
    var outcomes = {};
    for(var j = 0; j < wordList.length; j++){
        var outcome = GenerateOutcomeString(wordList[i], wordList[j]);
        if(!(outcome in outcomes))
        //  Probability now considers frequency as well
            outcomes[outcome] = 1.0/wordList.length * frequencyList[wordList[j]];
        else
            outcomes[outcome]+= 1.0/wordList.length * frequencyList[wordList[j]];
    }
    for(const [key, value] of Object.entries(outcomes))
    {
        expectedValue += value //  probability
        * -Math.log(value) / Math.log(2);  //  information gain -log2(probability)
    }
    wordScore[wordList[i]] = expectedValue;
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
    isRunning = true;
    if(window.Worker)
    {
        wordScore = {};
        threadsFinished = 0;
        numWords = 0;
        document.getElementById("ProgressBar").setAttribute("style", "width:100%;");
        if(document.getElementById("ProgressBar_Finished") != null)
        {
            document.getElementById("ProgressBar_Finished").setAttribute("style", "width:0%;");
            document.getElementById("ProgressBar_Finished").setAttribute("id", "ProgressBar_Cover");
        }
        for(var i = 0; i < MAX_WORKER_COUNT; i++)
        {
            const workerThread = new Worker("calculate.js");
            workerThread.postMessage([wordList, i, MAX_WORKER_COUNT, frequencyList]);

            workerThread.onmessage = function(e) {
                if(e.data[0] >= 0)
                {    
                    wordScore[wordList[e.data[0]]] = e.data[1];
                    numWords++;
                    document.getElementById("ProgressBar_Cover").setAttribute("style", 
                        "width:"+ (100*numWords/wordList.length) +"%;");
                }
                else 
                    threadsFinished++;
                if(threadsFinished == MAX_WORKER_COUNT)
                {
                    document.getElementById("ProgressBar_Cover").setAttribute("style", "width:100%");
                    document.getElementById("ProgressBar_Cover").setAttribute("id", "ProgressBar_Finished");
                    ChooseAnswer();
                }
            }
        }  
    }
    else    //  Web Workers not supported
    {
        alert("Warning: Web Workers are not supported on this browser. The application may take a few minutes to finish running as a result.");
        var i = 0;
        while(i < wordList.length)
        {
            setTimeout(CalculateWordScore(i),0);
            i++;
        }
        ChooseAnswer();
    }
}
function ChooseAnswer() {
    isRunning = false;
    document.getElementById("Solver").innerText = "Continue Solving";
    var highest = -1;
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
    
    //  Generate OutcomeString from word
    var outcomeString = GenerateOutcomeString(word, guessWord);
    WriteOutputWordToRow(word, outcomeString);
    WriteOutputInformation(highest);
    outputLetterRow++;
    if(outputLetterRow < 6 && word.toUpperCase() != guessWord.toUpperCase())
    {
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
            if(outcomeString[grayLetter] == "0") //   there are no more more gray letters in spots except in 
            {
                var matchingYellowFlag = false;

                for(var spot = 0; spot < outcomeString.length; spot++)
                    if(outcomeString[spot] == "1" && outcomeString[spot] == word[grayLetter])   //  yellow letter match gray
                    {
                        matchingYellowFlag = true;
                        break;
                    }
                if(matchingYellowFlag)  
                //  if a gray letter matches a yellow letter, 
                //  all that can be done is that gray cant be the letter.
                {
                    guessRestrictions[grayLetter][1] += word[grayLetter];
                    break;
                }
                for(var spot = 0; spot < outcomeString.length; spot++)  // no yellow letter match
                {
                    if(outcomeString[spot] == "2" && word[spot] == word[grayLetter])   // green letter match
                        continue;
                    guessRestrictions[spot][1] += word[grayLetter];
                }
                    // by cases:
                    // gray letter is unique in word
                    //      add letter to all spot's restrictions
                    // gray letter matches green letter
                    //      if letter is green, do nothing
                    // gray letter matches gray letter
                    //      add letter to all spot's restrictions
                    // gray letter matches yellow letter
                    //      add letter to restriction only in gray letter spot
                    // gray letter matches green + yellow
                    //      if letter is green, do nothing
                    //
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
    else{
        if(word.toUpperCase() == guessWord.toUpperCase())
        {
            found = true;
            console.log("found");
        }
        else
            console.log("couldn't find word");
        ShareResults();
    }
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
        if(outcomeString[i] == "2") // green > yellow so continue
            continue;
        //  Checking if the word is in the word but in the wrong spot
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
function ShareResults()
{
    var shareString = "Wordle Solver ";
    if(found)
        shareString += outputLetterRow + "/6\n";
    else
        shareString += "x/6\n";
    //  Generating string from each word
    for(var i = 0; i < outputLetterRow; i++)
    {
        for(var j = 0; j < 5; j++)
        {
            if(outputLetters[i * 5 + j].parentElement.classList.contains("Gray"))
                shareString+="🟩";
            else if(outputLetters[i * 5 + j].parentElement.classList.contains("Yellow"))
                shareString+="🟨";
            else
                shareString+="⬜";
        }
        shareString+="\n";
    }
    navigator.clipboard.writeText(shareString);
}
