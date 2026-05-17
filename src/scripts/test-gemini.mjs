import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAdKYErKE6utGFYFWr8-Z5PvY0A3KBJI8c");

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    for (const model of models) {
      console.log(`- ${model.name}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(", ")}`);
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();
