"use client";

import BaseModal from "@/components/common/BaseModal";
import useSWR from "swr";
import { formatIsoIndo, formatRupiah } from "@/utils/date";
import { adminGetPayoutDetail } from "@/lib/payoutApi";

export default function AdminPayoutDetailModal({ payoutId, onClose }) {
    const { data } = useSWR(
        payoutId ? `/admin/payout/${payoutId}` : null,
        () => adminGetPayoutDetail(payoutId)
    );

    if (!payoutId || !data) return null;

    return (
        <BaseModal open onClose={onClose} title="Payout Detail">
            <div className="space-y-3">
                <p><strong>Creator:</strong> {data.creator?.name}</p>
                <p><strong>Amount:</strong> {formatRupiah(data.amount)}</p>
                <p><strong>Status:</strong> {data.status}</p>

                <h4 className="font-semibold mt-3">Bank Info</h4>
                <p>{data.bank_info?.bank_name}</p>
                <p>{data.bank_info?.holder_name}</p>
                <p>{data.bank_info?.account_number}</p>

                <h4 className="font-semibold mt-3">Timestamps</h4>
                <p>Created: {formatIsoIndo(data.created_at)}</p>
                <p>Approved: {data.approved_at ? formatIsoIndo(data.approved_at) : "-"}</p>

                <h4 className="font-semibold mt-3">Xendit Reference</h4>
                <p>{data.xendit_disbursement_id || "-"}</p>
            </div>
        </BaseModal>
    );
}
