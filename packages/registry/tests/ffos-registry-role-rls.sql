-- Disposable CI database only; never run fixture against Supabase production.
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace s ON s.oid=c.relnamespace
  WHERE s.nspname='ffos' AND c.relkind='r' AND c.relrowsecurity;
  IF n<>4 THEN RAISE EXCEPTION 'RLS not enabled on all four FFOS tables'; END IF;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='ffos_registry_writer'
     AND (rolcanlogin OR rolbypassrls)) THEN
     RAISE EXCEPTION 'FFOS writer role can login or bypass RLS';
  END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='ffos')<>8 THEN
    RAISE EXCEPTION 'Expected exactly 8 targeted FFOS policies';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='ffos'
     AND roles <> ARRAY['ffos_registry_writer']::name[]) THEN
    RAISE EXCEPTION 'Found policy granted outside private role';
  END IF;
  IF has_schema_privilege('anon','ffos','USAGE')
    OR has_schema_privilege('authenticated','ffos','USAGE')
    OR has_schema_privilege('service_role','ffos','USAGE') THEN
    RAISE EXCEPTION 'Forbidden API role has ffos schema access';
  END IF;
  IF has_table_privilege('ffos_registry_writer','ffos.data_work_orders','UPDATE')
    OR has_table_privilege('ffos_registry_writer','ffos.data_work_orders','DELETE') THEN
    RAISE EXCEPTION 'Writer role has UPDATE or DELETE';
  END IF;
END $$;

BEGIN;
SET LOCAL ROLE ffos_registry_writer;
INSERT INTO ffos.data_work_orders
 (work_order_id,request_id,owner_repo,purpose,authority_ref,requirements,created_at,created_by)
VALUES ('ci-writer','ci-req','Motherpher/FFOS','ci','TEST_DIRECTOR','{}',now(),'CI');
SELECT work_order_id FROM ffos.data_work_orders WHERE work_order_id='ci-writer';
ROLLBACK;

DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM ffos.data_work_orders WHERE work_order_id='ci-writer') THEN
    RAISE EXCEPTION 'CI test leaked row outside rollback';
  END IF;
END $$;
