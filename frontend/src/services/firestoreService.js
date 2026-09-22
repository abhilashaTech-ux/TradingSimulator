import { db } from "./firebase";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";


// ===================================
// SAVE BACKTEST HISTORY
// ===================================

export async function saveBacktest(
  userId,
  result,
  strategy,
  initialCapital
) {
  try {
    const backtestsRef =
      collection(db, "backtests");

    await addDoc(
      backtestsRef,
      {
        userId,

        initialCapital:
          Number(initialCapital),

        finalCapital:
          Number(
            result.finalCapital || 0
          ),

        profitLoss:
          Number(
            result.profitLoss || 0
          ),

        returnPercentage:
          Number(
            result.returnPercentage || 0
          ),

        winningTrades:
          Number(
            result.winningTrades || 0
          ),

        losingTrades:
          Number(
            result.losingTrades || 0
          ),

        trades:
          result.trades || [],

        strategy:
          strategy || {},

        createdAt:
          Timestamp.now(),
      }
    );

    return true;

  } catch (error) {

    console.error(
      "Error saving backtest:",
      error
    );

    throw error;

  }
}


// ===================================
// GET USER BACKTEST HISTORY
// ===================================

export async function getUserBacktests(
  userId
) {
  try {

    const backtestsRef =
      collection(db, "backtests");


    const q =
      query(
        backtestsRef,

        where(
          "userId",
          "==",
          userId
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );


    const snapshot =
      await getDocs(q);


    return snapshot.docs.map(
      (document) => ({
        id: document.id,
        ...document.data(),
      })
    );

  } catch (error) {

    console.error(
      "Error getting backtests:",
      error
    );

    throw error;

  }
}


// ===================================
// SAVE USER PORTFOLIO
// ===================================

export async function savePortfolio(
  userId,
  result
) {
  try {

    const userRef =
      doc(
        db,
        "users",
        userId
      );


    await setDoc(
      userRef,
      {
        portfolio: {

          finalCapital:
            Number(
              result.finalCapital || 0
            ),

          profitLoss:
            Number(
              result.profitLoss || 0
            ),

          returnPercentage:
            Number(
              result.returnPercentage || 0
            ),

          winningTrades:
            Number(
              result.winningTrades || 0
            ),

          losingTrades:
            Number(
              result.losingTrades || 0
            ),

          trades:
            result.trades || [],

          updatedAt:
            Timestamp.now(),

        },
      },

      {
        merge: true,
      }
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


// ===================================
// GET USER PORTFOLIO
// ===================================

export async function getUserPortfolio(
  userId
) {
  try {

    const userRef =
      doc(
        db,
        "users",
        userId
      );


    const userSnapshot =
      await getDoc(
        userRef
      );


    if (
      userSnapshot.exists()
    ) {

      return (
        userSnapshot.data()
          .portfolio || null
      );

    }


    return null;

  } catch (error) {

    console.error(
      "Error getting portfolio:",
      error
    );

    throw error;

  }
}


// ===================================
// SAVE USER PREFERENCES
// ===================================

export async function saveUserPreferences(
  userId,
  preferences
) {
  try {

    const userRef =
      doc(
        db,
        "users",
        userId
      );


    await setDoc(
      userRef,
      {
        preferences: {

          buyRule:
            preferences.buyRule || {},

          sellRule:
            preferences.sellRule || {},

          initialCapital:
            Number(
              preferences.initialCapital || 0
            ),

          updatedAt:
            Timestamp.now(),

        },
      },

      {
        merge: true,
      }
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


// ===================================
// GET USER PREFERENCES
// ===================================

export async function getUserPreferences(
  userId
) {
  try {

    const userRef =
      doc(
        db,
        "users",
        userId
      );


    const userSnapshot =
      await getDoc(
        userRef
      );


    if (
      userSnapshot.exists()
    ) {

      return (
        userSnapshot.data()
          .preferences || null
      );

    }


    return null;

  } catch (error) {

    console.error(
      "Error getting preferences:",
      error
    );

    throw error;

  }
}