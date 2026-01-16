/** 
 * Email Utils
 * @description Utils for email. May use Nodemailer or Resend.
 * @module utils/mail
*/
import { Resend } from "resend";
import { env } from "@/helpers";
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
    text?: string,
    replyTo?: string,
    attachments?: {
        filename: string,
        path?: string, // Use path if file is remote. e.g. 'https://resend.com/static/sample/invoice.pdf'
        content?: string, // Use content if file is local. e.g. fs.readFileSync(filepath).toString('base64')
        content_type?: string, // Use content_type if file is local. e.g. 'application/pdf' or 'image/png'
    }[];
}, advancedOptions?: {
    idempotency?: { key: string, event_type: string; };
}) => {
    const selectedAdvancedOptions: { idempotencyKey?: string; } = {};

    if (advancedOptions?.idempotency?.key && advancedOptions?.idempotency?.event_type) {
        selectedAdvancedOptions.idempotencyKey = `${advancedOptions.idempotency.event_type}/${advancedOptions.idempotency.key}`;
    }
    try {
        const info = await getResendInstance().emails.send(mailOptions, selectedAdvancedOptions);
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

export const test = async (appName: string, appVersion: string, from: string, to: string) => {
    return await sendMail({
        from,
        to,
        subject: `Health Check for ${appName} v${appVersion}`,
        html: "<p>The email service is <b>running</b>!</p>",
    });
};
