import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    uid: v.number(),
    text: v.string(),
    tokenURI: v.string(),
    collectionAddress: v.string(),
    contractAdmin: v.string(),
  },
  handler: async (
    ctx,
    { uid, text, tokenURI, collectionAddress, contractAdmin }
  ) => {
    return await ctx.db.insert('tokens', {
      uid,
      text,
      tokenURI,
      collectionAddress,
      contractAdmin,
    });
  },
});

export const getCollectionTokens = query({
  args: { collectionAddress: v.string() },
  handler: async (ctx, { collectionAddress }) => {
    return await ctx.db
      .query('tokens')
      .filter((q) => q.eq(q.field('collectionAddress'), collectionAddress))
      .collect();
  },
});

export const getToken = query({
  args: { uid: v.number(), collectionAddress: v.string() },
  handler: async (ctx, { uid, collectionAddress }) => {
    const token = await ctx.db
      .query('tokens')
      .filter((q) =>
        q.and(
          q.eq(q.field('uid'), uid),
          q.eq(q.field('collectionAddress'), collectionAddress)
        )
      )
      .collect();
    return token[0];
  },
});

export const getAdminTokens = query({
  args: { contractAdmin: v.string() },
  handler: async (ctx, { contractAdmin }) => {
    return await ctx.db
      .query('tokens')
      .filter((q) => q.eq(q.field('contractAdmin'), contractAdmin))
      .collect();
  },
});

export const updateToken = mutation({
  args: { id: v.id('tokens'), text: v.string(), tokenURI: v.string() },
  handler: async (ctx, args) => {
    const { id, text, tokenURI } = args;
    await ctx.db.patch(id, { text, tokenURI });
  },
});

export const deleteToken = mutation({
  args: { id: v.id('tokens') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
