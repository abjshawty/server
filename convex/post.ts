import { mutation, query, internalAction } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("posts", {
            title: args.title,
            content: args.content,
        });
    }
});

export const getPosts = query({
    args: {
        title: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const posts = args.title
            ? await ctx.db.query("posts").filter(q => q.eq(q.field("title"), args.title)).take(10)
            : await ctx.db.query("posts").take(10);
        return posts;
    }
});