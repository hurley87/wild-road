import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    collectionAddress: v.string(),
    contractAdmin: v.string(),
    contractName: v.string(),
    contractURI: v.string(),
    username: v.string(),
    pfp: v.string(),
  },
  handler: async (
    ctx,
    {
      collectionAddress,
      contractAdmin,
      contractName,
      contractURI,
      username,
      pfp,
    }
  ) => {
    return await ctx.db.insert('collections', {
      collectionAddress,
      contractAdmin,
      contractName,
      contractURI,
      username,
      pfp,
    });
  },
});

export const getCollection = query({
  args: { collectionAddress: v.string() },
  handler: async (ctx, { collectionAddress }) => {
    const collection = await ctx.db
      .query('collections')
      .filter((q) => q.eq(q.field('collectionAddress'), collectionAddress))
      .collect();
    return collection[0];
  },
});

export const getAdminCollections = query({
  args: { contractAdmin: v.string() },
  handler: async (ctx, { contractAdmin }) => {
    return await ctx.db
      .query('collections')
      .filter((q) => q.eq(q.field('contractAdmin'), contractAdmin))
      .collect();
  },
});
