<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head></head>
    <body>
        <div class="Wordle-Board">
        <?php 
            //  Wordle board
            for($i = 0; $i < 6; $i++)   //  Rows
            {
                echo '<div class="Wordle-Row">';
                for($j = 0; $j < 5; $j++)   //  Letters
                {
                    echo '<div class="Wordle-Letter"></div>';
                }
                echo '</div>';
            }
        ?>
        </div>
    </body>

</html>