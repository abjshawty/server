import { mail } from "@/utils";
import { name, version } from '../../package.json';
import { env } from '@/helpers';

export const email = async () => {
    const result = await mail.test();
    return result;
};