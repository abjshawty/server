import { FastifyReply, FastifyRequest } from "fastify";
import { Post as Build } from "client";
import { Post as service } from "../services";
import { imageKit } from "../utils";

export const create = async (request: FastifyRequest<{ Body: Build; }>, reply: FastifyReply) => {
    const result = await service.create(request.body);
    reply.send({ success: true, message: 'Post created successfully', data: result });
};

export const list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await service.getAll();
    reply.send({ success: true, message: 'Post list successfully', data: result });
};

export const read = async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
    const result = await service.getById(request.params.id);
    reply.send({ success: true, message: 'Post read successfully', data: result });
};

export const update = async (request: FastifyRequest<{ Body: Build; Params: { id: string; }; }>, reply: FastifyReply) => {
    const result = await service.update(request.params.id, request.body);
    reply.send({ success: true, message: 'Post updated successfully', data: result });
};

export const recycle = async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
    const result = await service.delete(request.params.id);
    reply.send({ success: true, message: 'Post deleted successfully', data: result });
};

export const upload = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.isMultipart) {
        return reply.status(400).send({ success: false, code: 'BAD_REQUEST', message: 'Multipart/form-data is required' });
    }
    const file = await request.file();
    if (!file) {
        return reply.status(400).send({ success: false, code: 'BAD_REQUEST', message: 'File is required' });
    }
    const buffer = await file.toBuffer();
    const result = await imageKit.upload(buffer, file.filename, '/post');
    reply.send({ success: true, message: 'Post uploaded successfully', data: result });
};
