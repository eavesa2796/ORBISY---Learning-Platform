-- Add reply intent classification fields to SalesOutreachMessage
ALTER TABLE "SalesOutreachMessage" ADD COLUMN "replyIntent" TEXT;
ALTER TABLE "SalesOutreachMessage" ADD COLUMN "replySnippet" TEXT;

CREATE INDEX "SalesOutreachMessage_replyIntent_idx" ON "SalesOutreachMessage"("replyIntent");
