import pandas as pd

try:
    person_df = pd.read_stata(r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\dataset\IECV7\Microdata\Cross_Section\CS_S0_S1_S2_S3_S4_S6A_S6B_S6C_Person.dta", iterator=True)
    print("Person variables:", person_df.variable_labels())
except Exception as e:
    print("Person Error:", e)

try:
    house_df = pd.read_stata(r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\dataset\IECV7\Microdata\Cross_Section\CS_S01_S5_S7_Household.dta", iterator=True)
    print("Household variables:", house_df.variable_labels())
except Exception as e:
    print("Household Error:", e)

try:
    census_df = pd.read_stata(r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\dataset\RPHC-2022\PHC5_Public_microdata\PHC5_Public_microdata.dta", iterator=True)
    print("Census variables:", census_df.variable_labels())
except Exception as e:
    print("Census Error:", e)
