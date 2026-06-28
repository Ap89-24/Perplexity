import generateResponse from "../services/ai.service.js";




export const sendMessage = async (req, res) => { 
    const { message } = req.body;
    
    const result = await generateResponse(message);

    return res.status(200).json({
        AIResponse: result
    })

};




