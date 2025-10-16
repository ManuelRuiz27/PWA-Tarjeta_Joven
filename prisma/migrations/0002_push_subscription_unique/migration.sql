-- Drop existing unique constraint on endpoint
DROP INDEX IF EXISTS "PushSubscription_endpoint_key";

-- Create new unique constraint for userId and endpoint combination
CREATE UNIQUE INDEX "PushSubscription_userId_endpoint_key" ON "PushSubscription"("userId", "endpoint");
