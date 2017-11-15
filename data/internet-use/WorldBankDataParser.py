import pandas as pd
import json
internet_data = pd.read_csv("internet_user.csv", encoding='latin-1')
mobile_data = pd.read_csv("cellular_user.csv", encoding='latin-1')
internet_data = internet_data[[c for c in internet_data.columns if c not in ['CountryName', 'CountryCode']]]
mobile_data = mobile_data[[c for c in internet_data.columns if c not in ['CountryName', 'CountryCode']]]

internet_json = []
mobile_json = []

for col in internet_data.columns:
    year_sum = internet_data[col].mean()
    internet_json.append({'year': col, 'value': year_sum})

for col in mobile_data.columns:
    year_sum = mobile_data[col].mean()
    mobile_json.append({'year': col, 'value': year_sum})
    
with open('internet_user.json', 'w') as fp:
    json.dump(internet_json, fp)

with open('cellular_user.json', 'w') as fp:
    json.dump(mobile_json, fp)