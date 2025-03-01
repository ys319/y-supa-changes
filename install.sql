-- Temporary loose settings for apply migration.
  SET statement_timeout = 0;
  SET lock_timeout = 0;
  SET idle_in_transaction_session_timeout = 0;
  SET client_encoding = 'UTF8';
  SET standard_conforming_strings = on;
  SET check_function_bodies = false;
  SET xmloption = content;
  SET client_min_messages = warning;
  SET row_security = off;
  SET default_tablespace = '';
  SET default_table_access_method = "heap";
  SELECT pg_catalog.set_config('search_path', '', false);

-- Enable required extensions.
  CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
  CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
  -- CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";
  -- CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
  -- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
  -- CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

-- Setup schemas.
  CREATE SCHEMA IF NOT EXISTS "y_supa_changes";
  ALTER SCHEMA "y_supa_changes" OWNER TO "postgres";

-- Setup enums.

  -- Create
  CREATE TYPE "y_supa_changes"."room_permission" AS ENUM ('read', 'write');
  CREATE TYPE "y_supa_changes"."yjs_compress" AS ENUM ('none', 'gzip', 'deflate', 'deflate-raw');
  CREATE TYPE "y_supa_changes"."yjs_encoding" AS ENUM ('ascii85', 'base64');
  CREATE TYPE "y_supa_changes"."yjs_version" AS ENUM ('v1', 'v2');

  -- Set owner
  ALTER TYPE "y_supa_changes"."room_permission" OWNER TO "postgres";
  ALTER TYPE "y_supa_changes"."yjs_compress" OWNER TO "postgres";
  ALTER TYPE "y_supa_changes"."yjs_encoding" OWNER TO "postgres";
  ALTER TYPE "y_supa_changes"."yjs_version" OWNER TO "postgres";

-- Setup tables.

  -- Table: rooms
  CREATE TABLE IF NOT EXISTS "y_supa_changes"."rooms" ("id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL, "name" "text" NOT NULL, "is_deleted" boolean NOT NULL, "created_at" timestamp with time zone DEFAULT "now"() NOT NULL, "yjs_compress" "y_supa_changes"."yjs_compress" DEFAULT 'none'::"y_supa_changes"."yjs_compress" NOT NULL, "yjs_encoding" "y_supa_changes"."yjs_encoding" DEFAULT 'base64'::"y_supa_changes"."yjs_encoding" NOT NULL, "yjs_version" "y_supa_changes"."yjs_version" DEFAULT 'v1'::"y_supa_changes"."yjs_version" NOT NULL);
  ALTER TABLE ONLY "y_supa_changes"."rooms" ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");
  ALTER TABLE "y_supa_changes"."rooms" OWNER TO "postgres";

  -- Table: updates
  CREATE TABLE IF NOT EXISTS "y_supa_changes"."updates" ("id" bigint NOT NULL, "update" "text" NOT NULL, "checkpoint" boolean NOT NULL, "room_id" "uuid" NOT NULL);
  ALTER TABLE "y_supa_changes"."updates" OWNER TO "postgres";
  ALTER TABLE "y_supa_changes"."updates" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (SEQUENCE NAME "y_supa_changes"."updates_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1);
  ALTER TABLE "y_supa_changes"."updates" ALTER COLUMN "checkpoint" SET DEFAULT false;
  ALTER TABLE ONLY "y_supa_changes"."updates" ADD CONSTRAINT "updates_pkey" PRIMARY KEY ("id");
  ALTER TABLE ONLY "y_supa_changes"."updates" ADD CONSTRAINT "updates_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "y_supa_changes"."rooms"("id");

  -- Table: user_rooms
  CREATE TABLE IF NOT EXISTS "y_supa_changes"."user_rooms" ("id" bigint NOT NULL, "user_id" "uuid" NOT NULL, "room_id" "uuid" NOT NULL, "created_at" timestamp with time zone DEFAULT "now"() NOT NULL, "permission" "y_supa_changes"."room_permission" DEFAULT 'read'::"y_supa_changes"."room_permission" NOT NULL);
  ALTER TABLE "y_supa_changes"."user_rooms" OWNER TO "postgres";
  ALTER TABLE "y_supa_changes"."user_rooms" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (SEQUENCE NAME "y_supa_changes"."user_rooms_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1);
  ALTER TABLE ONLY "y_supa_changes"."user_rooms" ADD CONSTRAINT "user_rooms_pkey" PRIMARY KEY ("id");
  ALTER TABLE ONLY "y_supa_changes"."user_rooms" ADD CONSTRAINT "user_rooms_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "y_supa_changes"."rooms"("id");
  ALTER TABLE ONLY "y_supa_changes"."user_rooms" ADD CONSTRAINT "user_rooms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

-- Create additional index.
  CREATE INDEX user_rooms_user_id_room_id_idx ON y_supa_changes.user_rooms USING btree (user_id, room_id);

-- Enable RLS.
  ALTER TABLE "y_supa_changes"."rooms" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "y_supa_changes"."updates" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "y_supa_changes"."user_rooms" ENABLE ROW LEVEL SECURITY;

-- Setup policy.

  -- Table: rooms
  CREATE POLICY "Allow member" ON "y_supa_changes"."rooms" AS permissive FOR SELECT TO authenticated USING (y_supa_changes.get_permission(id) IS NOT NULL);

  -- Table: updates
  CREATE POLICY "Allow member" ON "y_supa_changes"."updates" AS permissive FOR SELECT TO authenticated USING (y_supa_changes.get_permission(room_id) IS NOT NULL);
  CREATE POLICY "Allow member has write permission" ON "y_supa_changes"."updates" AS permissive FOR INSERT TO authenticated WITH CHECK ((y_supa_changes.get_permission(room_id) = 'write'::text));

-- Enable Realtime.
  ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
  ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "y_supa_changes"."updates";

-- Allow access to required roles.

  -- Allow basic operation.
  GRANT USAGE ON SCHEMA "y_supa_changes" TO "postgres", "authenticated", "service_role";

  -- Privileges for future tables
  ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "y_supa_changes" GRANT ALL ON SEQUENCES TO "postgres", "authenticated", "service_role";
  ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "y_supa_changes" GRANT ALL ON FUNCTIONS TO "postgres", "authenticated", "service_role";
  ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "y_supa_changes" GRANT ALL ON TABLES TO "postgres", "authenticated", "service_role";

  -- Privileges for exists tables
  GRANT ALL ON ALL SEQUENCES IN SCHEMA "y_supa_changes" TO "postgres", "authenticated", "service_role";
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA "y_supa_changes" TO "postgres", "authenticated", "service_role";
  GRANT ALL ON ALL TABLES IN SCHEMA "y_supa_changes" TO "postgres", "authenticated", "service_role";

-- Done.
  RESET ALL;
