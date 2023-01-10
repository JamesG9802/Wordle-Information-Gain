var letters;
var letterPos = 0;

var wordList = [];
window.onload = function() {    //  Initializer
    //  Load Letter Display
    letters = document.getElementsByClassName("Wordle-Letter-Input");
    for(var i = 0; i < letters.length; i++)
        letters[i].innerHTML = "a";  

    //  https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript

    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "./Data/english_five.txt", false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
        wordList = result.split(/\s+/);
    }
    else    {
        document.getElementsByTagName("body")[0].innerHTML = "Couldn't load English database.";
    }
}

function WriteLetter(letter)    //  Safe way to update letters in HTML
{
    if(letterPos >= 29)
        console.log("Character overflow");
    if(letterPos <= 29)
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

document.addEventListener('keydown', (event) => {
    if(event.repeat)
        return;
    //  https://stackoverflow.com/questions/2257070/detect-numbers-or-letters-with-jquery-javascript
    const input = event.key.toUpperCase();
    console.log(event.key);
    if(/^[a-zA-Z ]$/.test(input))
        WriteLetter(input);
    else if(input == "BACKSPACE")
        DeleteLetter();
});

