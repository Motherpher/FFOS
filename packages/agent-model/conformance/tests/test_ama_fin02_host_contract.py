import copy,unittest
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin02_host_contract import assess_host_obligations
from test_ama_fin02_migration import setup
HEAD='a'*40

def fixture():
    inventory,config=setup()
    next(x for x in config['modules'] if x['id']=='secrets').update(enabled=True,config_version='1.0.0',host_obligations=['EXTERNAL_POLICY'])
    receipt={'module':'secrets','obligation':'EXTERNAL_POLICY','head':HEAD,'artifact_sha256':'b'*64,'artifact_ref':'synthetic:receipt:1','external_attestor_ref':'synthetic:reviewer'}
    return inventory,config,[receipt]

class HostContractTests(unittest.TestCase):
    def check(self,inv,config,receipts,verifier=None,head=HEAD):
        return assess_host_obligations(inv,config,receipts,head=head,verifier=verifier)
    def test_candidate_valid_but_not_live(self):
        inv,conf,rec=fixture();r=self.check(inv,conf,rec,verifier=lambda *args:True)
        self.assertEqual(r['status'],'CANDIDATE_HOST_ATTESTATION_ONLY')
        self.assertFalse(r['real_host_ready']);self.assertFalse(r['activation_authorized'])
    def test_absent_attestor_fails(self):
        inv,conf,rec=fixture();self.assertIn('ATTESTOR_UNAVAILABLE:secrets:EXTERNAL_POLICY',self.check(inv,conf,rec)['errors'])
    def test_missing_receipt_fails(self):
        inv,conf,rec=fixture();self.assertIn('MISSING_HOST_RECEIPT:secrets:EXTERNAL_POLICY',self.check(inv,conf,[],lambda *args:True)['errors'])
    def test_wrong_head_fails(self):
        inv,conf,rec=fixture();rec[0]['head']='f'*40
        self.assertIn('UNPINNED_HOST_RECEIPT:secrets:EXTERNAL_POLICY',self.check(inv,conf,rec,lambda *args:True)['errors'])
    def test_missing_digest_fails(self):
        inv,conf,rec=fixture();rec[0]['artifact_sha256']='placeholder'
        self.assertIn('UNPINNED_HOST_RECEIPT:secrets:EXTERNAL_POLICY',self.check(inv,conf,rec,lambda *args:True)['errors'])
    def test_core_cannot_be_disabled(self):
        inv,conf,rec=fixture();conf['modules'][0]['enabled']=False
        self.assertIn('DISABLED_CORE:identity',self.check(inv,conf,rec,lambda *args:True)['errors'])
    def test_duplicate_receipts_rejected(self):
        inv,conf,rec=fixture();self.assertIn('DUPLICATE_HOST_RECEIPT:',str(self.check(inv,conf,rec*2,lambda *args:True)['errors']))
    def test_claimed_external_attestor_is_not_enough(self):
        inv,conf,rec=fixture();self.assertIn('HOST_ATTESTATION_FAILED:secrets:EXTERNAL_POLICY',self.check(inv,conf,rec,lambda *args:False)['errors'])
    def test_attestor_failure_fails_closed(self):
        inv,conf,rec=fixture()
        def bad(*args):raise OSError('unavailable')
        self.assertIn('HOST_ATTESTATION_FAILED:secrets:EXTERNAL_POLICY',self.check(inv,conf,rec,bad)['errors'])

if __name__=='__main__':unittest.main()
