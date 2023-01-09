var letters;
var letterPos = 0;

window.onload = function() {    //  Initializer
    letters = document.getElementsByTagName("p");
    for(var i = 0; i < letters.length; i++)
        letters[i].innerHTML = " ";
    
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
