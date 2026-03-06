"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { successAlert, errorAlert } from "@/lib/alert";
import { updateTaxRate, getTaxRate } from "@/lib/financeApi";
import useSWR, { mutate } from "swr"; // Import SWR

export default function SuperAdminSettings() {
  // Fetch current tax rates using SWR
  const { data, error, isLoading } = useSWR("/settings", getTaxRate);

  // Set local state to update the input fields
  const [taxRate, setTaxRate] = useState(data?.data?.tax_rate || 0);
  const [serviceTaxRate, setServiceTaxRate] = useState(data?.data?.service_tax_rate || 0);

  // Handle the submission of the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update tax rates
      await updateTaxRate({ tax_rate: taxRate, service_tax_rate: serviceTaxRate });

      // Show success message
      successAlert("Success", "Tax rates updated successfully");

      // Mutate SWR cache to re-fetch data and reflect updated values
      mutate("/settings");
    } catch (err) {
      errorAlert("Failed to update tax rates", err.message);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (error) {
    return <div>Error loading tax rates</div>; // Show error state
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-slate-900 border border-slate-100">
      <h2 className="text-xl font-bold mb-4">Super Admin Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</label>
          <Input
            id="taxRate"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            min="0"
            max="100"
            required
          />
        </div>
        <div>
          <label htmlFor="serviceTaxRate" className="text-sm font-medium">Service Tax Rate (%)</label>
          <Input
            id="serviceTaxRate"
            type="number"
            value={serviceTaxRate}
            onChange={(e) => setServiceTaxRate(e.target.value)}
            min="0"
            max="100"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}