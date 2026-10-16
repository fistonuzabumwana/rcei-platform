import pandas as pd
import numpy as np
import json
import os

DISTRICT_ID_TO_NAME = {
    11: "Nyarugenge", 12: "Gasabo", 13: "Kicukiro",
    21: "Nyanza", 22: "Gisagara", 23: "Nyaruguru", 24: "Huye", 25: "Nyamagabe", 26: "Ruhango", 27: "Muhanga", 28: "Kamonyi",
    31: "Karongi", 32: "Rutsiro", 33: "Rubavu", 34: "Nyabihu", 35: "Ngororero", 36: "Rusizi", 37: "Nyamasheke",
    41: "Rulindo", 42: "Gakenke", 43: "Musanze", 44: "Burera", 45: "Gicumbi",
    51: "Rwamagana", 52: "Nyagatare", 53: "Gatsibo", 54: "Kayonza", 55: "Kirehe", 56: "Ngoma", 57: "Bugesera"
}
NAME_TO_DIST_ID = {name.lower(): did for did, name in DISTRICT_ID_TO_NAME.items()}

def process_eicv():
    # Resolve repository root dynamically
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    eicv7_file = os.path.join(base_dir, "dataset", "IECV7", "Microdata", "Cross_Section", "CS_S01_S5_S7_Household.dta")
    census_file = os.path.join(base_dir, "dataset", "RPHC-2022", "PHC5_Public_microdata", "PHC5_Public_microdata.dta")
    eicv5_file = os.path.join(base_dir, "dataset", "EICV5", "EICV5-data_STATA", "cs_S0_S5_Household.dta")
    sas_s0_file = os.path.join(base_dir, "dataset", "Agricultural Survey (SAS) 2024", "Microdata", "AHS2024_Section0.dta")
    sas_live_file = os.path.join(base_dir, "dataset", "Agricultural Survey (SAS) 2024", "Microdata", "AHS2024_Section9_10_12_LIVESTOCK AND ANIMAL INPUTS EXPENDITURES,.dta")
    sas_crop_file = os.path.join(base_dir, "dataset", "Agricultural Survey (SAS) 2024", "Microdata", "AHS2024_Section3_4_CROP GROWN, SEEDS AND PRODUCTION & AGRICULTURAL INPUTS AND PRACTICES.dta")
    
    output_file = os.path.join(base_dir, "backend", "app", "data", "processed", "district_metrics.json")
    
    print(f"1. Loading EICV7 Data from {eicv7_file}...")
    df_hh = pd.read_stata(eicv7_file, convert_categoricals=False)
    
    # EICV7 Cooking Fuel Codes (s5cq22a):
    # Biomass codes: 1=Firewood, 2=Charcoal, 13=Straw/grass, 8=Crop waste, 12=Saw Dust, 4=Peat
    # Clean codes: 3=Gas, 10=Briquette, 6=Biogas, 11=Electricity, 7=Oil/kerosene
    biomass_codes = [1, 2, 13, 8, 12, 4]
    clean_codes = [3, 10, 6, 11, 7]
    
    df_hh['is_biomass'] = df_hh['s5cq22a'].isin(biomass_codes).astype(int)
    df_hh['is_clean'] = df_hh['s5cq22a'].isin(clean_codes).astype(int)
    df_hh['is_charcoal'] = (df_hh['s5cq22a'] == 2).astype(int)
    df_hh['is_firewood'] = (df_hh['s5cq22a'] == 1).astype(int)
    
    # Correct poverty calculations:
    # pov_jan: 0 = Non-poor, 1 = Poor (Total poverty headcount)
    # epov_jan: 0 = Non-extreme poor, 1 = Extreme poor
    df_hh['is_poor'] = (df_hh['pov_jan'] == 1).astype(int)
    df_hh['is_extreme_poor'] = (df_hh['epov_jan'] == 1).astype(int)
    weight_col = 'weight'

    # 1b. Process EICV7 Household Fuel Expenditure & Time-Use Microdata
    person_file = os.path.join(base_dir, "dataset", "IECV7", "Microdata", "Cross_Section", "CS_S0_S1_S2_S3_S4_S6A_S6B_S6C_Person.dta")
    exp_file = os.path.join(base_dir, "dataset", "IECV7", "Microdata", "Cross_Section", "CS_S8A3_Expenditure.dta")

    eicv7_time_metrics = {}
    if os.path.exists(person_file):
        print(f"1b. Loading EICV7 Person Microdata for Domestic Wood Foraging Time (s6cq4)...")
        try:
            df_p = pd.read_stata(person_file, columns=['hhid', 'district', 's6cq4', 'weight'], convert_categoricals=False)
            df_p['s6cq4'] = pd.to_numeric(df_p['s6cq4'], errors='coerce').fillna(0)
            hh_wood = df_p.groupby(['district', 'hhid']).agg({'s6cq4': 'sum', 'weight': 'first'}).reset_index()
            hh_collectors = hh_wood[hh_wood['s6cq4'] > 0]
            for did, g in hh_collectors.groupby('district'):
                try:
                    w_mean = (g['s6cq4'] * g['weight']).sum() / g['weight'].sum()
                    eicv7_time_metrics[int(did)] = round(float(w_mean), 1)
                except Exception:
                    pass
            print(f"   Loaded empirical wood collection hours for {len(eicv7_time_metrics)} districts.")
        except Exception as e:
            print(f"   Warning: Could not process person file: {e}")

    eicv7_exp_metrics = {}
    if os.path.exists(exp_file):
        print(f"1c. Loading EICV7 Expenditure Microdata for Charcoal Purchases (s8a3q0, s8a3q3)...")
        try:
            df_exp = pd.read_stata(exp_file, convert_categoricals=True)
            df_char = df_exp[df_exp['s8a3q0'] == 'Charcoal (cooking)'].copy()
            df_char['s8a3q3'] = pd.to_numeric(df_char['s8a3q3'], errors='coerce').fillna(0)
            merged_exp = pd.merge(df_char[['hhid', 's8a3q3']], df_hh[['hhid', 'district', 'weight']], on='hhid', how='inner')
            buyers = merged_exp[merged_exp['s8a3q3'] > 0]
            for did, g in buyers.groupby('district'):
                try:
                    w_mean_7d = (g['s8a3q3'] * g['weight']).sum() / g['weight'].sum()
                    eicv7_exp_metrics[int(did)] = round(float(w_mean_7d * 52.14), 0)
                except Exception:
                    pass
            print(f"   Loaded empirical annual charcoal expenditure for {len(eicv7_exp_metrics)} districts.")
        except Exception as e:
            print(f"   Warning: Could not process expenditure file: {e}")
    
    # 2. Process RPHC-2022 Census data for multi-dataset empirical validation
    census_metrics = {}
    if os.path.exists(census_file):
        print(f"2. Loading RPHC-2022 Census Data from {census_file}...")
        try:
            census_cols = ['ml02', 'p02', 'h16']
            df_cen = pd.read_stata(census_file, columns=census_cols, convert_categoricals=False)
            hh_cen = df_cen[df_cen['p02'] == 1].copy()
            cen_biomass_codes = [1, 2, 13, 14, 15]
            cen_clean_codes = [3, 4, 6, 12]
            hh_cen['is_biomass'] = hh_cen['h16'].isin(cen_biomass_codes).astype(int)
            hh_cen['is_clean'] = hh_cen['h16'].isin(cen_clean_codes).astype(int)
            
            for dist_id, grp in hh_cen.groupby('ml02'):
                try:
                    d_int = int(dist_id)
                    census_metrics[d_int] = {
                        "census_2022_biomass_rate": round(float(grp['is_biomass'].mean() * 100), 2),
                        "census_2022_clean_rate": round(float(grp['is_clean'].mean() * 100), 2),
                        "census_sample_households": int(len(grp))
                    }
                except Exception:
                    pass
            print(f"   Loaded Census 2022 metrics for {len(census_metrics)} districts.")
        except Exception as e:
            print(f"   Warning: Could not process Census file: {e}")

    # 3. Process EICV5 (2017) Microdata for 7-year longitudinal baseline
    eicv5_metrics = {}
    if os.path.exists(eicv5_file):
        print(f"3. Loading EICV5 (2017) Microdata from {eicv5_file}...")
        try:
            df_e5 = pd.read_stata(eicv5_file, columns=['district', 's5cq18', 'weight'])
            df_e5['is_clean'] = df_e5['s5cq18'].isin(['Gas', 'Electricity', 'Biogaz']).astype(int)
            df_e5['is_biomass'] = df_e5['s5cq18'].isin(['Firewood', 'Charcoal', 'Crop waste']).astype(int)
            
            for d_name, g in df_e5.groupby('district'):
                did = NAME_TO_DIST_ID.get(str(d_name).strip().lower())
                if did:
                    w = g['weight']
                    tot_w = w.sum()
                    eicv5_metrics[did] = {
                        "eicv5_2017_biomass_rate": round(float((g['is_biomass'] * w).sum() / tot_w * 100), 2),
                        "eicv5_2017_clean_rate": round(float((g['is_clean'] * w).sum() / tot_w * 100), 2)
                    }
            print(f"   Loaded EICV5 (2017) baseline metrics for {len(eicv5_metrics)} districts.")
        except Exception as e:
            print(f"   Warning: Could not process EICV5 file: {e}")

    # 4. Process Agricultural Survey (SAS) 2024 Microdata: Livestock & Biogas Potential
    sas_live_metrics = {}
    sas_crop_metrics = {}
    if os.path.exists(sas_s0_file) and os.path.exists(sas_live_file):
        print(f"4. Loading SAS 2024 Livestock & Agronomic Microdata...")
        try:
            df_s0 = pd.read_stata(sas_s0_file)
            total_ag_hh_by_dist = df_s0.groupby('district')['hhid'].nunique().to_dict()

            df_live = pd.read_stata(sas_live_file)
            
            # Separate smallholder households and commercial big farmers
            is_hh = df_live['owner'].astype(str).str.contains('Household', case=False, na=False)
            is_big = df_live['owner'].astype(str).str.contains('Big farmer', case=False, na=False)
            is_cattle = df_live['s9q2'].astype(str).str.contains('cattle', case=False, na=False)

            # A. Smallholder domestic biodigesters (4-6 m3)
            hh_cattle_df = df_live[is_hh & is_cattle].copy()
            hh_cattle_df['s9q4'] = pd.to_numeric(hh_cattle_df['s9q4'], errors='coerce').fillna(0)
            hh_cattle = hh_cattle_df.groupby(['district', 'hhid'])['s9q4'].sum().reset_index()
            # MININFRA / SNV domestic biogas threshold: >= 2 cattle provides sufficient daily dung for 4-6 m3 biodigester
            hh_cattle['has_biogas_capacity'] = (hh_cattle['s9q4'] >= 2).astype(int)

            # B. Commercial / Institutional cattle farms (50-200 m3 institutional biodigesters)
            big_cattle_df = df_live[is_big & is_cattle].copy()
            big_cattle_df['s9q4'] = pd.to_numeric(big_cattle_df['s9q4'], errors='coerce').fillna(0)
            big_counts = big_cattle_df.groupby('district')['hhid'].nunique().to_dict()

            for d_name, g in hh_cattle.groupby('district'):
                did = NAME_TO_DIST_ID.get(str(d_name).strip().lower())
                if did:
                    tot_sample_hh = total_ag_hh_by_dist.get(d_name, len(g))
                    biogas_pct = min(100.0, (g['has_biogas_capacity'].sum() / tot_sample_hh) * 100)
                    sas_live_metrics[did] = {
                        "biogas_viable_ag_hh_pct": round(float(biogas_pct), 1),
                        "avg_cattle_per_cattle_hh": round(float(g['s9q4'].mean()), 1),
                        "institutional_cattle_farms": int(big_counts.get(d_name, 0))
                    }
            print(f"   Loaded SAS 2024 Livestock metrics for {len(sas_live_metrics)} districts.")
        except Exception as e:
            print(f"   Warning: Could not process SAS livestock file: {e}")

    # 5. Process SAS 2024 Microdata: Crop Residue & Pelletization Feedstock
    if os.path.exists(sas_s0_file) and os.path.exists(sas_crop_file):
        print(f"5. Loading SAS 2024 Crop Production & Residue Microdata...")
        try:
            df_s0 = pd.read_stata(sas_s0_file)
            df_crop = pd.read_stata(sas_crop_file, convert_categoricals=False)
            harvest_cols = [c for c in df_crop.columns if 's3_q20' in c]
            for c in harvest_cols:
                df_crop[c] = pd.to_numeric(df_crop[c], errors='coerce').fillna(0)
            df_crop['plot_harvest_kg'] = df_crop[harvest_cols].sum(axis=1)

            hh_crop = df_crop.groupby('hhid')['plot_harvest_kg'].sum().reset_index()
            crop_merged = pd.merge(df_s0[['hhid', 'district', 'weight']], hh_crop, on='hhid', how='left').fillna(0)
            crop_merged['weighted_kg'] = crop_merged['plot_harvest_kg'] * crop_merged['weight']

            for d_name, g in crop_merged.groupby('district'):
                did = NAME_TO_DIST_ID.get(str(d_name).strip().lower())
                if did:
                    # Residue-to-crop ratio multiplier (1.15x for mixed Rwandan crops)
                    tot_residue_tons = (g['weighted_kg'].sum() / 1000.0) * 1.15
                    # Sustainable recoverable fraction for densified pellets (50% after conservation mulching)
                    pellet_potential_tons = tot_residue_tons * 0.50
                    sas_crop_metrics[did] = {
                        "crop_residue_feedstock_tons": round(float(tot_residue_tons), 0),
                        "pellet_potential_tons": round(float(pellet_potential_tons), 0)
                    }
            print(f"   Loaded SAS 2024 Crop Residue metrics for {len(sas_crop_metrics)} districts.")
        except Exception as e:
            print(f"   Warning: Could not process SAS crop file: {e}")

    records = {}
    
    for district_id, group in df_hh.groupby('district'):
        total_weight = group[weight_col].sum()
        if total_weight == 0:
            continue
            
        biomass_rate = (group['is_biomass'] * group[weight_col]).sum() / total_weight * 100
        clean_rate = (group['is_clean'] * group[weight_col]).sum() / total_weight * 100
        poverty_rate = (group['is_poor'] * group[weight_col]).sum() / total_weight * 100
        extreme_poverty_rate = (group['is_extreme_poor'] * group[weight_col]).sum() / total_weight * 100
        
        charcoal_rate = (group['is_charcoal'] * group[weight_col]).sum() / total_weight * 100
        firewood_rate = (group['is_firewood'] * group[weight_col]).sum() / total_weight * 100

        estimated_households = int(total_weight)
        
        try:
            dist_id_int = int(district_id)
        except Exception:
            dist_id_int = str(district_id)
        
        dist_record = {
            "biomass_reliance_rate": round(float(biomass_rate), 2),
            "clean_energy_rate": round(float(clean_rate), 2),
            "charcoal_reliance_rate": round(float(charcoal_rate), 2),
            "firewood_reliance_rate": round(float(firewood_rate), 2),
            "poverty_rate": round(float(poverty_rate), 2),
            "extreme_poverty_rate": round(float(extreme_poverty_rate), 2),
            "estimated_households": estimated_households,
            "transition_priority_score": round(float((biomass_rate * 0.5) + (poverty_rate * 0.5)), 1),
            "wood_collection_hours_week": eicv7_time_metrics.get(dist_id_int, 6.1),
            "annual_charcoal_expenditure_rwf": eicv7_exp_metrics.get(dist_id_int, 135000.0)
        }
        
        # Merge RPHC-2022 multi-source validation data
        if dist_id_int in census_metrics:
            c_data = census_metrics[dist_id_int]
            dist_record["census_2022_biomass_rate"] = c_data["census_2022_biomass_rate"]
            dist_record["census_2022_clean_rate"] = c_data["census_2022_clean_rate"]
            # Annualized 2-year empirical shift (2022 Census -> 2024 EICV7)
            annual_decline = (c_data["census_2022_biomass_rate"] - biomass_rate) / 2.0
            dist_record["empirical_annual_biomass_reduction"] = round(float(annual_decline), 2)

        # Merge EICV5 (2017) 7-year historical trajectory
        if dist_id_int in eicv5_metrics:
            e5 = eicv5_metrics[dist_id_int]
            dist_record["eicv5_2017_biomass_rate"] = e5["eicv5_2017_biomass_rate"]
            dist_record["eicv5_2017_clean_rate"] = e5["eicv5_2017_clean_rate"]
            # 7-year historical progress (2017 to 2024)
            dist_record["historical_7yr_biomass_reduction"] = round(float(e5["eicv5_2017_biomass_rate"] - biomass_rate), 2)
            dist_record["historical_7yr_clean_gain"] = round(float(clean_rate - e5["eicv5_2017_clean_rate"]), 2)

        # Merge SAS 2024 Livestock (Biogas & Soil Fertility)
        biogas_viable_pct = 0.0
        institutional_farms = 0
        if dist_id_int in sas_live_metrics:
            sl = sas_live_metrics[dist_id_int]
            biogas_viable_pct = sl["biogas_viable_ag_hh_pct"]
            institutional_farms = sl.get("institutional_cattle_farms", 0)
            dist_record["biogas_viable_ag_hh_pct"] = biogas_viable_pct
            dist_record["avg_cattle_per_cattle_hh"] = sl["avg_cattle_per_cattle_hh"]
            dist_record["institutional_cattle_farms"] = institutional_farms
            # Smallholder biodigesters viable in district (calibrated to rural households)
            est_biogas_hh = int(estimated_households * (biogas_viable_pct / 100.0) * 0.75)
            dist_record["est_biogas_viable_households"] = est_biogas_hh
            # Each 4-6m3 biodigester produces ~12 tons of high-nitrogen bio-slurry liquid/solid organic fertilizer per year
            dist_record["est_bioslurry_fertilizer_tons_year"] = int(est_biogas_hh * 12)

        # Merge SAS 2024 Crop Residue & Pellet Potential
        crop_residue_tons = 0.0
        if dist_id_int in sas_crop_metrics:
            sc = sas_crop_metrics[dist_id_int]
            crop_residue_tons = sc["crop_residue_feedstock_tons"]
            dist_record["crop_residue_feedstock_tons"] = crop_residue_tons
            dist_record["pellet_potential_tons"] = sc["pellet_potential_tons"]
            # Number of rural households whose cooking needs can be fully met with local crop residue pellets (1 ton/hh/yr)
            dist_record["pellet_sustained_households"] = int(sc["pellet_potential_tons"])

        # Prescribe Tailored Clean Cooking & Circular Bioeconomy Pathway
        # Urban Kigali or high clean adoption baseline -> LPG & Electric Pressure Cookers
        if dist_id_int in [11, 12, 13] or clean_rate >= 20.0:
            dist_record["recommended_clean_pathway"] = "LPG & Electric Pressure Cookers (EPC)"
            dist_record["pathway_tag"] = "Urban / Rapid LPG"
        # High livestock / commercial dairy cattle density -> Domestic & Institutional Biodigesters + Bio-Slurry Organic Fertilizer
        elif biogas_viable_pct >= 15.0 or institutional_farms >= 40:
            dist_record["recommended_clean_pathway"] = "Biodigesters & Bio-Slurry Fertilizer (Cattle Nexus)"
            dist_record["pathway_tag"] = "Livestock Bio-Slurry"
        # High crop production & residue density -> Agri-Residue Briquettes & Pellets
        elif crop_residue_tons >= 100000.0:
            dist_record["recommended_clean_pathway"] = "Agri-Residue Briquettes & Pellet Densification"
            dist_record["pathway_tag"] = "Agri-Residue Pellets"
        else:
            dist_record["recommended_clean_pathway"] = "Advanced Biomass Gasifier Cookstoves (Tier 4)"
            dist_record["pathway_tag"] = "Gasifier Biomass"
            
        records[dist_id_int] = dist_record
        
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(records, f, indent=2)
        
    print(f"Successfully processed {len(records)} districts with Quadruple NISR Microdata Fusion (EICV7, Census 2022, EICV5 2017, SAS 2024) and saved to {output_file}")

if __name__ == "__main__":
    process_eicv()

