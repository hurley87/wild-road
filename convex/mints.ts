import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    uid: v.number(),
    tokenContract: v.string(),
    mintComment: v.string(),
    minterAccount: v.string(),
    quantityToMint: v.number(),
  },
  handler: async (
    ctx,
    { uid, tokenContract, mintComment, minterAccount, quantityToMint }
  ) => {
    return await ctx.db.insert('mints', {
      uid,
      tokenContract,
      mintComment,
      minterAccount,
      quantityToMint,
    });
  },
});

export const getCollectionTokens = query({
  args: { tokenContract: v.string(), uid: v.number() },
  handler: async (ctx, { tokenContract, uid }) => {
    return await ctx.db
      .query('mints')
      .filter((q) =>
        q.and(
          q.eq(q.field('tokenContract'), tokenContract),
          q.gte(q.field('uid'), uid)
        )
      )
      .collect();
  },
});
