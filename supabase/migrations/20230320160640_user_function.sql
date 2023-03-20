alter table "auth"."users" drop column "deleted_at";

alter table "auth"."users" alter column "phone" set data type character varying(15) using "phone"::character varying(15);

alter table "auth"."users" alter column "phone_change" set data type character varying(15) using "phone_change"::character varying(15);



set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

drop function if exists "storage"."can_insert_object"(bucketid text, name text, owner uuid, metadata jsonb);

alter table "storage"."buckets" drop column "allowed_mime_types";

alter table "storage"."buckets" drop column "avif_autodetection";

alter table "storage"."buckets" drop column "file_size_limit";


