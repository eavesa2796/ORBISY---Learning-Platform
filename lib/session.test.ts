import { describe, expect, it } from "vitest";
import {
  AuthError,
  type ValidatedSession,
  requireCustomerResourceAccess,
} from "./session";

const baseCustomerSession: ValidatedSession = {
  userId: "user_1",
  userEmail: "customer@example.com",
  userName: "Customer User",
  userRole: "CUSTOMER",
  customerCompanyId: "company_1",
  customerContactId: "contact_1",
};

describe("requireCustomerResourceAccess", () => {
  it("allows access when company matches", () => {
    expect(() =>
      requireCustomerResourceAccess(baseCustomerSession, {
        companyId: "company_1",
        contactId: null,
      }),
    ).not.toThrow();
  });

  it("allows access when contact matches", () => {
    expect(() =>
      requireCustomerResourceAccess(baseCustomerSession, {
        companyId: "company_other",
        contactId: "contact_1",
      }),
    ).not.toThrow();
  });

  it("rejects access when neither company nor contact match", () => {
    expect(() =>
      requireCustomerResourceAccess(baseCustomerSession, {
        companyId: "company_other",
        contactId: "contact_other",
      }),
    ).toThrow(AuthError);
  });

  it("rejects non-customer users", () => {
    const internalSession: ValidatedSession = {
      ...baseCustomerSession,
      userRole: "SALES",
    };

    expect(() =>
      requireCustomerResourceAccess(internalSession, {
        companyId: "company_1",
        contactId: "contact_1",
      }),
    ).toThrow("Forbidden");
  });
});
