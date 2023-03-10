<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <link rel="stylesheet" href="styles.css">
        <script type="text/javascript" src="script.js"></script> 
    </head>
    <body>
        <div class="Page-Content">
            <div class="Desc">
                <p>This is an algorithmic solver for the puzzle game Wordle. 
                    Enter a word that the computer will try to solve using the keyboard. 
                    Press Enter or the button to run the solver.
                </p>
                <div id="Share-Button">
                    <button class="Button" onclick="ShareResults()">Share</button>
                </div>
            </div>
            <div style="align-items: center;"class="Wordle-Board">
                <p id="Error-Display"></p>
                <label for="Mobile-Input">Mobile Input</label>
                <input id="Mobile-Input" class="Mobile-Input" 
                size="5"
                minlength="5"
                maxlength="5"
                pattern="[a-zA-Z]"
                name="Mobile-Input" type="text"/>
                <button class="Button" onclick="MobileWriteWord()">Set Mobile input</button>
                <?php 
                    //  Wordle board
                    echo '<div class="Wordle-Row">';
                    for($j = 0; $j < 5; $j++)   //  Letters
                    {
                        echo 
                        '<div class="Wordle-Letter-Container">
                            <p class="Wordle-Letter-Input">
                                
                            </p>
                        </div>';
                    }
                    echo '</div>';
                ?>
                <button id="Solver" class="Button" onclick="Submit()">Run Solver</button>
                <div id="ProgressBar">
                    <div id ="ProgressBar_Cover"></div>
                </div>
            </div>
            <div class="Wordle-Board">
            <?php 
                //  Wordle board
                for($i = 0; $i < 6; $i++)   //  Rows
                {
                    echo '<div class="Wordle-Row">';
                    for($j = 0; $j < 5; $j++)   //  Letters
                    {
                        echo 
                        '<div class="Wordle-Letter-Container">
                            <p class="Wordle-Letter-Output">
                                
                            </p>
                        </div>';
                    }
                    echo '<div class="Wordle-Letter-Information"></div></div>';
                }
            ?>
            </div>
        </div>
    </body>

</html>