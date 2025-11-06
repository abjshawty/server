import axios from 'axios';
import FormData from 'form-data';
import { env } from '../helpers';

class ImageHandler {
    private authHeader: string;
    private upload_url: string;
    constructor () {
        if (!env.imageKitApiKey) {
            throw new Error('ImageKit API Key is not defined');
        }
        this.authHeader = "Basic " + Buffer.from(env.imageKitApiKey + ':').toString('base64');
        this.upload_url = "https://upload.imagekit.io/api/v2/files/upload";
    }
    async upload (file: Buffer, fileName: string, folder: string = `/${env.apiName}`) {
        const form = new FormData();
        form.append('file', file, fileName);
        form.append('fileName', fileName);
        form.append('folder', folder);

        try {
            const { data } = await axios.post(this.upload_url, form, {
                headers: {
                    ...form.getHeaders(),
                    'Accept': 'application/json',
                    'Authorization': this.authHeader
                }
            });
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };
}

export default new ImageHandler();