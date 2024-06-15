import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    uid: v.number(),
    collection: v.string(),
    contractAdmin: v.string(),
    uri: v.string(),
    contractName: v.string(),
    description: v.string(),
  },
  handler: async (
    ctx,
    { uid, collection, contractAdmin, uri, contractName, description }
  ) => {
    return await ctx.db.insert('collections', {
      uid,
      collection,
      contractAdmin,
      uri,
      contractName,
      description,
    });
  },
});
