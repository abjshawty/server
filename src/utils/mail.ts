/** 
 * Email Utils
 * @description Utils for email. May use Nodemailer or Resend.
 * @module utils/mail
*/
import { Resend } from "resend";
let _resendInstance: Resend | null = null;

function getResendInstance (): Resend {
    if (!_resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY non configurée dans les variables d\'environnement');
        }
        _resendInstance = new Resend(apiKey);
    }
    return _resendInstance;
}

export const sendMail = async (mailOptions: {
    from: string,
    to: string,
    subject: string,
    html: string,
    text: string;
    replyTo?: string,
}) => {
    try {
        const info = await getResendInstance().emails.send(mailOptions);
        return {
            success: true,
            messageId: info.data?.id,
        };
    } catch (e: any) {
        return {
            success: false,
            error: e,
            messageid: ""
        };
    }
};