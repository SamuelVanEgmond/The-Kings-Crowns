# The King's Crowns

After centuries of reverence and grave robbing,<br>
By bandits, emperors and pharao's alike,<br> 
The Tomb of Alexander the Great was destroyed,<br> 
Presumed lost for ever.<br> 

Unbeknownst to all, the body of the King was re-taken,<br>
To be interred in his home country.<br>
Now, there in the ancient mountains of Macedonia,<br>
Alexander rests for ever, in the Valley of the King.<br>

But even now his tomb is not safe, not safe from you!<br>
After years of travel and research,<br>
You have located the Valley of the King,<br>
Where now you must solve the final riddle;<br>

~~~
The King's Crowns

13 crowns King Alexander possessed
13 crowns by the Devil oppressed
13 crowns for Day and Night
13 crowns that show the King’s might
13 crowns with a cursed spell
13 crowns that lead to Hell!
~~~

# Gameplay

Play on desktop (AWSD + Mouse + Mouse click)
Play on Quest (thumbstick (both to run) and trigger)

# Hints
- Yellow Day Crowns can only be found by Night.
- Blue Night Crowns can only be found by Day.
- Use the Sun Gate to switch from day to night and back.
- If you are color blind, watch the different crown rotations to locate the crowns.

# Publishing for Js13kGames 2024

- Use .../publish.html wich combines all js files and does some early minifying
- Then manually minify at https://www.uglifyjs.net/
- Use:
    - Mangle names
    - NOT: Mangle properties !!
    - Mangle function names
    - Mangle variables in top level scope    
- Then use https://lifthrasiir.github.io/roadroller/
- Note that Road Roller has some bugs sometimes the resulting code does not work
    - Optimize parameters to reduce size
    - Playing around with the advanced parameters can reduce Road Roller size even more but may increase .zip size...
    - In case of bug unexpected token 'charCodeAtUinyxp' try Allow the decoder to pollute the global scope
    - In case of bug with unterminated regex expression try to reduce the number of abbriviations
- Copy the Road Roller code in the index.html
- Clean up  the index.html
- Zip the resulting file

# Known Issues

- When dropping out of VR the camera is on the ground in Quest the adress bar 'Enter VR' button does not fix it, 
  the normal VR button on screen does work correctly.
- Quest 3 maintains 90 fps, but Quest 2 fluctuates between 45 fps (looking from the edges to the center) and 70 fps. 
  This can easily be solved by reducing the settings in constants.js.