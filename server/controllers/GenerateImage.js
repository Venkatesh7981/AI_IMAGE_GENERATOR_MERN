import axios from 'axios';
import * as dotenv from "dotenv";
import { createError } from "../error.js";

dotenv.config();

export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    console.log("Received prompt from frontend:", prompt);

    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 8,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
        output_format: "png"
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
      }
    );

    console.log("Stability API response:", response.data);

    // Extract base64 safely
    const base64Image = response.data?.artifacts?.[0]?.base64;

    if (base64Image) {
      res.status(200).json({ photo: base64Image });
    } else {
      console.log("No image received from Stability AI");
      res.status(500).json({ message: "Failed to generate image" });
    }
  } catch (error) {
    console.error("Image generation failed:", error.response?.data || error.message);
    next(
      createError(
        error?.response?.status || 500,
        error?.response?.data?.message || error.message
      )
    );
  }
};
