/**
 * Session validation utilities (Node.js runtime only)
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type AppUserRole = "ADMIN" | "SALES" | "CUSTOMER";

export interface ValidatedSession {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: AppUserRole;
  customerCompanyId: string | null;
  customerContactId: string | null;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function authErrorToHttp(
  error: unknown,
): { status: number; message: string } | null {
  if (error instanceof AuthError) {
    return { status: error.status, message: error.message };
  }
  return null;
}

/**
 * Validate the current session from cookies
 * Returns the user info if valid, null otherwise
 * Use this in Server Components and API routes
 */
export async function validateSession(): Promise<ValidatedSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session-token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Validate session from database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    // Check if session exists, is valid, and user is active
    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      // Delete expired/invalid session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    // Return validated session info
    return {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      userRole: session.user.role,
      customerCompanyId: session.user.customerCompanyId,
      customerContactId: session.user.customerContactId,
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

/**
 * Require a valid session or throw an error
 * Use this in API routes that require authentication
 */
export async function requireSession(): Promise<ValidatedSession> {
  const session = await validateSession();
  if (!session) {
    throw new AuthError("Unauthorized", 401);
  }
  return session;
}

/**
 * Require admin role or throw an error
 * Use this in API routes that require admin access
 */
export async function requireAdmin(): Promise<ValidatedSession> {
  const session = await requireSession();
  if (session.userRole !== "ADMIN") {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

/**
 * Require an internal user (ADMIN or SALES) for sales-engine operations.
 */
export async function requireInternalUser(): Promise<ValidatedSession> {
  const session = await requireSession();
  if (session.userRole !== "ADMIN" && session.userRole !== "SALES") {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

/**
 * Require a customer user and ensure they're linked to a company/contact.
 */
export async function requireCustomerUser(): Promise<ValidatedSession> {
  const session = await requireSession();
  if (session.userRole !== "CUSTOMER") {
    throw new AuthError("Forbidden", 403);
  }
  if (!session.customerCompanyId && !session.customerContactId) {
    throw new AuthError("Customer user is not linked to company/contact", 403);
  }
  return session;
}

/**
 * Helper for proposal/customer APIs: ensure customer can access a resource
 * tied to their own company/contact.
 */
export function requireCustomerResourceAccess(
  session: ValidatedSession,
  resource: {
    companyId?: string | null;
    contactId?: string | null;
  },
) {
  if (session.userRole !== "CUSTOMER") {
    throw new AuthError("Forbidden", 403);
  }

  const companyMatch =
    !!resource.companyId &&
    !!session.customerCompanyId &&
    resource.companyId === session.customerCompanyId;
  const contactMatch =
    !!resource.contactId &&
    !!session.customerContactId &&
    resource.contactId === session.customerContactId;

  if (!companyMatch && !contactMatch) {
    throw new AuthError("Forbidden", 403);
  }
}
