import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    uid: v.number(),
    text: v.string(),
    collectionId: v.id('collections'),
    collectionAddress: v.string(),
    contractAdmin: v.string(),
    metadataCode: v.string(),
    imageCode: v.string(),
    image: v.string(),
    imageDescription: v.optional(v.string()),
    imageName: v.string(),
    zoraUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      uid,
      text,
      collectionId,
      collectionAddress,
      contractAdmin,
      metadataCode,
      imageCode,
      image,
      imageDescription,
      imageName,
      zoraUrl,
    }
  ) => {
    const tokens = await ctx.db
      .query('tokens')
      .filter((q) => q.eq(q.field('collectionId'), collectionId))
      .collect();
    const order = tokens ? tokens.length + 1 : 0;
    return await ctx.db.insert('tokens', {
      uid,
      text,
      collectionId,
      collectionAddress,
      contractAdmin,
      metadataCode,
      imageCode,
      image,
      imageDescription,
      imageName,
      zoraUrl,
      order,
    });
  },
});

export const getCollectionTokens = query({
  args: { id: v.id('collections') },
  handler: async (ctx, { id }) => {
    return await ctx.db
      .query('tokens')
      .filter((q) => q.eq(q.field('collectionId'), id))
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

export const getTokenByOrder = query({
  args: { order: v.number(), collectionAddress: v.string() },
  handler: async (ctx, { order, collectionAddress }) => {
    const token = await ctx.db
      .query('tokens')
      .filter((q) =>
        q.and(
          q.eq(q.field('order'), order),
          q.eq(q.field('collectionAddress'), collectionAddress)
        )
      )
      .collect();
    return token[0];
  },
});

export const getTokenById = query({
  args: { tokenId: v.id('tokens') },
  handler: async (ctx, { tokenId }) => {
    return await ctx.db.get(tokenId);
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
  args: {
    id: v.id('tokens'),
    text: v.string(),
    imageCode: v.string(),
    metadataCode: v.string(),
    image: v.optional(v.string()),
    imageName: v.optional(v.string()),
    imageDescription: v.optional(v.string()),
    zoraUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      id,
      text,
      imageCode,
      metadataCode,
      image,
      imageName,
      imageDescription,
      zoraUrl,
    } = args;
    await ctx.db.patch(id, {
      text,
      imageCode,
      metadataCode,
      image,
      imageName,
      imageDescription,
      zoraUrl,
    });
  },
});

export const deleteToken = mutation({
  args: { id: v.id('tokens') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
