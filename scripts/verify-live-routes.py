#!/usr/bin/env python3

from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit, urlunsplit
import json
import subprocess
import sys


ORIGINS = {
    "de": "https://www.leckere-koreanische-rezepte.de",
    "en": "https://www.hansikyoung.com",
}

BASE_REDIRECTS = [
    (
        "EN apex → www",
        "https://hansikyoung.com/ingredients",
        "https://www.hansikyoung.com/ingredients",
    ),
    (
        "DE apex → www",
        "https://leckere-koreanische-rezepte.de/ingredients",
        "https://www.leckere-koreanische-rezepte.de/ingredients",
    ),
    (
        "hansikyoung.de → DE",
        "https://hansikyoung.de/ingredients",
        "https://www.leckere-koreanische-rezepte.de/ingredients",
    ),
    (
        "www.hansikyoung.de → DE",
        "https://www.hansikyoung.de/ingredients",
        "https://www.leckere-koreanische-rezepte.de/ingredients",
    ),
]

ASSETS = [
    (
        "DE robots",
        "https://www.leckere-koreanische-rezepte.de/robots.txt",
        [
            "User-agent:",
            "Sitemap: https://www.leckere-koreanische-rezepte.de/sitemap.xml",
        ],
    ),
    (
        "EN robots",
        "https://www.hansikyoung.com/robots.txt",
        [
            "User-agent:",
            "Sitemap: https://www.hansikyoung.com/sitemap.xml",
        ],
    ),
    (
        "DE sitemap",
        "https://www.leckere-koreanische-rezepte.de/sitemap.xml",
        [
            "www.leckere-koreanische-rezepte.de",
        ],
    ),
    (
        "EN sitemap",
        "https://www.hansikyoung.com/sitemap.xml",
        [
            "www.hansikyoung.com",
        ],
    ),
]

REDIRECT_CODES = {301, 302, 307, 308}


def normalize_url(url):
    parts = urlsplit(url)
    path = parts.path.rstrip("/") or "/"

    return urlunsplit(
        (
            parts.scheme.lower(),
            parts.netloc.lower(),
            path,
            "",
            "",
        )
    )


def run_curl(arguments):
    return subprocess.run(
        [
            "curl",
            "-sS",
            "--max-time",
            "30",
            "-H",
            "Cache-Control: no-cache",
            "-H",
            "Pragma: no-cache",
            *arguments,
        ],
        capture_output=True,
        text=True,
    )


def load_recipe_route_checks():
    route_path = Path("lib/generated-localized-routes.json")

    if not route_path.exists():
        raise RuntimeError(
            "lib/generated-localized-routes.json 파일이 없습니다."
        )

    data = json.loads(route_path.read_text(encoding="utf-8"))

    same = []
    different = []

    for recipe in data.get("recipesById", {}).values():
        de_slug = (recipe.get("de") or "").strip()
        en_slug = (recipe.get("en") or "").strip()

        if not de_slug or not en_slug:
            continue

        if de_slug == en_slug:
            same.append((de_slug, en_slug))
        else:
            different.append((de_slug, en_slug))

    same.sort()
    different.sort()

    print(f"[INFO] 같은 DE/EN recipe slug: {len(same)}개")
    print(f"[INFO] 서로 다른 DE/EN recipe slug: {len(different)}개")

    direct_checks = []
    redirect_checks = []

    if same:
        de_slug, en_slug = same[0]

        print(
            "[INFO] same-slug direct test: "
            f"DE={de_slug}, EN={en_slug}"
        )

        direct_checks.extend(
            [
                (
                    "DE same-slug recipe stays direct",
                    f"{ORIGINS['de']}/recipes/{de_slug}",
                ),
                (
                    "EN same-slug recipe stays direct",
                    f"{ORIGINS['en']}/recipes/{en_slug}",
                ),
            ]
        )

    if different:
        de_slug, en_slug = different[0]

        print(
            "[INFO] localized redirect test: "
            f"DE={de_slug}, EN={en_slug}"
        )

        redirect_checks.extend(
            [
                (
                    "DE domain corrects EN recipe slug",
                    f"{ORIGINS['de']}/recipes/{en_slug}",
                    f"{ORIGINS['de']}/recipes/{de_slug}",
                ),
                (
                    "EN domain corrects DE recipe slug",
                    f"{ORIGINS['en']}/recipes/{de_slug}",
                    f"{ORIGINS['en']}/recipes/{en_slug}",
                ),
            ]
        )
    else:
        print(
            "[INFO] 서로 다른 localized slug가 없어 "
            "recipe redirect 검사를 생략합니다."
        )

    return direct_checks, redirect_checks


