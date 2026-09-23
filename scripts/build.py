"""
Build the store packages for Uttr.

Usage (from the project folder):
    python scripts/build.py

Creates:
    dist/uttr.zip          Chrome Web Store, Microsoft Edge Add-ons, Opera Add-ons
                           (also the GitHub Release download)
    dist/uttr-firefox.zip  Firefox Add-ons (addons.mozilla.org)

Why two packages? Firefox needs extra manifest settings
("browser_specific_settings") that Chrome doesn't recognise. Chrome shows a
warning for unknown keys, so the main manifest.json stays Chrome-clean and
this script adds the Firefox settings only to the Firefox package.

Uses only the Python standard library, so there's nothing to install.
"""

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

# Everything the extension needs at runtime. Anything not listed here
# (README, docs, scripts, .git) is left out of the packages.
FILES = [
    "manifest.json",
    "defaults.js",
    "content.js",
    "HOW-TO-INSTALL.txt",
    "popup/popup.html",
    "popup/popup.css",
    "popup/popup.js",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png",
]

# Firefox-only manifest additions.
FIREFOX_SETTINGS = {
    "gecko": {
        # Permanent ID for the add-on on addons.mozilla.org. Never change it
        # after the first upload, or Firefox treats it as a different add-on.
        "id": "uttr@ajayalle10",
        # Oldest Firefox allowed to install Uttr. Intl.Segmenter needs 125,
        # but "data_collection_permissions" below needs 140 on desktop and
        # 142 on Android, so 142 covers everything.
        "strict_min_version": "142.0",
        # Mozilla requires every new add-on to declare what data it collects.
        # Uttr collects nothing.
        "data_collection_permissions": {"required": ["none"]},
    }
}


def build(zip_name, manifest):
    """Write one package. Files go at the root of the ZIP (no wrapper
    folder), which is what every store requires."""
    out = DIST / zip_name
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for f in FILES:
            if f == "manifest.json":
                z.writestr(f, json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
            else:
                z.write(ROOT / f, f)
    print(f"  {out.relative_to(ROOT)}  ({out.stat().st_size:,} bytes)")


def main():
    DIST.mkdir(exist_ok=True)
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    print(f"Building Uttr v{manifest['version']}")

    build("uttr.zip", manifest)
    build("uttr-firefox.zip", {**manifest, "browser_specific_settings": FIREFOX_SETTINGS})


if __name__ == "__main__":
    main()
