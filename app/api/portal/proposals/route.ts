import { NextResponse } from "next/server";
import {
  authErrorToHttp,
  requireCustomerResourceAccess,
  requireCustomerUser,
} from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireCustomerUser();

    const proposals = await prisma.salesProposal.findMany({
      where: {
        OR: [
          ...(session.customerCompanyId ? [{ companyId: session.customerCompanyId }] : []),
          ...(session.customerContactId ? [{ contactId: session.customerContactId }] : []),
        ],
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        contact: { select: { id: true, fullName: true, email: true } },
        options: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            tier: true,
            title: true,
            finalCustomerPrice: true,
            monthlyPaymentEstimate: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    const scoped = proposals.filter((proposal) => {
      try {
        requireCustomerResourceAccess(session, {
          companyId: proposal.companyId,
          contactId: proposal.contactId,
        });
        return true;
      } catch {
        return false;
      }
    });

    return NextResponse.json({
      ok: true,
      count: scoped.length,
      proposals: scoped.map((proposal) => ({
        id: proposal.id,
        publicToken: proposal.publicToken,
        title: proposal.title,
        status: proposal.status,
        sentAt: proposal.sentAt,
        viewedAt: proposal.viewedAt,
        acceptedAt: proposal.acceptedAt,
        company: proposal.company,
        contact: proposal.contact,
        selectedOptionId: proposal.selectedOptionId,
        options: proposal.options.map((option) => ({
          id: option.id,
          tier: option.tier,
          title: option.title,
          finalCustomerPrice: Number(option.finalCustomerPrice),
          monthlyPaymentEstimate: option.monthlyPaymentEstimate
            ? Number(option.monthlyPaymentEstimate)
            : null,
        })),
      })),
    });
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
