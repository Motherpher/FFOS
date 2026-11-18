-- WP01 | Read-only ProjectHub role with database-enforced project scope.
-- The existing ffos_projecthub_runtime writer remains unchanged.
-- No login credential, public browser grant, data, or API exposure is created.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='ffos_projecthub_reader') THEN
    CREATE ROLE ffos_projecthub_reader NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
ALTER ROLE ffos_projecthub_reader NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT USAGE ON SCHEMA ffos TO ffos_projecthub_reader;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projecthub_projects','projecthub_nodes','projecthub_relations',
    'projecthub_events','projecthub_idempotency','projecthub_role_grants'
  ] LOOP
    EXECUTE format('GRANT SELECT ON TABLE ffos.%I TO ffos_projecthub_reader',t);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE ffos.%I FROM ffos_projecthub_reader',t);
    IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_policies WHERE schemaname='ffos' AND tablename=t AND policyname=t||'_reader_scoped_select') THEN
      EXECUTE format(
        'CREATE POLICY %I ON ffos.%I FOR SELECT TO ffos_projecthub_reader USING (project_id = nullif(current_setting(''ffos.project_scope'',true),''''))',
        t||'_reader_scoped_select',t
      );
    END IF;
  END LOOP;
END $$;

-- No membership to the writer role; no login; no password in source.
-- A distinct protected, backend-only LOGIN with membership in this role
-- must be provisioned and tested in a separate approved admission step.
