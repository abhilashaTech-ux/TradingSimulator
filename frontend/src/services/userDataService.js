import { db } from "./firebase";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";


// =====================================
// GET USER PORTFOLIO
// =====================================

export async function getUserPortfolio(userId) {
  try {
    const userRef = doc(db, "users", userId);

    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      return userSnapshot.data().portfolio || [];
    }

    return [];

  } catch (error) {
    console.error(
      "Error getting portfolio:",
      error
    );

    throw error;
  }
}


// =====================================
// SAVE USER PORTFOLIO
// =====================================

export async function saveUserPortfolio(
  userId,
  portfolio
) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    await setDoc(
      userRef,
      {
        portfolio: portfolio || [],
      },
      { merge: true }
    );

    return true;

  } catch (error) {
    console.error(
      "Error saving portfolio:",
      error
    );

    throw error;
  }
}


// =====================================
// GET USER WATCHLIST
// =====================================

export async function getUserWatchlist(userId) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (userSnapshot.exists()) {
      return (
        userSnapshot.data().watchlist || []
      );
    }

    return [];

  } catch (error) {
    console.error(
      "Error getting watchlist:",
      error
    );

    throw error;
  }
}


// =====================================
// ADD TO WATCHLIST
// =====================================

export async function addToWatchlist(
  userId,
  symbol
) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    const formattedSymbol =
      symbol.trim().toUpperCase();

    await setDoc(
      userRef,
      {
        watchlist: arrayUnion(
          formattedSymbol
        ),
      },
      { merge: true }
    );

    return true;

  } catch (error) {
    console.error(
      "Error adding to watchlist:",
      error
    );

    throw error;
  }
}


// =====================================
// REMOVE FROM WATCHLIST
// =====================================

export async function removeFromWatchlist(
  userId,
  symbol
) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    const formattedSymbol =
      symbol.trim().toUpperCase();

    await updateDoc(
      userRef,
      {
        watchlist: arrayRemove(
          formattedSymbol
        ),
      }
    );

    return true;

  } catch (error) {
    console.error(
      "Error removing from watchlist:",
      error
    );

    throw error;
  }
}


// =====================================
// GET USER PREFERENCES
// =====================================

export async function getUserPreferences(
  userId
) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (userSnapshot.exists()) {
      return (
        userSnapshot.data().preferences ||
        {}
      );
    }

    return {};

  } catch (error) {
    console.error(
      "Error getting preferences:",
      error
    );

    throw error;
  }
}


// =====================================
// SAVE USER PREFERENCES
// =====================================

export async function saveUserPreferences(
  userId,
  preferences
) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    await setDoc(
      userRef,
      {
        preferences:
          preferences || {},
      },
      { merge: true }
    );

    return true;

  } catch (error) {
    console.error(
      "Error saving preferences:",
      error
    );

    throw error;
  }
}