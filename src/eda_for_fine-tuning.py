import pandas as pd
from collections import Counter
from ast import literal_eval
import json

from sklearn.model_selection import train_test_split

arxiv_data = pd.read_csv("./archive/arxiv_data.csv")

arxiv_data = arxiv_data[~arxiv_data["titles"].duplicated()]

arxiv_data["terms"] = arxiv_data["terms"].apply(literal_eval)

terms_counter = Counter(tuple(terms) for terms in arxiv_data["terms"])

min_frequency = 3
filtered_data = arxiv_data[arxiv_data["terms"].apply(lambda x: terms_counter[tuple(x)] >= min_frequency)]


train_df, test_df = train_test_split(filtered_data, test_size=0.1, stratify=filtered_data["terms"].values)
val_df = test_df.sample(frac=0.5)
test_df.drop(val_df.index, inplace=True)

def save_to_jsonl(df, filename):
    records = df.to_dict(orient='records')
    with open(filename, 'w', encoding='utf-8') as f:
        for record in records:
            json.dump(record, f, ensure_ascii=False)
            f.write('\n')

save_to_jsonl(train_df, 'train_data.jsonl')
save_to_jsonl(val_df, 'val_data.jsonl')
save_to_jsonl(test_df, 'test_data.jsonl')
