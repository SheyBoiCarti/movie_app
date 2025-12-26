import { ID, Permission, Query, Role } from "react-native-appwrite";
import {
  account,
  DATABASE_ID,
  databases,
  FAVORITES_COLLECTION_ID,
} from "./Client";

export interface FavoriteItem {
  $id?: string;
  $createdAt?: string;
  userId: string;
  itemId: number;
  // Keep app-facing types lowercase for consistency
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
        // Map to Appwrite enum values ("movie" | "TV")
        type: type === "tv" ? "TV" : "movie",
        title,
        posterpath: posterPath,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    // Normalize response to app-facing shape
    return {
      $id: (favorite as any).$id,
      $createdAt: (favorite as any).$createdAt,
      userId: (favorite as any).userId,
      itemId: (favorite as any).itemId,
      type: (favorite as any).type === "TV" ? "tv" : "movie",
      title: (favorite as any).title,
      posterPath: (favorite as any).posterpath || (favorite as any).posterPath,
    } as FavoriteItem;
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
        // Map to Appwrite enum
        Query.equal("type", type === "tv" ? "TV" : "movie"),
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
        // Map to Appwrite enum
        Query.equal("type", type === "tv" ? "TV" : "movie"),
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
      // Map to Appwrite enum
      queries.push(Query.equal("type", type === "tv" ? "TV" : "movie"));
    }

    const favorites = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      queries
    );

    // Map database response to match our interface
    return favorites.documents.map((doc: any) => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      userId: doc.userId,
      itemId: doc.itemId,
      // Normalize back to lowercase for app usage
      type: doc.type === "TV" ? "tv" : "movie",
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
