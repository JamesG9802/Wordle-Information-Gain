//  Worker Script to run the word score evaluation without blocking the UI
onmessage = function(e) {
    var wordList = e.data[0];
    var threadIndex = e.data[1];
    var threadNumber = e.data[2];
    var frequencyList = e.data[3];
    for(var i = threadIndex; i < wordList.length;i+= threadNumber){
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
        postMessage([i, expectedValue]);
    }
    postMessage([-1, null]);
    close();
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