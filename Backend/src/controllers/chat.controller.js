import { generateResponse,  generateTitle } from "../services/ai.service.js";




export const sendMessage = async (req, res) => { 
    const { message } = req.body;
    
    const title = await generateTitle(message);
    console.log(title);
    const result = await generateResponse(message);

    return res.status(200).json({
        AIResponse: result,
        title
    })

};




