import { ID, Permission, Query, Role } from "react-native-appwrite";
import {
  account,
  DATABASE_ID,
  databases,
  FAVORITES_COLLECTION_ID,
} from "./Client";

export interface FavoriteItem {
  $id?: string;
  userId: string;
  itemId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string;
}

/**
 * Add a movie or TV show to favorites
 */
export const addToFavorites = async (
  itemId: number,
  type: "movie" | "tv",
  title: string,
  posterPath: string
): Promise<FavoriteItem> => {
  try {
    const user = await account.get().catch(() => null);
    if (!user) {
      throw new Error("Please login to add favorites");
    }

    const favorite = await databases.createDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      ID.unique(),
      {
        userId: user.$id,
        itemId,
        type,
        title,
        posterpath: posterPath,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    return favorite as unknown as FavoriteItem;
  } catch (error: any) {
    // Only log unexpected errors, not authentication errors
    if (!error?.message?.includes("login")) {
      console.error("Error adding to favorites:", error);
    }
    throw error;
  }
};

/**
 * Remove a movie or TV show from favorites
 */
export const removeFromFavorites = async (
  itemId: number,
  type: "movie" | "tv"
): Promise<void> => {
  try {
    const user = await account.get().catch(() => null);
    if (!user) {
      throw new Error("Please login to remove favorites");
    }

    // Find the document first
    const favorites = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("itemId", itemId),
        Query.equal("type", type),
      ]
    );

    if (favorites.documents.length > 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        FAVORITES_COLLECTION_ID,
        favorites.documents[0].$id
      );
    }
  } catch (error: any) {
    // Only log unexpected errors, not authentication errors
    if (!error?.message?.includes("login")) {
      console.error("Error removing from favorites:", error);
    }
    throw error;
  }
};

/**
 * Check if a movie or TV show is in favorites
 */
export const isFavorite = async (
  itemId: number,
  type: "movie" | "tv"
): Promise<boolean> => {
  try {
    const user = await account.get().catch(() => null);
    if (!user) {
      return false; // Not logged in means no favorites
    }

    const favorites = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("itemId", itemId),
        Query.equal("type", type),
      ]
    );

    return favorites.documents.length > 0;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

/**
 * Get all favorites for the current user
 */
export const getFavorites = async (
  type?: "movie" | "tv"
): Promise<FavoriteItem[]> => {
  try {
    const user = await account.get().catch(() => null);
    if (!user) {
      throw new Error("Please login to view favorites");
    }

    const queries = [Query.equal("userId", user.$id)];

    if (type) {
      queries.push(Query.equal("type", type));
    }

    const favorites = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      queries
    );

    // Map database response to match our interface
    return favorites.documents.map((doc: any) => ({
      $id: doc.$id,
      userId: doc.userId,
      itemId: doc.itemId,
      type: doc.type,
      title: doc.title,
      posterPath: doc.posterpath || doc.posterPath, // Handle both cases
    })) as FavoriteItem[];
  } catch (error: any) {
    // Only log unexpected errors, not authentication errors
    if (!error?.message?.includes("login")) {
      console.error("Error fetching favorites:", error);
    }
    throw error;
  }
};

/**
 * Toggle favorite status - adds if not favorited, removes if already favorited
 */
export const toggleFavorite = async (
  itemId: number,
  type: "movie" | "tv",
  title: string,
  posterPath: string
): Promise<boolean> => {
  const favorited = await isFavorite(itemId, type);

  if (favorited) {
    await removeFromFavorites(itemId, type);
    return false; // No longer a favorite
  } else {
    await addToFavorites(itemId, type, title, posterPath);
    return true; // Now a favorite
  }
};
