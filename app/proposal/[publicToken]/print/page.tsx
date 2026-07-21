import { redirect } from "next/navigation";

export default async function ProposalPrintAliasPage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;
  redirect(`/proposal/${publicToken}?print=1`);
}
