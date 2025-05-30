import pandas as pd
import numpy as np

# Read the existing CSV file
df = pd.read_csv('refuge_data.csv')

# Print the column names to see what we're working with
print("Available columns:", df.columns.tolist())

# Select only the columns we want and rename street to address
columns_to_keep = {
    'name': 'name',
    'address': 'address',  # Changed from 'street' to 'address' since that's what's in the file
    'latitude': 'latitude',
    'longitude': 'longitude'
}

# Filter and rename columns
df = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)

# Clean up latitude and longitude
# Replace empty strings with NaN
df['latitude'] = df['latitude'].replace('', np.nan)
df['longitude'] = df['longitude'].replace('', np.nan)

# Convert to float, invalid values will become NaN
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')

# Remove rows where either latitude or longitude is NaN
df = df.dropna(subset=['latitude', 'longitude'])

# Save back to CSV
df.to_csv('refuge_data.csv', index=False)
print(f"Successfully updated CSV file with {len(df)} toilets")
print(f"Removed {len(df) - len(df.dropna(subset=['latitude', 'longitude']))} rows with invalid coordinates") 