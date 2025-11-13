const {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} =require("@google/genai");
const fs=require("node:fs")

const ai = new GoogleGenAI({
      apiKey: "AIzaSyDPuz95P3HK5ym3MQXcWEbb24MGfwDA8jc"

});

async function main() {
  const image = await ai.files.upload({
    file: path,
  });
  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: [
      createUserContent([
        "Tell about name and detect any disease in this crop in english language",
        createPartFromUri(image.uri, image.mimeType),
      ]),
    ],
  });
   for await (const chunk of response) {
    
    fs.appendFileSync("output.txt", chunk.text);
      console.log(chunk.text);
  }

  
}

 main();