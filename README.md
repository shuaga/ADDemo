# Video frame-by-frame description
This is an application where upon pausing a video that is playing, you can analyze the image of the frame. To get started:

```
npm install
npm run build
npm run start
```

After which navigating to localhost:3000 will get you to the video description application. Toggle the play/pause button to pause the video
at various frames and get descriptions of the image. 
Currently the descriptions show up in your browser's console log.
To load a YouTube video, head over to YouTube video, use the share button to get the link for the YouTube video. Paste that link in the input box of the app and hit the load YouTube video button.

For local development, hot reload would work if you make the following changes - 
In index.html replace 'dist/main.js' with 'main.js'