def check_redirect(label, source, expected):
    result = run_curl(
        [
            "-o",
            "/dev/null",
            "-w",
            "%{http_code}\n%{redirect_url}",
            source,
        ]
    )

    if result.returncode != 0:
        print(f"[FAIL] {label}")
        print(f"       요청 실패: {result.stderr.strip()}")
        return False

    lines = result.stdout.strip().splitlines()
    status = int(lines[0]) if lines else 0
    destination = lines[1] if len(lines) > 1 else ""

    redirect_ok = (
        status in REDIRECT_CODES
        and normalize_url(destination) == normalize_url(expected)
    )

    if not redirect_ok:
        print(f"[FAIL] {label}")
        print(f"       status={status}")
        print(f"       expected={expected}")
        print(f"       actual={destination or '(없음)'}")
        return False

    follow_result = run_curl(
        [
            "-L",
            "-o",
            "/dev/null",
            "-w",
            "%{http_code}\n%{url_effective}",
            source,
        ]
    )

    if follow_result.returncode != 0:
        print(f"[FAIL] {label}")
        print(
            "       최종 페이지 요청 실패: "
            f"{follow_result.stderr.strip()}"
        )
        return False

    follow_lines = follow_result.stdout.strip().splitlines()
    final_status = int(follow_lines[0]) if follow_lines else 0
    final_url = follow_lines[1] if len(follow_lines) > 1 else ""

    final_ok = (
        final_status == 200
        and normalize_url(final_url) == normalize_url(expected)
    )

    if not final_ok:
        print(f"[FAIL] {label}")
        print(f"       redirect={status} → {destination}")
        print(f"       final_status={final_status}")
        print(f"       final_url={final_url or '(없음)'}")
        return False

    print(f"[OK]   {label}: {status} → {expected}")
    return True


def check_direct(label, url):
    result = run_curl(
        [
            "-o",
            "/dev/null",
            "-w",
            "%{http_code}\n%{redirect_url}",
            url,
        ]
    )

    if result.returncode != 0:
        print(f"[FAIL] {label}")
        print(f"       요청 실패: {result.stderr.strip()}")
        return False

    lines = result.stdout.strip().splitlines()
    status = int(lines[0]) if lines else 0
    redirect_url = lines[1] if len(lines) > 1 else ""

    if status != 200 or redirect_url:
        print(f"[FAIL] {label}")
        print(f"       status={status}")
        print(f"       redirect={redirect_url or '(없음)'}")
        return False

    print(f"[OK]   {label}: 200 → {url}")
    return True


def check_asset(label, url, required_phrases, index, temp_dir):
    output_path = Path(temp_dir) / f"asset-{index}.txt"

    result = run_curl(
        [
            "-L",
            "--fail",
            "-o",
            str(output_path),
            "-w",
            "%{http_code}\n%{url_effective}",
            url,
        ]
    )

    if result.returncode != 0:
        print(f"[FAIL] {label}")
        print(f"       요청 실패: {result.stderr.strip()}")
        return False

    lines = result.stdout.strip().splitlines()
    status = int(lines[0]) if lines else 0
    final_url = lines[1] if len(lines) > 1 else url

    body = output_path.read_text(
        encoding="utf-8",
        errors="replace",
    )

    missing = [
        phrase
        for phrase in required_phrases
        if phrase not in body
    ]

    if status != 200 or missing:
        print(f"[FAIL] {label}")
        print(f"       status={status}")
        print(f"       final={final_url}")

        if missing:
            print(f"       누락: {', '.join(missing)}")

        return False

    print(f"[OK]   {label}: {url}")
    return True


def main():
    try:
        direct_checks, localized_redirects = (
            load_recipe_route_checks()
        )
    except (OSError, RuntimeError, json.JSONDecodeError) as error:
        print("[FAIL] localized route data")
        print(f"       {error}")
        sys.exit(1)

    results = []

    for redirect in BASE_REDIRECTS + localized_redirects:
        results.append(check_redirect(*redirect))

    for direct_check in direct_checks:
        results.append(check_direct(*direct_check))

    with TemporaryDirectory() as temp_dir:
        for index, asset in enumerate(ASSETS):
            results.append(
                check_asset(*asset, index, temp_dir)
            )

    passed = sum(results)
    total = len(results)

    print()
    print(f"결과: {passed}/{total} 통과")

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    main()
