import apiClient from "./client";

type VerifyPurchaseRequest = {
  product_id: string;
  purchase_token: string;
  platform: string;
};

type VerifyPurchaseResponse = {
  success: boolean;
  is_premium: boolean;
};

export async function verifyPurchase(data: VerifyPurchaseRequest): Promise<VerifyPurchaseResponse> {
  const res = await apiClient.post<VerifyPurchaseResponse>("/billing/verify", data);
  return res.data;
}
