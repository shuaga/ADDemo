import * as React from "react";
import { useState } from "react";
import { ApiKeyCredentials, base64ToArrayBuffer, ComputerVisionClient } from "./Utilities";

/**
 * DO NOT SHARE. This is hard-coded here for rapid prototyping of this project.
 */
var key = "8c382a13dd044dd1a92a4ccb3f0310c9";
var endpoint = "https://westus2.api.cognitive.microsoft.com/";

let player;
(window as any).onYouTubeIframeAPIReady = () => {
  player = new YT.Player('youtubeiframe', {});
}

let captureStream;
let track;
let video: HTMLVideoElement;

/**
 * The Video Component for our application, including the video interaction controls.
 */
export const VideoElement = React.memo(function VideoElement(props) {
  const [videoLoaded, setVideoLoaded] = useState("test_file.mp4");
  const [youTubeVideoUrl, setYouTubeVideoUrl] = useState<string>("");
  React.useEffect(() => {
    navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true } as DisplayMediaStreamConstraints).then(stream => {
      captureStream = stream;
      track = captureStream.getVideoTracks()[0];

      // This is a hack. Even though this video element is not being used for any purpose.
      // Right now, removing this video element makes the videostream track to go into an inconsistent state.
      video = document.createElement("video");
      video.srcObject = captureStream;
    });
  },[]);

  const speechsdk: any = require("microsoft-cognitiveservices-speech-sdk");

  const capture = async () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const offsets = document.getElementById("youtubeiframe")?.getBoundingClientRect();
    const posX = offsets?.left!;
    const posY = offsets?.top!;
    const width = offsets?.width!;
    const height = offsets?.height!;
    canvas.width = width;
    canvas.height = height;
  
    try {
      let image = new ImageCapture(track);
      const bitmap = await image.grabFrame();
      context?.drawImage(bitmap, posX, posY, width, height, 0, 0, width, height);
      computerVision(canvas.toDataURL("image/png"), true);
      const pic = document.getElementById("picture")!;
      pic.appendChild(canvas);
      playPause();
    } catch (err) {
      console.error("Error: " + err);
    }
  };

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
                    if(youTubeVideoUrl === "") {
                      var myVideoElement = document.getElementById("video1");
                      if (myVideoElement) {
                        const myVideo = myVideoElement as HTMLVideoElement;
                        if (myVideo.paused) {
                          myVideo.play();
                        }
                      } 
                    } else {
                      if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
                        player.playVideo();
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
    if(youTubeVideoUrl === "") {
      var myVideoElement = document.getElementById("video1");
      if (myVideoElement) {
        const myVideo = myVideoElement as HTMLVideoElement;
        if (myVideo.paused) {
          myVideo.play();
        } else {
          myVideo.pause();
        }
      }
    } else {
      if(player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  }

  function describe() {
    if(youTubeVideoUrl === "") {
      const myVideoElement = document.getElementById("video1");
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
        computerVision(canvas.toDataURL("image/jpeg"), true);
      }
    } else {
      capture();
    }
  }

  function loadSampleVideo(videoId: string): void {
    setVideoLoaded(videoId);
    setYouTubeVideoUrl("");
  }

  const SampleVideoButtons = (): JSX.Element => {
    return (
      <>
        <button onClick={() => loadSampleVideo("lion-king_Trim.mp4")}>Load Lion King Video</button>
        <button onClick={() => loadSampleVideo("dental-video-demo-trim.mp4")}> Load Dental College Video </button>
        <button onClick={() => loadSampleVideo("test_file.mp4")}>Load Amazon Tribe Video</button>
        <button onClick={() => loadSampleVideo("arnavi_test.mp4")}> Load Basic Wave Video</button></>
    );
  }
  
  const SampleVideo = (props: {src: string}): JSX.Element => {
    return (
      <video id="video1" width="700" height="500">
        <source id="videoSource" src={props.src} type="video/mp4"/>
      </video>);
  }

  const loadYouTubeVideo = () => {
    const videoUrl = (document.getElementById("youtubevideolinkinput") as any)?.value;
    setYouTubeVideoUrl(videoUrl);

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
  }

  return (
    <div>
      <h1>
        Video Description Prototype
      </h1>
      <h2>
        Choose a Video to Load
      </h2>
      <SampleVideoButtons />

      <div style={{marginTop: 30}}>
          <input id="youtubevideolinkinput" width={200} placeholder="Enter YouTube link" title="Enter YouTube link"/>
          <button onClick={() => loadYouTubeVideo()}>
              Load YouTube Video
          </button>
      </div>
      <br />
      <br />
      <h2>Video + Controls</h2>
      <button onClick={() => playPause()}>Play/Pause</button>
      <button onClick={() => describe()}>Describe</button>
      <br />
      { youTubeVideoUrl === "" && <SampleVideo src={videoLoaded} key={videoLoaded}/> }
      {youTubeVideoUrl !== "" && <div style={{marginTop:30}}>
        <iframe id="youtubeiframe" width="640" height="360" 
          src={`https://www.youtube.com/embed/` + youTubeVideoUrl.substring(youTubeVideoUrl.lastIndexOf("/")) + `?controls=0&enablejsapi=1&rel=0`}>
        </iframe>
      </div>}
      {/* The below div is used to render the captured screenshot for debugging purposes */}
      <div id="picture"></div> 
    </div>
  );
});