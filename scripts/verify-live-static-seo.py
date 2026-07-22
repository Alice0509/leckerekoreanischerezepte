#!/usr/bin/env python3

from html.parser import HTMLParser
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess
import sys
import time


ORIGINS = {
    "de": "https://www.leckere-koreanische-rezepte.de",
    "en": "https://www.hansikyoung.com",
}

PAGES = [
    ("DE 홈", "de", "/", "Koreanische Hausmannskost"),
    ("DE 재료", "de", "/ingredients", "Koreanische Zutaten"),
    ("DE 즐겨찾기", "de", "/gallery", "Meine Einkaufsliste"),
    ("DE 소개", "de", "/about-us", "Über Hansik Young"),
    ("DE 레시피", "de", "/recipes/miyeokguk", None),
    ("EN 홈", "en", "/", "Warm Korean recipes"),
    ("EN 재료", "en", "/ingredients", "Korean ingredients"),
    ("EN 즐겨찾기", "en", "/gallery", "My Shopping List"),
    ("EN 소개", "en", "/about-us", "About Hansik Young"),
    ("EN 레시피", "en", "/recipes/miyeokguk", None),
]


def normalize_url(value):
    if not value:
        return ""
    return value.rstrip("/")


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.html_lang = ""
        self.canonical = ""
        self.manifest = ""
        self.alternates = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        if tag == "html":
            self.html_lang = attrs.get("lang", "").lower()

        if tag != "link":
            return

        rel = attrs.get("rel", "")
        href = attrs.get("href", "")
        hreflang = attrs.get("hreflang", "").lower()

        rel_values = rel.lower().split()

        if "canonical" in rel_values:
            self.canonical = href

        if "manifest" in rel_values:
            self.manifest = href

        if "alternate" in rel_values and hreflang:
            self.alternates[hreflang] = href


def curl_to_file(url, destination):
    result = subprocess.run(
        [
            "curl",
            "-L",
            "-sS",
            "--fail",
            "--max-time",
            "30",
            "-H",
            "Cache-Control: no-cache",
            "-H",
            "Pragma: no-cache",
            "-o",
            str(destination),
            "-w",
            "%{http_code}\n%{url_effective}",
            url,
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "curl request failed")

    lines = result.stdout.strip().splitlines()
    status = int(lines[0]) if lines else 0
    final_url = lines[1] if len(lines) > 1 else url

    return status, final_url


def expected_url(locale, path):
    origin = ORIGINS[locale]
    return origin if path == "/" else f"{origin}{path}"


def check_page(label, locale, path, expected_phrase, index, temp_dir, cache_key):
    clean_url = expected_url(locale, path)
    separator = "&" if "?" in clean_url else "?"
    request_url = f"{clean_url}{separator}qa={cache_key}-{index}"

    html_path = Path(temp_dir) / f"page-{index}.html"

    try:
        status, final_url = curl_to_file(request_url, html_path)
    except RuntimeError as error:
        print(f"[FAIL] {label}")
        print(f"       요청 실패: {error}")
        return False

    html = html_path.read_text(encoding="utf-8", errors="replace")

    parser = PageParser()
    parser.feed(html)

    expected_manifest = f"/manifest-{locale}.json"
    expected_canonical = expected_url(locale, path)

    expected_alternates = {
        "de": expected_url("de", path),
        "en": expected_url("en", path),
        "x-default": expected_url("en", path),
    }

    checks = {
        "HTTP 200": status == 200,
        "올바른 도메인": ORIGINS[locale] in final_url,
        "HTML lang": parser.html_lang.startswith(locale),
        "canonical": normalize_url(parser.canonical)
        == normalize_url(expected_canonical),
        "hreflang DE": normalize_url(parser.alternates.get("de"))
        == normalize_url(expected_alternates["de"]),
        "hreflang EN": normalize_url(parser.alternates.get("en"))
        == normalize_url(expected_alternates["en"]),
        "x-default": normalize_url(parser.alternates.get("x-default"))
        == normalize_url(expected_alternates["x-default"]),
        "manifest": parser.manifest == expected_manifest,
    }

    if expected_phrase:
        checks["언어별 본문"] = expected_phrase in html

    failed = [name for name, passed in checks.items() if not passed]

    if not failed:
        print(f"[OK]   {label}: {clean_url}")
        return True

    print(f"[FAIL] {label}: {clean_url}")
    print(f"       실패: {', '.join(failed)}")
    print(f"       status={status}")
    print(f"       final={final_url}")
    print(f"       lang={parser.html_lang or '(없음)'}")
    print(f"       canonical={parser.canonical or '(없음)'}")
    print(f"       manifest={parser.manifest or '(없음)'}")
    print(f"       hreflang={sorted(parser.alternates)}")

    return False


def check_manifest(locale, index, temp_dir, cache_key):
    manifest_name = f"manifest-{locale}.json"
    clean_url = f"{ORIGINS[locale]}/{manifest_name}"
    request_url = f"{clean_url}?qa={cache_key}-{index}"
    manifest_path = Path(temp_dir) / manifest_name

    try:
        status, _ = curl_to_file(request_url, manifest_path)
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (RuntimeError, json.JSONDecodeError) as error:
        print(f"[FAIL] {locale.upper()} manifest")
        print(f"       {error}")
        return False

    checks = {
        "HTTP 200": status == 200,
        "lang": data.get("lang") == locale,
        "name": bool(data.get("name")),
        "short_name": bool(data.get("short_name")),
        "icons": bool(data.get("icons")),
    }

    failed = [name for name, passed in checks.items() if not passed]

    if not failed:
        print(f"[OK]   {locale.upper()} manifest: {clean_url}")
        return True

    print(f"[FAIL] {locale.upper()} manifest")
    print(f"       실패: {', '.join(failed)}")
    return False


def main():
    cache_key = int(time.time())
    results = []

    with TemporaryDirectory() as temp_dir:
        for index, page in enumerate(PAGES):
            results.append(
                check_page(*page, index, temp_dir, cache_key)
            )

        results.append(
            check_manifest("de", len(PAGES), temp_dir, cache_key)
        )
        results.append(
            check_manifest("en", len(PAGES) + 1, temp_dir, cache_key)
        )

    passed = sum(results)
    total = len(results)

    print()
    print(f"결과: {passed}/{total} 통과")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    main()
