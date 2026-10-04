import pandas as pd
import json
import os

def process_eicv():
    input_file = r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\dataset\IECV7\Microdata\Cross_Section\CS_S01_S5_S7_Household.dta"
    output_file = r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\backend\app\data\processed\district_metrics.json"
    
    print("Loading data...")
    # Load stata file, disable categorical conversion to see raw ints
    df_hh = pd.read_stata(input_file, convert_categoricals=False)
    
    # s5cq22a = primary cooking fuel
    # 1=Firewood, 2=Charcoal, 3=Crop waste, 4=Biogas, 5=LPG, 6=Electricity
    # We treat 1, 2, 3 as Biomass. 4, 5, 6 as Clean.
    df_hh['is_biomass'] = df_hh['s5cq22a'].isin([1, 2, 3]).astype(int)
    df_hh['is_clean'] = df_hh['s5cq22a'].isin([4, 5, 6]).astype(int)
    
    weight_col = 'weight'
    
    records = {}
    
    for district_id, group in df_hh.groupby('district'):
        total_weight = group[weight_col].sum()
        if total_weight == 0:
            continue
            
        biomass_rate = (group['is_biomass'] * group[weight_col]).sum() / total_weight * 100
        clean_rate = (group['is_clean'] * group[weight_col]).sum() / total_weight * 100
        
        estimated_households = int(total_weight)
        
        # Clean district_id if it's numeric
        try:
            dist_id_int = int(district_id)
        except:
            dist_id_int = str(district_id)
        
        records[dist_id_int] = {
            "biomass_reliance_rate": round(biomass_rate, 2),
            "clean_energy_rate": round(clean_rate, 2),
            "estimated_households": estimated_households,
            "transition_priority_score": round((biomass_rate * 0.7) + ((100 - clean_rate) * 0.3), 1)
        }
        
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(records, f, indent=2)
        
    print(f"Successfully processed {len(records)} districts and saved to {output_file}")

if __name__ == "__main__":
    process_eicv()
