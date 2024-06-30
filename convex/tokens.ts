import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    uid: v.number(),
    block: v.any(),
    tokenURI: v.string(),
    metadataURI: v.string(),
    collectionAddress: v.string(),
    contractAdmin: v.string(),
  },
  handler: async (
    ctx,
    { uid, block, tokenURI, metadataURI, collectionAddress, contractAdmin }
  ) => {
    return await ctx.db.insert('tokens', {
      uid,
      block,
      tokenURI,
      metadataURI,
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

export const getAdminTokens = query({
  args: { contractAdmin: v.string() },
  handler: async (ctx, { contractAdmin }) => {
    return await ctx.db
      .query('tokens')
      .filter((q) => q.eq(q.field('contractAdmin'), contractAdmin))
      .collect();
  },
});
