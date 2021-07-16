import * as React from "react";
import { useState } from "react";

const ComputerVisionClient =
  require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * DO NOT SHARE. This is hard-coded here for rapid prototyping of this project.
 */
var key = "8c382a13dd044dd1a92a4ccb3f0310c9";
var endpoint = "https://westus2.api.cognitive.microsoft.com/";

/**
 * The Video Component for our application, including the video interaction controls.
 */
export const VideoElement = React.memo(function VideoElement(props) {
  const [videoLoaded, setVideoLoaded] = useState("test_file.mp4");
  const speechsdk: any = require("microsoft-cognitiveservices-speech-sdk");

  function computerVision(imageUrl: string, tts: boolean) {
    var computerVisionClient = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
      endpoint
    );

    const rawBase64Arr = imageUrl.split(",");
    const base64String = rawBase64Arr[1];
    const byteArray = base64ToArrayBuffer(base64String);

    var speechSubscriptionKey = "ba6b405e432940cd85fd6d9d894f634d";
    var speechServiceRegion = "eastus";

    const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
    var speechConfig = speechsdk.SpeechConfig.fromSubscription(
      speechSubscriptionKey,
      speechServiceRegion
    );
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

    const synthesizer = new speechsdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    computerVisionClient
      .describeImageInStream(byteArray)
      .then(async (captions) => {
        const description = captions.captions[0].text;
        const confidence = captions.captions[0].confidence;

        if (tts) {
          synthesizer.speakTextAsync(
            description,
            (result) => {
              if (result) {
                synthesizer.close();
                const data = result.audioData;
                if (
                  result.reason ===
                  speechsdk.ResultReason.SynthesizingAudioCompleted
                ) {
                  // note: this is a bit of a hack, ideally we'd have a way of knowing when
                  // the TTS has ended
                  setTimeout(function () {
                    var myVideoElement = document.getElementById("video1");
                    if (myVideoElement) {
                      const myVideo = myVideoElement as HTMLVideoElement;
                      if (myVideo.paused) {
                        myVideo.play();
                      }
                    }
                  }, 4000);
                }
              }
            },
            (error) => {
              console.log(error);
              synthesizer.close();
            }
          );
        }

        console.log(`${description} (confidence=${confidence.toFixed(2)})`);
      });
  }

  function playPause() {
    var myVideoElement = document.getElementById("video1");
    if (myVideoElement) {
      const myVideo = myVideoElement as HTMLVideoElement;
      if (myVideo.paused) {
        myVideo.play();
      } else {
        myVideo.pause();
      }
    }
  }

  function describe() {
    var myVideoElement = document.getElementById("video1");
    if (myVideoElement) {
      const myVideo = myVideoElement as HTMLVideoElement;
      if (!myVideo.paused) {
        myVideo.pause();
      }
      var canvas = document.createElement("canvas");
      canvas.height = myVideo.videoHeight;
      canvas.width = myVideo.videoWidth;
      var ctx = canvas.getContext("2d");
      ctx?.drawImage(myVideo, 0, 0, canvas.width, canvas.height);
      var img = new Image();
      img.src = canvas.toDataURL();
      computerVision(canvas.toDataURL("image/jpeg"), true);
    }
  }

  function loadLionKingVideo(): void {
    setVideoLoaded("lion-king_Trim.mp4");
  }

  function loadDentalVideo(): void {
    setVideoLoaded("dental-video-demo-trim.mp4");
  }

  function loadTravelVideo(): void {
    setVideoLoaded("test_file.mp4");
  }

  function loadGirlWavingVideo(): void {
    setVideoLoaded("arnavi_test.mp4");
  }

  return (
    <div>
      <button onClick={() => playPause()}>Play/Pause</button>
      <button onClick={() => describe()}>Describe</button>
      <br />
      <br />
      <button onClick={() => loadLionKingVideo()}>Load Lion King Video</button>
      <button onClick={() => loadDentalVideo()}>
        Load Dental College Video
      </button>
      <button onClick={() => loadTravelVideo()}>Load Amazon Tribe Video</button>
      <button onClick={() => loadGirlWavingVideo()}>
        Load Basic Wave Video
      </button>
      {videoLoaded === "test_file.mp4" && (
        <video id="video1" width="700" height="500">
          <source id="videoSource" src={"test_file.mp4"} type="video/mp4" />
        </video>
      )}
      {videoLoaded === "arnavi_test.mp4" && (
        <video id="video1" width="700" height="500">
          <source id="videoSource" src={"arnavi_test.mp4"} type="video/mp4" />
        </video>
      )}
      {videoLoaded === "dental-video-demo-trim.mp4" && (
        <video id="video1" width="700" height="500">
          <source
            id="videoSource"
            src={"dental-video-demo-trim.mp4"}
            type="video/mp4"
          />
        </video>
      )}
      {videoLoaded === "lion-king_Trim.mp4" && (
        <video id="video1" width="700" height="500">
          <source
            id="videoSource"
            src={"lion-king_Trim.mp4"}
            type="video/mp4"
          />
        </video>
      )}
    </div>
  );
});
