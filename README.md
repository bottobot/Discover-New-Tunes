# Discover New Tunes
A web application that helps you discover new music by extracting artist names from festival lineup images and finding their music on streaming platforms.

Orginally I started project as a fork of a friends previous work and concept but I ended up doing a few very different iterations as an experiment to see which would work best.
I started out with a simple framework and baked in OCR libraries that ran locally on a users device but soon found they were nowhere good enough to read 
the type of text one finds on concert or festival posters. Every artist has custom fonts and the structure of the posters changes so much from one to the next.
This meant I needed a much more powerful OCR solution. After trying a few different models I settled on a cloud hosted Google Vision API and on Vercel for testing which produced 
much more reliable outputs. And instead of a web search I used the Spotify API that was available at the time. Soundcloud has closed their API so we used a web search there instead.  

However even with using Google Vision two main issues remained. Overall the theoretical costs skyrocketed. Instead of an app that ran locally and utilized open source
OCR libraries to do the heavy lifting, it now required a server side solution which meant all data had to be transmitted, computed and hosted remotely. This vastly increased 
the scope of the project. 
The second was that I was getting way too many bad results for it to be useful and it became clear that for it to get an acceptable rate of return it would require 
a lot of manual fine tuning or even a fully custom trained ML model of my own. 

I learned a huge amount in the process and it was super fun but this project is paused for the forseeable future.
