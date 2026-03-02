import json
import sys

def main():
    with open('C:/Users/MaxDe/.gemini/antigravity/brain/2315e462-e160-4a50-ad28-cdced4148049/.system_generated/steps/34/output.txt', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded project: {data.get('title')}")
    print(f"Screens count: {len(data.get('screenInstances', []))}")
    for screen in data.get('screenInstances', []):
        print(f"Screen: {screen.get('id')}")

if __name__ == '__main__':
    main()
