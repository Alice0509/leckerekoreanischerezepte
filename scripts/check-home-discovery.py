"""Check built EN/DE discovery cards and the category pages sharing their CSS."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


class Node:
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children = []
        self.text = ""

    def all(self, tag=None, **attrs):
        result = []
        for child in self.children:
            if (tag is None or child.tag == tag) and all(
                child.attrs.get(key) == value for key, value in attrs.items()
            ):
                result.append(child)
            result.extend(child.all(tag, **attrs))
        return result

    def content(self):
        return self.text + "".join(child.content() for child in self.children)


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.root = Node("root")
        self.stack = [self.root]
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].text += data


def classname(node, prefix):
    return prefix in node.attrs.get("class", "")


def local_target(href, locale):
    path = re.sub(r"^/(en|de)(?=/|$)", "", urlparse(href).path)
    return root / locale / (path.lstrip("/") + ".html")


root = Path(".next/server/pages")
for locale, domain, heading, cta in [
    ("en", "www.hansikyoung.com", "Korean home cooking, made for your kitchen", "View recipe"),
    ("de", "www.leckere-koreanische-rezepte.de", "Koreanische Hausmannskost für deine Küche", "Zum Rezept"),
]:
    page = Page(root / (locale + ".html")).root
    assert page.all("link", rel="canonical")[0].attrs["href"].rstrip("/") == "https://" + domain
    assert len(page.all("h1")) == 1 and page.all("h1")[0].content() == heading
    props = json.loads(page.all("script", id="__NEXT_DATA__")[0].text)["props"]["pageProps"]
    recipes = props["recipes"]
    featured = page.all("section", **{"aria-labelledby": "featured-title"})[0]
    cards = featured.all("article")
    assert len(cards) == min(3, len(recipes)) == 3
    card_links = [card.all("a")[0].attrs["href"] for card in cards]
    assert len(set(card_links)) == 3
    assert sum("WEEKLY PICK" in card.content() or "EMPFEHLUNG" in card.content() for card in cards) == 1
    for card in cards:
        assert len(card.all("h3")) == 1
        assert any(classname(p, "RecipeCard_category") and p.content() for p in card.all("p"))
        assert cta in card.content()
        img = card.all("img")[0]
        assert img.attrs.get("sizes") and img.attrs.get("alt") == card.all("h3")[0].content()
        assert local_target(card.all("a")[0].attrs["href"], locale).is_file()
    assert any("/about-us" in a.attrs.get("href", "") for a in page.all("a"))
    search = page.all("input", type="search")[0]
    assert search.attrs.get("aria-label")
    assert page.all("select", id="categorySelect")[0].attrs.get("aria-label")
    assert page.all("p", role="status")[0].content().startswith(str(len(recipes)))
    categories = page.all("section", **{"aria-labelledby": "category-hub-title"})[0].all("a")
    assert len(categories) == 7
    for link in categories:
        category = Page(local_target(link.attrs["href"], locale)).root
        category_cards = [n for n in category.all("article") if classname(n, "RecipeCard_card")]
        assert category_cards and all(cta in n.content() for n in category_cards)
    print(f"OK: {locale.upper()} homepage: 3 distinct picks, localized cards, accessible search and 7 category targets.")

# CSS class removal must not leave the homepage, category or old paginated page unstyled.
css = Path("styles/Home.module.css").read_text()
classes = set(re.findall(r"\.([A-Za-z][\w-]*)", css))
for source in ["pages/index.js", "pages/categories/[slug].js", "pages/page/[page].js"]:
    used = set(re.findall(r"styles\.([A-Za-z][\w]*)", Path(source).read_text()))
    assert not used - classes, (source, used - classes)
print("OK: all shared Home CSS classes remain defined.")
