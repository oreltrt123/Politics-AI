CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_project_id" integer NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"sources" jsonb,
	"stats" jsonb,
	"images" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"name" varchar(255) DEFAULT 'Knesset Chat' NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"visibility" varchar(50) DEFAULT 'private' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_projects_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"chatMessage" jsonb NOT NULL,
	"frameId" varchar NOT NULL,
	"createdBy" varchar NOT NULL,
	"createdOn" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "frames" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "frames_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"frameId" varchar NOT NULL,
	"designCode" text,
	"projectId" varchar NOT NULL,
	"createdOn" timestamp DEFAULT now(),
	CONSTRAINT "frames_frameId_unique" UNIQUE("frameId")
);
--> statement-breakpoint
CREATE TABLE "knesset_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"mk_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"party" varchar(255),
	"faction" varchar(255),
	"img_url" text,
	"email" varchar(255),
	"website" text,
	"phone" varchar(50),
	"start_date" date,
	"end_date" date,
	"is_current" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "knesset_members_mk_id_unique" UNIQUE("mk_id")
);
--> statement-breakpoint
CREATE TABLE "mk_weekly_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"mk_id" integer NOT NULL,
	"week_start" date NOT NULL,
	"week_end" date NOT NULL,
	"speech_count" integer DEFAULT 0,
	"word_count" integer DEFAULT 0,
	"impact_score" numeric(10, 2) DEFAULT '0',
	"topics" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"projectId" varchar NOT NULL,
	"createdBy" varchar NOT NULL,
	"createdOn" timestamp DEFAULT now(),
	CONSTRAINT "projects_projectId_unique" UNIQUE("projectId")
);
--> statement-breakpoint
CREATE TABLE "speeches" (
	"id" serial PRIMARY KEY NOT NULL,
	"mk_id" integer NOT NULL,
	"protocol_id" integer,
	"speech_date" date NOT NULL,
	"speech_text" text,
	"word_count" integer,
	"topic" varchar(500),
	"committee" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"credits" integer DEFAULT 2,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "weekly_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_start" date NOT NULL,
	"week_end" date NOT NULL,
	"report_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_project_id_chat_projects_id_fk" FOREIGN KEY ("chat_project_id") REFERENCES "public"."chat_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_projects" ADD CONSTRAINT "chat_projects_user_id_users_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_id") ON DELETE no action ON UPDATE no action;