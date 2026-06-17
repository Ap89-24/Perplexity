import dotenv from "dotenv";
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",                   //@description ->  Using OAuth2 for secure authentication with Gmail
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        clientId: process.env.GOOGLE_CLIENT_ID,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});

/* 
@description: Verify the transporter configuration
*/

transporter.verify((error , success) => {
    if(error){
        console.error("Error in transporter configuration: ", error);
    }
    else  {
        console.log("Transporter configuration is correct. Ready to send emails.");
    }
});



/* 
@description: Send an email using the configured transporter
*/

const sendEmail = async ({to, subject, html, text}) => {
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    const details = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", details);
    return details;
};


export default sendEmail;