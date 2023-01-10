<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <link rel="stylesheet" href="styles.css">
        <script type="text/javascript" src="script.js"></script> 
    </head>
    <body>
        <div class="Page-Content">
            <div class="Desc">
                <p>Enter a word using the keyboard. Mobile support WIP. Press Enter to run the solver. Allow for a few minutes for the initial guesses.</p>
            </div>
            <div class="Wordle-Board">
            <p id="Error-Display"></p>
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