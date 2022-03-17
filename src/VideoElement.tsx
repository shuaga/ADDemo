import * as React from "react";
import { useState } from "react";
import axios from 'axios';

let player;
let captureStream;
let track;
let video: HTMLVideoElement;

(window as any).onYouTubeIframeAPIReady = () => {
  player = new YT.Player('youtubeiframe', {});
}

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
  }, []);

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

      // The zoom level on the user screen can be different from 100%. 
      // We want to capture the entire screen and crop the relevant part.
      // The tempCanvas creates a replica of the user screen; from which the relevant image is drawn into canvas.
      // If tempCanvas is not used, then the scaling goes off and it only works when the browser zoom is set to 100%.
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = window.innerWidth;
      tempCanvas.height = window.innerHeight;
      const tempContext = tempCanvas.getContext("2d");
      tempContext?.drawImage(bitmap, 0, 0, tempCanvas.width, tempCanvas.height);
      context?.drawImage(tempCanvas, posX, posY, width, height, 0, 0, width, height);
      captionImage(canvas.toDataURL("image/png"), true);

      //This is for debugging to see the captured screenshot.
      const pic = document.getElementById("picture")!;
      if(pic.childElementCount > 0)
        pic.replaceChild(canvas,pic.children[0]);
      else
        pic.appendChild(canvas);

      playPause();
    } 
    catch (err) {
      console.error("Error: " + err);
    }
  };

  async function captionImage(imageUrl: string, tts: boolean) {
    if (tts) {
      const result = await axios.post('../api/CaptionImage', { imageUrl: imageUrl });
      console.log(`${result.data.description} (confidence=${result.data.confidence.toFixed(2)})`);
      const utterance = new SpeechSynthesisUtterance(result.data.description);
      utterance.onend = () => {
        if (youTubeVideoUrl === "") {
          var myVideoElement = document.getElementById("video1");
          if (myVideoElement) {
            const myVideo = myVideoElement as HTMLVideoElement;
            if (myVideo.paused) {
              myVideo.play();
            }
          }
        }
        else {
          if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
            player.playVideo();
          }
        }
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  function playPause() {
    if (youTubeVideoUrl === "") {
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
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  }

  async function describe() {
    if (youTubeVideoUrl === "") {
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
        captionImage(canvas.toDataURL("image/jpeg"), true);
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

  const SampleVideo = (props: { src: string }): JSX.Element => {
    return (
      <video id="video1" width="700" height="500">
        <source id="videoSource" src={props.src} type="video/mp4" />
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

      <div style={{ marginTop: 30 }}>
        <input id="youtubevideolinkinput" width={200} placeholder="Enter YouTube link" title="Enter YouTube link" />
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
      {youTubeVideoUrl === "" && <SampleVideo src={videoLoaded} key={videoLoaded} />}
      {youTubeVideoUrl !== "" && <div style={{ marginTop: 30 }}>
        <iframe id="youtubeiframe" width="640" height="360" title="youtube video"
          src={`https://www.youtube.com/embed/` + youTubeVideoUrl.substring(youTubeVideoUrl.lastIndexOf("/")) + `?controls=0&enablejsapi=1&rel=0`}>
        </iframe>
      </div>}
      {/* The below div is used to render the captured screenshot for debugging purposes */}
      <div id="picture" style={{ marginTop: 60, backgroundColor: 'gray' }}></div>
    </div>
  );
});