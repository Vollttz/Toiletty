import requests
import pandas as pd
import json
import time

def save_toilets_to_csv(toilets, filename='refuge_data.csv'):
    if not toilets:
        print("No toilets to save.")
        return
        
    # Convert to DataFrame
    df = pd.DataFrame.from_records(toilets)
    
    # Select only the columns we need and rename street to address
    columns_to_keep = {
        'name': 'name',
        'street': 'address',  # Rename street to address
        'latitude': 'latitude',
        'longitude': 'longitude'
    }
    
    # Filter and rename columns
    df = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)
    
    # Save as CSV
    df.to_csv(filename, index=False)
    print(f"Successfully saved {len(df)} toilets to {filename}")

def download_refuge_data():
    try:
        all_toilets = []
        page = 1
        total_fetched = 0
        per_page = 100  # Fetch 100 toilets per page
        max_retries = 3  # Number of times to retry on failure
        
        while True:
            # API endpoint with pagination and per_page parameter
            url = f"https://www.refugerestrooms.org/api/v1/restrooms?page={page}&per_page={per_page}"
            
            # Try to fetch data with retries
            for attempt in range(max_retries):
                try:
                    print(f"Fetching page {page} (attempt {attempt + 1}/{max_retries})...")
                    # Add timeout to the request
                    response = requests.get(url, timeout=30)
                    response.raise_for_status()
                    break
                except requests.exceptions.Timeout:
                    if attempt == max_retries - 1:
                        print("Max retries reached. Saving current data and exiting...")
                        save_toilets_to_csv(all_toilets)
                        return
                    print("Request timed out. Retrying...")
                    time.sleep(2)  # Wait 2 seconds before retrying
                except requests.exceptions.RequestException as e:
                    if attempt == max_retries - 1:
                        print(f"Max retries reached. Saving current data and exiting...")
                        save_toilets_to_csv(all_toilets)
                        return
                    print(f"Error on attempt {attempt + 1}: {e}")
                    time.sleep(2)
            
            # Get the data
            data = response.json()
            
            # Check if we got a list of toilets
            if not isinstance(data, list):
                print("Error: API response is not a list of toilets")
                print("Response structure:", json.dumps(data, indent=2)[:500])
                break
            
            # If no more data, break the loop
            if not data:
                break
                
            all_toilets.extend(data)
            total_fetched += len(data)
            print(f"Fetched {len(data)} toilets from page {page}")
            
            # Add a small delay between pages to avoid overwhelming the server
            time.sleep(1)
            
            # Move to next page
            page += 1
        
        if not all_toilets:
            print("No toilets were fetched. Please try again later.")
            return
            
        print(f"\nSuccessfully fetched {total_fetched} toilets total")
        save_toilets_to_csv(all_toilets)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        # Save any data we've collected so far
        if all_toilets:
            print("Saving partial data...")
            save_toilets_to_csv(all_toilets)

if __name__ == "__main__":
    download_refuge_data() 