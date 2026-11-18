-- FFOS least-privilege PostgreSQL admission (FF Estate).
-- The role has NOLOGIN and cannot be used until a separately authorized
-- server-side LOGIN principal is provisioned and made a member.
-- Does not alter Digital Twin/public schema, and does not expose Data API.
BEGIN;
ALTER FUNCTION ffos.reject_asset_mutation() SET search_path = '';
REVOKE ALL ON FUNCTION ffos.reject_asset_mutation() FROM PUBLIC;
REVOKE ALL ON SCHEMA ffos FROM PUBLIC;
REVOKE ALL ON SCHEMA ffos FROM anon, authenticated, service_role;
REVOKE ALL ON ALL TABLES IN SCHEMA ffos FROM anon, authenticated, service_role;

CREATE ROLE ffos_registry_writer NOLOGIN NOBYPASSRLS;
GRANT USAGE ON SCHEMA ffos TO ffos_registry_writer;
GRANT SELECT, INSERT ON
  ffos.data_work_orders,
  ffos.data_asset_versions,
  ffos.data_reuse_decisions,
  ffos.data_work_order_asset_links
TO ffos_registry_writer;

ALTER TABLE ffos.data_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ffos.data_asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ffos.data_reuse_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ffos.data_work_order_asset_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY ffos_registry_writer_select_work_orders
ON ffos.data_work_orders FOR SELECT TO ffos_registry_writer USING (true);
CREATE POLICY ffos_registry_writer_insert_work_orders
ON ffos.data_work_orders FOR INSERT TO ffos_registry_writer WITH CHECK (true);

CREATE POLICY ffos_registry_writer_select_asset_versions
ON ffos.data_asset_versions FOR SELECT TO ffos_registry_writer USING (true);
CREATE POLICY ffos_registry_writer_insert_asset_versions
ON ffos.data_asset_versions FOR INSERT TO ffos_registry_writer WITH CHECK (true);

CREATE POLICY ffos_registry_writer_select_reuse_decisions
ON ffos.data_reuse_decisions FOR SELECT TO ffos_registry_writer USING (true);
CREATE POLICY ffos_registry_writer_insert_reuse_decisions
ON ffos.data_reuse_decisions FOR INSERT TO ffos_registry_writer WITH CHECK (true);

CREATE POLICY ffos_registry_writer_select_asset_links
ON ffos.data_work_order_asset_links FOR SELECT TO ffos_registry_writer USING (true);
CREATE POLICY ffos_registry_writer_insert_asset_links
ON ffos.data_work_order_asset_links FOR INSERT TO ffos_registry_writer WITH CHECK (true);
COMMIT;
