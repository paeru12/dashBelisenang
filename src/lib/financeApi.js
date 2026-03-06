import axios from "@/lib/axios";

const BASE = "/vi4/settings";

export const getTaxRate = async () => {
  const { data } = await axios.get(`${BASE}/tax-rate`);
  return data;
};
export const getAdminFee = async () => {
  const { data } = await axios.get(`${BASE}/admin-fee`);
  return data;
};

// Update tax rate for super admin
export const updateTaxRate = async (taxRates) => {
  try {
    const response = await axios.put(`${BASE}/tax-rate`, taxRates);
    return response.data;
  } catch (err) {
    throw new Error("Error updating tax rates");
  }
};