module.exports = async function (context, req) {
    /**
    * DO NOT SHARE. This is hard-coded here for rapid prototyping of this project.
    */
    /*const key = "8c382a13dd044dd1a92a4ccb3f0310c9";
    const endpoint = "https://westus2.api.cognitive.microsoft.com/";
    
    const ComputerVisionClient = require("@azure/cognitiveservices-computervision").ComputerVisionClient;
    const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;
    const computerVisionClient = new ComputerVisionClient(new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }), endpoint);

    const imageUrl = req && req.body && req.body.imageUrl;
    const rawBase64Arr = imageUrl.split(",");
    const base64String = rawBase64Arr[1];
    const byteArray = base64ToArrayBuffer(base64String);

    const captions = await computerVisionClient.describeImageInStream(byteArray);
    const description = captions.captions[0].text;
    const confidence = captions.captions[0].confidence;

    context.res = {
        body: {
            description: description,
            confidence: confidence
        }
    }*/
    context.res = {
        body: "HelloWorld"
    }
}

const atob = (base64) => {
    return Buffer.from(base64, 'base64').toString('binary');
};

const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};
