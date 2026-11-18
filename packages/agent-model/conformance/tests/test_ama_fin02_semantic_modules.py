"""AMA FIN-02 full 32-module semantic conformance candidate regression."""
import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from ama_fin02_semantic_modules import CONTROLS, validate_module_contracts

CORE={"identity","mandate","instruction","capability","workflow","command","adapter",
      "authorization","task-execution","evidence","conformance","lifecycle","governance"}

def fixture():
    inv={"modules":[]}
    config={"modules":[]}
    for name,required in CONTROLS.items():
        core=name in CORE
        inv["modules"].append({"id":name,"requirement":"CORE" if core else "OPTIONAL",
                               "remaining_host_obligations":[]})
        row={"id":name,"enabled":core,
             "version":"1.0.0" if core else None,
             "controls":{k:"synthetic/contract/"+name+"/"+k for k in required} if core else {},
             "host_obligations":[]}
        config["modules"].append(row)
    return inv,config

def activate(config,name):
    x=next(x for x in config["modules"] if x["id"]==name)
    x.update(enabled=True,version="1.0.0",approval_ref="synthetic/approval",
             approval_attested=True,
             controls={k:"synthetic/"+k for k in CONTROLS[name]})
    return x

class CoreSemantics(unittest.TestCase):
    def test_all_32_in_source_and_portable_preflight(self):
        inv,config=fixture()
        result=validate_module_contracts(inv,config)
        self.assertEqual(result["findings"],[])
        self.assertEqual(result["modules_evaluated"],32)
        self.assertEqual(result["modules_selected"],13)
        self.assertEqual(result["independent_verified_complete"],0)
        self.assertFalse(result["fin02_accepted"])
    def test_missing_module_rejected(self):
        inv,config=fixture();config["modules"].pop()
        self.assertIn("NONCANONICAL_MODULE_SET",validate_module_contracts(inv,config)["findings"])
    def test_core_disabled_rejected(self):
        inv,config=fixture();config["modules"][0]["enabled"]=False
        self.assertIn("CORE_DISABLED:identity",validate_module_contracts(inv,config)["findings"])
    def test_optional_enable_unapproved_rejected(self):
        inv,config=fixture();row=activate(config,"memory")
        del row["approval_ref"]
        self.assertIn("OPTIONAL_APPROVAL_REQUIRED:memory",validate_module_contracts(inv,config)["findings"])
    def test_optional_enable_attestor_absent_rejected(self):
        inv,config=fixture();row=activate(config,"memory")
        row["approval_attested"]=False
        self.assertIn("OPTIONAL_APPROVAL_UNATTESTED:memory",validate_module_contracts(inv,config)["findings"])
    def test_missing_host_disclosure_rejected(self):
        inv,config=fixture();next(x for x in inv["modules"] if x["id"]=="identity")["remaining_host_obligations"]=["HOST_IDENTITY"]
        self.assertIn("HOST_OBLIGATIONS_UNDECLARED:identity",validate_module_contracts(inv,config)["findings"])
    def test_fake_completion_or_effect_authority_rejected(self):
        inv,config=fixture();config["modules"][0]["implementation_complete"]=True
        self.assertIn("UNSUPPORTED_COMPLETENESS_OR_AUTHORITY:identity",validate_module_contracts(inv,config)["findings"])
    def test_bad_version_rejected(self):
        inv,config=fixture();config["modules"][0]["version"]="latest"
        self.assertIn("VERSION_UNPINNED:identity",validate_module_contracts(inv,config)["findings"])

def make_module_case(module):
    def test(self):
        inv,config=fixture()
        row=next(x for x in config["modules"] if x["id"]==module)
        if module not in CORE:
            row=activate(config,module)
        field=CONTROLS[module][0]
        row["controls"].pop(field)
        result=validate_module_contracts(inv,config)
        self.assertIn("CONTROL_MISSING:"+module+":"+field,result["findings"])
        self.assertFalse(result["agent_activation_authorized"])
    return test

for module_id in CONTROLS:
    setattr(CoreSemantics,"test_module_"+module_id.replace("-","_")+"_requires_control",make_module_case(module_id))

if __name__=="__main__":
    unittest.main()
