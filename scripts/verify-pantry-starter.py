"""Check the built guide's public links, products, locale and SEO after npm run build."""
from pathlib import Path
from html.parser import HTMLParser
import json
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlparse


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.canonical = []
        self.alternates = {}

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'a':
            self.links.append(data)
        if tag == 'link' and data.get('rel') == 'canonical':
            self.canonical.append(data.get('href'))
        if tag == 'link' and data.get('rel') == 'alternate' and data.get('hreflang'):
            self.alternates[data['hreflang']] = data.get('href')


root = Path.cwd()
origins = {'en': 'https://www.hansikyoung.com', 'de': 'https://www.leckere-koreanische-rezepte.de'}
products = json.loads((root / 'lib/ingredientShoppingProducts.json').read_text())
for locale, origin in origins.items():
    html = (root / '.next/server/pages' / locale / 'korean-pantry.html').read_text()
    page = Page()
    page.feed(html)
    assert page.canonical == [f'{origin}/korean-pantry'], (locale, 'canonical')
    assert all(page.alternates.get(language) == f'{domain}/korean-pantry' for language, domain in origins.items()), (locale, 'hreflang')
    assert page.alternates.get('x-default') == f'{origins["en"]}/korean-pantry'
    data = json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S).group(1))['props']['pageProps']
    assert len(data['ingredients']) == 4 and len(data['recipes']) == 3
    destinations = {link.get('href') for link in page.links}
    for item in data['ingredients']:
        path = f'/ingredients/{item["slug"]}'
        assert f'{origin}{path}' in destinations
        assert (root / '.next/server/pages' / locale / f'{path.lstrip("/")}.html').is_file(), (locale, path)
    for recipe in data['recipes']:
        path = f'/recipes/{recipe["slug"]}'
        assert f'{origin}{path}' in destinations
        assert (root / '.next/server/pages' / locale / f'{path.lstrip("/")}.html').is_file(), (locale, path)
        assert recipe['image'].startswith('https://cdn.sanity.io/images/'), (locale, 'recipe photo')
    expected_products = [product for slug in ('gochujang', 'gochugaru') for product in products[slug].get(locale, [])]
    for product in expected_products:
        link = next((link for link in page.links if link.get('href') == product['url']), None)
        assert link and link.get('target') == '_blank' and link.get('rel') == 'noopener noreferrer', (locale, product['url'])
        assert product['productTitle'] in html and product['note'] in html, (locale, 'variant note')
    guide_text = json.dumps({'copy': data['copy'], 'ingredients': data['ingredients']}, ensure_ascii=False)
    if locale == 'en':
        assert 'United States' in guide_text and 'Your country' in guide_text
        assert not any(value in guide_text for value in ('Deutschland', 'Frankfurt', 'Düsseldorf', 'handokmall.de', 'asiafoodland.de', 'rewe.de'))
    else:
        assert 'Deutschland' in guide_text and 'weee.com' not in guide_text
    assert all(not store['link']['isAffiliate'] for item in data['ingredients'] if item['shoppingGuide'] for group in item['shoppingGuide']['groups'] for store in group['stores'])
    sitemap = ET.parse(root / 'public' / f'sitemap-{locale}.xml')
    urls = {node.text for node in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
    assert f'{origin}/korean-pantry' in urls
    index = (root / '.next/server/pages' / locale / 'ingredients.html').read_text()
    assert f'{origin}/korean-pantry' in index, (locale, 'ingredient index entry')
    assert f'{origin}/cooking-plan' in destinations and f'{origin}/cook-with-what-you-have' in destinations
    print(f'OK: {locale} pantry guide: existing ingredients/recipes, Sanity photos, exact products, country labels, SEO, entry link')
