import pandas as pd
import json

df = pd.read_stata(r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\dataset\IECV7\Microdata\Cross_Section\CS_S01_S5_S7_Household.dta", iterator=True)
variables = df.variable_labels()

w_vars = {k: v for k, v in variables.items() if 'weight' in v.lower()}

with open("cols.json", "w") as f:
    json.dump(w_vars, f, indent=2)
