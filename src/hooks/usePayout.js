// app/dashboard/payout/hooks/usePayout.js
import useSWR from "swr";
import axios from "@/lib/axios";

export function usePayoutDashboard() {
  const { data, error } = useSWR("/payout/dashboard", () =>
    axios.get("/vi4/payout/dashboard").then((res) => res.data.data)
  );

  return {
    dashboard: data,
    loading: !error && !data,
    error,
  };
}

export function usePayoutHistory() {
  const { data, error } = useSWR("/payout/history", () =>
    axios.get("/vi4/payout/history").then((res) => res.data.data)
  );

  return {
    history: data,
    loading: !error && !data,
    error,
  };
}
