<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
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
                        <p class="Wordle-Letter">
                            A
                        </p>
                    </div>';
                }
                echo '</div>';
            }
        ?>
        </div>
    </body>

</html>