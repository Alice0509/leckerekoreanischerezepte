"""Check built recipe identity, visible navigation and localized category targets."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.canonical = None
        self.schemas = []
        self.script = None
        self.in_breadcrumbs = False
        self.current_item = None
        self.breadcrumbs = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.script = ""
        if tag == "nav" and "RecipeDetail_breadcrumbs" in attrs.get("class", ""):
            self.in_breadcrumbs = True
        if self.in_breadcrumbs and tag == "li":
            self.current_item = {"name": "", "href": None, "current": False}
        if self.current_item is not None:
            if tag == "a":
                self.current_item["href"] = attrs.get("href")
            if attrs.get("aria-current") == "page":
                self.current_item["current"] = True

    def handle_data(self, text):
        if self.script is not None:
            self.script += text
        if self.current_item is not None:
            self.current_item["name"] += text

    def handle_endtag(self, tag):
        if tag == "script" and self.script is not None:
            value = json.loads(self.script)
            self.schemas.extend(value if isinstance(value, list) else [value])
            self.script = None
        if tag == "li" and self.current_item is not None:
            self.current_item["name"] = self.current_item["name"].strip()
            self.breadcrumbs.append(self.current_item)
            self.current_item = None
        if tag == "nav":
            self.in_breadcrumbs = False


def parse_page(path):
    page = PageParser()
    page.feed(path.read_text())
    return page


def local_path(href):
    return re.sub(r"^/(de|en)(?=/|$)", "", urlparse(href).path) or "/"


root = Path(".next/server/pages")
author_id = "https://www.hansikyoung.com/about-us#joan"
count = 0
for locale, domain in [
    ("en", "www.hansikyoung.com"),
    ("de", "www.leckere-koreanische-rezepte.de"),
]:
    about = parse_page(root / locale / "about-us.html")
    person = next(s for s in about.schemas if s.get("@type") == "Person")
    assert person["@id"] == author_id and person["name"] == "Joan"
    assert person["url"] == about.canonical and "joan" in about.ids
    for path in sorted((root / locale / "recipes").glob("*.html")):
        page = parse_page(path)
        recipe = next(s for s in page.schemas if s.get("@type") == "Recipe")
        crumbs = next(s for s in page.schemas if s.get("@type") == "BreadcrumbList")
        author = recipe["author"]
        assert author["@id"] == person["@id"] and author["name"] == person["name"], path
        assert author["url"] == person["url"], path
        assert recipe["url"] == page.canonical, path
        assert recipe["@id"] == page.canonical + "#recipe", path
        assert urlparse(page.canonical).netloc == domain, path
        items = crumbs["itemListElement"]
        assert len(items) == len(page.breadcrumbs) == 3, path
        assert items[0]["name"] == ("Startseite" if locale == "de" else "Home"), path
        for index, (item, visible) in enumerate(zip(items, page.breadcrumbs), 1):
            assert item["position"] == index and item["name"].strip() == visible["name"], path
            assert urlparse(item["item"]).netloc == domain, path
            if visible["href"]:
                assert local_path(visible["href"]) == urlparse(item["item"]).path, path
        assert items[-1]["name"] == recipe["name"], path
        assert items[-1]["item"] == page.canonical, path
        assert page.breadcrumbs[-1]["current"] and page.breadcrumbs[-1]["href"] is None, path
        category_path = urlparse(items[1]["item"]).path
        category_file = root / locale / (category_path.lstrip("/") + ".json")
        category = json.loads(category_file.read_text())["pageProps"]
        assert category["label"] == items[1]["name"] == recipe["recipeCategory"], path
        assert path.stem in {r["slug"] for r in category["recipes"]}, path
        count += 1
assert count > 0, "Run npm run build before checking recipe pages."
print(f"OK: {count} EN/DE recipes have matching authors, visible breadcrumbs and real category targets.")
