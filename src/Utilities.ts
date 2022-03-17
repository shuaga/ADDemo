export const ComputerVisionClient = require("@azure/cognitiveservices-computervision").ComputerVisionClient;
export const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

export function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const speechsdk: any = require("microsoft-cognitiveservices-speech-sdk");
/**
 * DO NOT SHARE. This is hard-coded here for rapid prototyping of this project.
 */
 var key = "8c382a13dd044dd1a92a4ccb3f0310c9";
 var endpoint = "https://westus2.api.cognitive.microsoft.com/";

// function computerVision(imageUrl: string, tts: boolean) {
//     var computerVisionClient = new ComputerVisionClient(
//       new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
//       endpoint
//     );

//     const rawBase64Arr = imageUrl.split(",");
//     const base64String = rawBase64Arr[1];
//     const byteArray = base64ToArrayBuffer(base64String);

//     var speechSubscriptionKey = "ba6b405e432940cd85fd6d9d894f634d";
//     var speechServiceRegion = "eastus";

//     const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();
//     var speechConfig = speechsdk.SpeechConfig.fromSubscription(
//       speechSubscriptionKey,
//       speechServiceRegion
//     );
//     speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

//     const synthesizer = new speechsdk.SpeechSynthesizer(
//       speechConfig,
//       audioConfig
//     );

//     computerVisionClient
//       .describeImageInStream(byteArray)
//       .then(async (captions) => {
//         const description = captions.captions[0].text;
//         const confidence = captions.captions[0].confidence;

//         if (tts) {
//           synthesizer.speakTextAsync(
//             description,
//             (result) => {
//               if (result) {
//                 synthesizer.close();
//                 const data = result.audioData;
//                 if (
//                   result.reason ===
//                   speechsdk.ResultReason.SynthesizingAudioCompleted
//                 ) {
//                   // note: this is a bit of a hack, ideally we'd have a way of knowing when
//                   // the TTS has ended
//                   setTimeout(function () {
//                     if(youTubeVideoUrl === "") {
//                       var myVideoElement = document.getElementById("video1");
//                       if (myVideoElement) {
//                         const myVideo = myVideoElement as HTMLVideoElement;
//                         if (myVideo.paused) {
//                           myVideo.play();
//                         }
//                       } 
//                     } else {
//                       if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
//                         player.playVideo();
//                       }
//                     }
//                   }, 4000);
//                 }
//               }
//             },
//             (error) => {
//               console.log(error);
//               synthesizer.close();
//             }
//           );
//         }

//         console.log(`${description} (confidence=${confidence.toFixed(2)})`);
//       });
//   }