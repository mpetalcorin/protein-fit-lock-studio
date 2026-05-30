import urllib.request
from pathlib import Path

EXAMPLES = {
    "1A2Y.pdb": "https://files.rcsb.org/download/1A2Y.pdb",
    "1DQJ.pdb": "https://files.rcsb.org/download/1DQJ.pdb",
    "1N8Z.pdb": "https://files.rcsb.org/download/1N8Z.pdb",
}

def download_file(name, url):
    out = Path(__file__).parent / name
    print(f"Downloading {name}...")
    urllib.request.urlretrieve(url, out)
    print(f"Saved to {out}")

def main():
    for name, url in EXAMPLES.items():
        try:
            download_file(name, url)
        except Exception as exc:
            print(f"Failed to download {name}: {exc}")

if __name__ == "__main__":
    main()
