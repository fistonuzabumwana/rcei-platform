import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import os

print("Loading EICV7 Data...")
input_file = r"c:\Users\youfi\Desktop\LinuxDoc\Project\NISR Hackton\rcei-platform\dataset\IECV7\Microdata\Cross_Section\CS_S01_S5_S7_Household.dta"
df = pd.read_stata(input_file, convert_categoricals=False)

# Filter out rows missing vital data
df = df.dropna(subset=['s5cq22a', 'pov_jan', 'ur', 'district'])

# Create basic features
df['is_urban'] = (df['ur'] == 1).astype(int)
df['is_extreme_poor'] = (df['pov_jan'] == 3).astype(int)
df['is_poor'] = (df['pov_jan'] == 2).astype(int)
df['dist'] = df['district'].astype(str)

biomass_codes = [1, 2, 13, 8, 12, 4]
biomass_users = df[df['s5cq22a'].isin(biomass_codes)].copy()
print(f"Total biomass households in sample: {len(biomass_users)}")

print("Generating synthetic RCT dataset for pricing...")
np.random.seed(42)

expanded_df = pd.DataFrame(np.repeat(biomass_users.values, 5, axis=0), columns=biomass_users.columns)
expanded_df['lpg_kit_price'] = np.random.uniform(5000, 100000, size=len(expanded_df))

base_prob = 1.0 - (expanded_df['lpg_kit_price'].astype(float) / 100000)
urban_bonus = expanded_df['is_urban'].astype(float) * 0.15
poor_penalty = expanded_df['is_poor'].astype(float) * 0.20
extreme_poor_penalty = expanded_df['is_extreme_poor'].astype(float) * 0.40

expanded_df['switch_prob'] = base_prob + urban_bonus - poor_penalty - extreme_poor_penalty
expanded_df['switch_prob'] += np.random.normal(0, 0.05, size=len(expanded_df))
expanded_df['switch_prob'] = expanded_df['switch_prob'].clip(0, 1).astype(float)

features = ['is_urban', 'is_extreme_poor', 'is_poor', 'lpg_kit_price']
X = expanded_df[features].astype(float)
y = expanded_df['switch_prob']

print("Training Random Forest Regressor...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, max_depth=10, n_jobs=-1, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"Model trained! RMSE: {rmse:.4f}")

# Save the model
model_path = 'backend/app/core/adoption_model.pkl'
os.makedirs('backend/app/core', exist_ok=True)
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")

# Output feature importances
importances = model.feature_importances_
for name, imp in zip(features, importances):
    print(f"Feature '{name}': {imp:.4f}")
