"""Offline, deterministic AMA 32-module migration negative tests."""
import copy
import unittest
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin02_migration import assess_transition

CORE = ["identity","mandate","instruction","capability","workflow","command","adapter","authorization","task-execution","evidence","conformance","lifecycle","governance"]
OPTIONAL = ["cognition","context","memory","retrieval","knowledge","multi-agent","eventing","durability","human-interaction","observability","evaluation","safety","privacy","secrets","interoperability","deployment","operations","cost-control","localization"]

def setup():
    inventory={"modules":[{"id":n,"requirement":"CORE" if n in CORE else "OPTIONAL","remaining_host_obligations":["EXTERNAL_POLICY"] if n=="secrets" else []} for n in CORE+OPTIONAL]}
    config={"modules":[{"id":n,"enabled":n in CORE,"config_version":"1.0.0" if n in CORE else None,"host_obligations":[]} for n in CORE+OPTIONAL]}
    return inventory, config

class MigrationTest(unittest.TestCase):
    def test_no_change_is_non_authorizing(self):
        inv, old=setup(); r=assess_transition(inv,old,copy.deepcopy(old))
        self.assertEqual(r['status'],'NO_CHANGE');self.assertFalse(r['activation_authorized'])
    def test_core_disabled_denied(self):
        inv, old=setup(); new=copy.deepcopy(old);new['modules'][0]['enabled']=False
        self.assertIn('CORE_CANNOT_BE_DISABLED:after:identity',assess_transition(inv,old,new)['errors'])
    def test_optional_activation_requires_approval(self):
        inv,old=setup();new=copy.deepcopy(old);m=next(x for x in new['modules'] if x['id']=='memory');m.update(enabled=True,config_version='1.0.0')
        self.assertIn('OPTIONAL_ENABLE_APPROVAL_MISSING:memory',assess_transition(inv,old,new)['errors'])
        self.assertIn('OPTIONAL_ENABLE_APPROVAL_UNVERIFIED:memory',assess_transition(inv,old,new)['errors'])
    def test_approved_optional_activation_still_requires_review(self):
        inv,old=setup();new=copy.deepcopy(old);m=next(x for x in new['modules'] if x['id']=='memory');m.update(enabled=True,config_version='1.0.0',approval_ref='synthetic/owner',approval_verified=True)
        r=assess_transition(inv,old,new);self.assertEqual(r['status'],'REVIEW_REQUIRED');self.assertFalse(r['migration_executed'])
    def test_host_obligation_cannot_be_dropped(self):
        inv,old=setup();new=copy.deepcopy(old);m=next(x for x in new['modules'] if x['id']=='secrets');m.update(enabled=True,config_version='1.0.0',approval_ref='synthetic/owner',approval_verified=True)
        self.assertIn('HOST_OBLIGATION_DROPPED:secrets',assess_transition(inv,old,new)['errors'])
    def test_breaking_version_requires_explicit_migration(self):
        inv,old=setup();new=copy.deepcopy(old);new['modules'][0]['config_version']='2.0.0'
        r=assess_transition(inv,old,new);self.assertEqual(r['status'],'REVIEW_REQUIRED');self.assertIn('BREAKING_VERSION',str(r['changes']))
    def test_downgrade_holds(self):
        inv,old=setup();new=copy.deepcopy(old);new['modules'][0]['config_version']='0.9.0'
        self.assertIn('VERSION_ROLLBACK_REVIEW_REQUIRED:identity',assess_transition(inv,old,new)['errors'])
    def test_unsafe_authority_change_needs_review(self):
        inv,old=setup();new=copy.deepcopy(old);new['modules'][0]['effect_ceiling']='E4_AUTHORITY_CHANGE'
        r=assess_transition(inv,old,new);self.assertEqual(r['status'],'REVIEW_REQUIRED');self.assertIn('INDEPENDENT_AUTHORITY_REVIEW',str(r['changes']))
    def test_missing_module_rejected(self):
        inv,old=setup();new=copy.deepcopy(old);new['modules'].pop()
        self.assertIn('NONCANONICAL_MODULE_SET:after',assess_transition(inv,old,new)['errors'])
    def test_unpinned_version_rejected(self):
        inv,old=setup();new=copy.deepcopy(old);new['modules'][0]['config_version']='latest'
        self.assertIn('UNPINNED_MODULE_VERSION:after:identity',assess_transition(inv,old,new)['errors'])
    def test_junk_enabled_rejected(self):
        inv,old=setup();new=copy.deepcopy(old);new['modules'][0]['enabled']=1
        self.assertIn('INVALID_ENABLED:after:identity',assess_transition(inv,old,new)['errors'])

if __name__=='__main__':unittest.main()
