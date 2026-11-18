-- FFOS ProjectHub runtime identity — restricted, initially NOLOGIN.
-- Project-scoped RLS is a DB defense-in-depth boundary. It is NOT proof that
-- the caller has Director/mandate/CDX authorization to choose a project ID.
-- A separately governed backend must validate authorization before setting
-- ffos.project_scope for any transaction. No direct frontend/database access.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='ffos_projecthub_runtime') THEN
    CREATE ROLE ffos_projecthub_runtime NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END;
$$;
ALTER ROLE ffos_projecthub_runtime NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

GRANT USAGE ON SCHEMA ffos TO ffos_projecthub_runtime;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projecthub_projects', 'projecthub_nodes', 'projecthub_relations',
    'projecthub_events', 'projecthub_idempotency', 'projecthub_role_grants'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT ON TABLE ffos.%I TO ffos_projecthub_runtime', t);
    EXECUTE format(
      'CREATE POLICY %I ON ffos.%I FOR SELECT TO ffos_projecthub_runtime USING (project_id = nullif(current_setting(''ffos.project_scope'', true), ''''))',
      t || '_scoped_read', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON ffos.%I FOR INSERT TO ffos_projecthub_runtime WITH CHECK (project_id = nullif(current_setting(''ffos.project_scope'', true), ''''))',
      t || '_scoped_append', t
    );
  END LOOP;
END;
$$;

-- bigserial ID generation requires sequence privileges for append-only writes.
GRANT USAGE ON SEQUENCE ffos.projecthub_projects_row_id_seq,
  ffos.projecthub_nodes_row_id_seq,ffos.projecthub_relations_row_id_seq,
  ffos.projecthub_role_grants_row_id_seq TO ffos_projecthub_runtime;

-- No UPDATE, DELETE, TRUNCATE, REFERENCES or trigger execution privileges.
-- NOLOGIN deliberately prevents independent database login. Any future
-- LOGIN membership/credential must pass a separate Director+CDX runtime gate.
