import { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  initConnection,
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  finishTransaction,
  SubscriptionPurchase,
} from "react-native-iap";
import { useAuthStore } from "../store/auth.store";
import { getMe } from "../api/auth";
import { verifyPurchase } from "../api/billing";

const PRODUCT_ID = "premium_monthly";

export function usePurchase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const listener = purchaseUpdatedListener(async (purchase: SubscriptionPurchase) => {
      if (!purchase.purchaseToken) return;

      try {
        await verifyPurchase({
          product_id: purchase.productId,
          purchase_token: purchase.purchaseToken,
          platform: "android",
        });

        await finishTransaction({ purchase, isConsumable: false });

        if (accessToken) {
          const updatedUser = await getMe(accessToken);
          setAuth(accessToken, updatedUser);
        }
      } catch {
        setError("Verification failed. Please contact support.");
      } finally {
        setLoading(false);
      }
    });

    return () => listener.remove();
  }, [accessToken]);

  async function purchase() {
    setError("");
    setLoading(true);

    try {
      await initConnection();

      const subscriptions = await getSubscriptions({ skus: [PRODUCT_ID] });

      if (subscriptions.length === 0) {
        setError("Subscription not available.");
        setLoading(false);
        return;
      }

      const offerToken =
        Platform.OS === "android"
          ? (subscriptions[0] as any).subscriptionOfferDetails?.[0]?.offerToken ?? ""
          : "";

      await requestSubscription({
        sku: PRODUCT_ID,
        ...(Platform.OS === "android" && {
          subscriptionOffers: [{ sku: PRODUCT_ID, offerToken }],
        }),
      });
      // loading stays true until purchaseUpdatedListener resolves
    } catch (err: any) {
      if (err?.code !== "E_USER_CANCELLED") {
        setError("Purchase failed. Please try again.");
      }
      setLoading(false);
    }
  }

  return { purchase, loading, error };
}
