CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserRole" AS ENUM ('USER', 'COACH', 'ADMIN');
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'SJT', 'NUMERICAL', 'FREE_TEXT', 'TECHNICAL');
CREATE TYPE "TestType" AS ENUM ('CSJT', 'SJT', 'NUMERICAL', 'TECHNICAL', 'MIXED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'UNPAID');

CREATE TABLE "RoleGrade" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "RoleGrade_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoleGrade_name_key" ON "RoleGrade" ("name");
CREATE INDEX "RoleGrade_deletedAt_idx" ON "RoleGrade" ("deletedAt");

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "targetGradeId" UUID,
  "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");
CREATE INDEX "User_deletedAt_idx" ON "User" ("deletedAt");
CREATE INDEX "User_role_idx" ON "User" ("role");

CREATE TABLE "Behaviour" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "successCriteria" TEXT NOT NULL,
  "gradeId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Behaviour_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Behaviour_gradeId_idx" ON "Behaviour" ("gradeId");
CREATE INDEX "Behaviour_deletedAt_idx" ON "Behaviour" ("deletedAt");

CREATE TABLE "BehaviourExample" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "behaviourId" UUID NOT NULL,
  "starSituation" TEXT NOT NULL,
  "starTask" TEXT NOT NULL,
  "starAction" TEXT NOT NULL,
  "starResult" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "BehaviourExample_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BehaviourExample_behaviourId_idx" ON "BehaviourExample" ("behaviourId");
CREATE INDEX "BehaviourExample_deletedAt_idx" ON "BehaviourExample" ("deletedAt");

CREATE TABLE "Question" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "prompt" TEXT NOT NULL,
  "type" "QuestionType" NOT NULL,
  "difficulty" INTEGER NOT NULL,
  "gradeId" UUID NOT NULL,
  "correctAnswer" TEXT,
  "rationale" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Question_gradeId_idx" ON "Question" ("gradeId");
CREATE INDEX "Question_type_idx" ON "Question" ("type");
CREATE INDEX "Question_deletedAt_idx" ON "Question" ("deletedAt");

CREATE TABLE "QuestionBehaviour" (
  "questionId" UUID NOT NULL,
  "behaviourId" UUID NOT NULL,
  CONSTRAINT "QuestionBehaviour_pkey" PRIMARY KEY ("questionId", "behaviourId")
);

CREATE INDEX "QuestionBehaviour_behaviourId_idx" ON "QuestionBehaviour" ("behaviourId");

CREATE TABLE "Test" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "type" "TestType" NOT NULL,
  "timeLimit" INTEGER NOT NULL,
  "gradeId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Test_gradeId_idx" ON "Test" ("gradeId");
CREATE INDEX "Test_type_idx" ON "Test" ("type");
CREATE INDEX "Test_deletedAt_idx" ON "Test" ("deletedAt");

CREATE TABLE "TestQuestion" (
  "testId" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "order" INTEGER,
  CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("testId", "questionId")
);

CREATE INDEX "TestQuestion_questionId_idx" ON "TestQuestion" ("questionId");

CREATE TABLE "TestAttempt" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "testId" UUID NOT NULL,
  "score" INTEGER,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TestAttempt_userId_idx" ON "TestAttempt" ("userId");
CREATE INDEX "TestAttempt_testId_idx" ON "TestAttempt" ("testId");
CREATE INDEX "TestAttempt_completedAt_idx" ON "TestAttempt" ("completedAt");
CREATE INDEX "TestAttempt_deletedAt_idx" ON "TestAttempt" ("deletedAt");

CREATE TABLE "Answer" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "attemptId" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "order" INTEGER NOT NULL,
  "response" JSONB NOT NULL,
  "score" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Answer_attemptId_idx" ON "Answer" ("attemptId");
CREATE INDEX "Answer_attemptId_order_idx" ON "Answer" ("attemptId", "order");
CREATE INDEX "Answer_questionId_idx" ON "Answer" ("questionId");
CREATE INDEX "Answer_deletedAt_idx" ON "Answer" ("deletedAt");
CREATE UNIQUE INDEX "Answer_attemptId_questionId_key" ON "Answer" ("attemptId", "questionId");

CREATE TABLE "InterviewMock" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "gradeId" UUID NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "InterviewMock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InterviewMock_userId_idx" ON "InterviewMock" ("userId");
CREATE INDEX "InterviewMock_gradeId_idx" ON "InterviewMock" ("gradeId");
CREATE INDEX "InterviewMock_deletedAt_idx" ON "InterviewMock" ("deletedAt");

CREATE TABLE "InterviewScorecard" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "interviewId" UUID NOT NULL,
  "behaviourId" UUID NOT NULL,
  "score" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "InterviewScorecard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InterviewScorecard_interviewId_idx" ON "InterviewScorecard" ("interviewId");
CREATE INDEX "InterviewScorecard_behaviourId_idx" ON "InterviewScorecard" ("behaviourId");
CREATE INDEX "InterviewScorecard_deletedAt_idx" ON "InterviewScorecard" ("deletedAt");

CREATE TABLE "Subscription" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "stripeSubscriptionId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Subscription_userId_idx" ON "Subscription" ("userId");
CREATE INDEX "Subscription_status_idx" ON "Subscription" ("status");
CREATE INDEX "Subscription_deletedAt_idx" ON "Subscription" ("deletedAt");

CREATE TABLE "ApplicationStatement" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "analysis" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "ApplicationStatement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ApplicationStatement_userId_idx" ON "ApplicationStatement" ("userId");
CREATE INDEX "ApplicationStatement_deletedAt_idx" ON "ApplicationStatement" ("deletedAt");

CREATE TABLE "ConsentRecord" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord" ("userId");
CREATE INDEX "ConsentRecord_type_idx" ON "ConsentRecord" ("type");

CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actorId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog" ("actorId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog" ("entityType", "entityId");

ALTER TABLE "User" ADD CONSTRAINT "User_targetGradeId_fkey" FOREIGN KEY ("targetGradeId") REFERENCES "RoleGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Behaviour" ADD CONSTRAINT "Behaviour_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "RoleGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BehaviourExample" ADD CONSTRAINT "BehaviourExample_behaviourId_fkey" FOREIGN KEY ("behaviourId") REFERENCES "Behaviour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Question" ADD CONSTRAINT "Question_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "RoleGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QuestionBehaviour" ADD CONSTRAINT "QuestionBehaviour_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuestionBehaviour" ADD CONSTRAINT "QuestionBehaviour_behaviourId_fkey" FOREIGN KEY ("behaviourId") REFERENCES "Behaviour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Test" ADD CONSTRAINT "Test_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "RoleGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Answer" ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InterviewMock" ADD CONSTRAINT "InterviewMock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InterviewMock" ADD CONSTRAINT "InterviewMock_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "RoleGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InterviewScorecard" ADD CONSTRAINT "InterviewScorecard_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterviewMock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InterviewScorecard" ADD CONSTRAINT "InterviewScorecard_behaviourId_fkey" FOREIGN KEY ("behaviourId") REFERENCES "Behaviour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ApplicationStatement" ADD CONSTRAINT "ApplicationStatement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
