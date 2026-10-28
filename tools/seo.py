#!/usr/bin/env python3
"""Rebuild every page's <head> SEO block, JSON-LD @graph, sitemap, robots.txt,
llms.txt and llms-full.txt for the Whit Fitness site.

Run from the site root:  python3 tools/seo.py
Change DOMAIN below if the site launches on a different domain. Idempotent.
"""
import html, json, re, datetime, pathlib

DOMAIN = "https://whit-fitness.com"   # <- the one place to change the domain
ROOT = pathlib.Path(__file__).resolve().parent.parent
TODAY = datetime.date.today().isoformat()

NAME = "Whit Fitness"
PHONE = "+1-458-234-3673"
PHONE_DISPLAY = "(458) 234-3673"
EMAIL = "contact.crossfitevviva@gmail.com"
STREET, CITY, REGION, ZIP = "277 Blair Blvd", "Eugene", "OR", "97402"
LAT, LNG = 44.0569023, -123.1101159
MAP_CID = "https://maps.google.com/?cid=10535944655785304145"
BOOK = "https://crossfitevviva.wodify.com/OnlineSalesPage/Main?q=Classes%7CLocationId%3D656"
MEMBERSHIPS = "https://crossfitevviva.wodify.com/OnlineSalesPage/Main?q=Memberships"
ONRAMP = "https://crossfitevviva.wodify.com/OnlineSalesPortal/PaymentPlans.aspx?LocationId=656&OnlineMembershipId=286469"
HYROX_FREE = "https://crossfitevviva.wodify.com/OnlineSalesPortal/ViewSchedule.aspx?LocationId=656&OnlineMembershipId=3065"
PT_CONSULT = "https://crossfitevviva.wodify.com/OnlineSalesPortal/PaymentPlans.aspx?LocationId=656&OnlineMembershipId=286631"
VITALITY = "https://crossfitevviva.wodify.com/OnlineSalesPortal/PaymentPlans.aspx?LocationId=656&OnlineMembershipId=291031"
SHOP = "https://whitfitnesseugene.myshopify.com"
# ATP youth program books through Upper Hand, not Wodify
ATP_UH = "https://app.upperhand.io/customers/1706-advanced-training-and-performance"
ATP_BOOK = ATP_UH + "/events/89747-youth-general-strength-athletic-development"
ATP_PASSES = ATP_UH + "/credit_passes"
ATP_MEMBERSHIP = ATP_UH + "/client-memberships/5857"
ATP_EMAIL = "advancedtrainingperformance@gmail.com"
SAME_AS = [
    "https://www.instagram.com/whit.fitness_eugene/",
    "https://www.facebook.com/CrossFitEvviva",
    "https://www.crossfit.com/gym/32/crossfit-evviva",
    MAP_CID,
]
GYM = f"{DOMAIN}/#gym"
SITE = f"{DOMAIN}/#website"

# Opening hours (staffed + class hours). Members also have 24/7 keycode access.
HOURS = [
    (["Monday", "Tuesday", "Wednesday", "Thursday"], "05:00", "19:30"),
    (["Friday"], "05:00", "18:30"),
    (["Saturday"], "08:00", "11:00"),
    (["Sunday"], "08:30", "13:00"),
]
HOURS_TEXT = "Mon–Thu 5:00am–7:30pm · Fri 5:00am–6:30pm · Sat 8:00–11:00am · Sun 8:30am–1:00pm · members 24/7 by keycode"


def ohs(days, opens, closes):
    return {"@type": "OpeningHoursSpecification",
            "dayOfWeek": [f"https://schema.org/{d}" for d in days],
            "opens": opens, "closes": closes}


def city(name):
    return {"@type": "City", "name": name,
            "containedInPlace": {"@type": "State", "name": "Oregon"}}


def monthly(name, price, url=MEMBERSHIPS, desc=None):
    o = {"@type": "Offer", "name": name, "price": f"{price:.2f}", "priceCurrency": "USD",
         "availability": "https://schema.org/InStock", "url": url,
         "priceSpecification": {"@type": "UnitPriceSpecification", "price": f"{price:.2f}",
                                "priceCurrency": "USD", "unitText": "month",
                                "referenceQuantity": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"}}}
    if desc: o["description"] = desc
    return o


def once(name, price, url=BOOK, desc=None):
    o = {"@type": "Offer", "name": name, "price": f"{price:.2f}", "priceCurrency": "USD",
         "availability": "https://schema.org/InStock", "url": url}
    if desc: o["description"] = desc
    return o


AREA = [city("Eugene"), city("Springfield"),
        {"@type": "Place", "name": "Whiteaker, Eugene"},
        {"@type": "AdministrativeArea", "name": "Lane County, Oregon"}]

OFFERS = {
    "unlimited": monthly("Unlimited membership", 160, desc="Unlimited CrossFit and HYROX classes plus open gym and 24/7 keycode access."),
    "couples": monthly("Couples unlimited membership", 270),
    "hyrox": monthly("HYROX membership, 2 classes per week", 120),
    "opengym": monthly("Open gym membership", 100, desc="24/7 keycode access to the gym outside of coached classes."),
    "dropin": once("Drop-in class", 25),
    "week": once("One-week pass", 60),
    "onramp": once("On-Ramp session (one-to-one intro)", 50, ONRAMP, "Required before joining CrossFit classes if you are new to CrossFit. $60 for a couple."),
    "hyroxfree": once("Free first HYROX class", 0, HYROX_FREE),
    "ptconsult": once("Free personal training consultation", 0, PT_CONSULT),
}

PHOTOS = {k: f"{DOMAIN}/assets/img/photos/{k}.jpg" for k in
          ["hero", "gym", "crossfit", "hyrox", "vitality", "youth", "personal-training"]}

SERVICES = {
    "crossfit": {
        "@type": "Service", "@id": f"{DOMAIN}/crossfit#service", "name": "CrossFit classes",
        "serviceType": "CrossFit group fitness class",
        "description": "Coached one-hour CrossFit classes in Eugene, OR, scaled for every level. Weightlifting, gymnastics and conditioning. New members start with On-Ramp.",
        "url": f"{DOMAIN}/crossfit", "image": PHOTOS["crossfit"],
        "hoursAvailable": [ohs(["Monday", "Tuesday", "Thursday", "Friday"], "05:00", "18:30")],
        "offers": [OFFERS[k] for k in ["unlimited", "couples", "dropin", "week", "onramp"]],
        "audience": {"@type": "PeopleAudience", "audienceType": "Adults of all fitness levels, beginners welcome"},
    },
    "hyrox": {
        "@type": "Service", "@id": f"{DOMAIN}/hyrox#service", "name": "HYROX training classes",
        "serviceType": "HYROX race training",
        "description": "Coached HYROX training in Eugene, OR: running, rowing, SkiErg, sled push and pull, wall balls and the other HYROX stations. First class free.",
        "url": f"{DOMAIN}/hyrox", "image": PHOTOS["hyrox"],
        "hoursAvailable": [ohs(["Wednesday"], "05:00", "18:30"), ohs(["Saturday"], "08:00", "10:30"), ohs(["Sunday"], "09:30", "10:30")],
        "offers": [OFFERS[k] for k in ["hyroxfree", "hyrox", "unlimited", "dropin"]],
        "audience": {"@type": "PeopleAudience", "audienceType": "HYROX racers and anyone who wants running and machine-based conditioning"},
    },
    "personal-training": {
        "@type": "Service", "@id": f"{DOMAIN}/personal-training#service", "name": "Personal training",
        "serviceType": "One-to-one personal training",
        "description": "One-to-one personal training in Eugene, OR: a free consult, a movement and fitness assessment, then a program written for you.",
        "url": f"{DOMAIN}/personal-training", "image": PHOTOS["personal-training"],
        "offers": [OFFERS["ptconsult"]],
    },
    "vitality": {
        "@type": "Service", "@id": f"{DOMAIN}/vitality#service", "name": "Vitality 55+ class",
        "serviceType": "Strength and balance class for older adults",
        "description": "Coached strength, balance, coordination and low-impact cardio for adults 55 and over. Tuesdays and Thursdays at 10am in Eugene, OR.",
        "url": f"{DOMAIN}/vitality", "image": PHOTOS["vitality"],
        "hoursAvailable": [ohs(["Tuesday", "Thursday"], "10:00", "11:00")],
        "audience": {"@type": "PeopleAudience", "suggestedMinAge": 55, "audienceType": "Adults 55 and over, seniors, active agers"},
        "offers": [{"@type": "Offer", "name": "Vitality 55+ membership", "url": VITALITY, "availability": "https://schema.org/InStock"}],
    },
    "youth": {
        "@type": "Service", "@id": f"{DOMAIN}/youth#service", "name": "ATP youth strength & athletic development",
        "alternateName": ["ATP Eugene", "Advanced Training & Performance", "Advanced Training and Performance"],
        "serviceType": "Youth sports performance training",
        "description": "Strength, speed, power and injury-prevention training for middle and high school athletes from any sport, run by ATP (Advanced Training & Performance) at Whit Fitness. Classes Monday to Thursday at 6:30pm, plus personal training, small group, remote programming and team sessions.",
        "url": f"{DOMAIN}/youth", "image": PHOTOS["youth"],
        "sameAs": ["https://www.instagram.com/atp_eugene/"],
        "hoursAvailable": [ohs(["Monday", "Tuesday", "Wednesday", "Thursday"], "18:30", "19:30")],
        "audience": {"@type": "PeopleAudience", "audienceType": "Middle and high school athletes, U12 to U19"},
        "offers": [once("ATP youth class drop-in", 20, ATP_BOOK),
                   once("ATP 10-class pass", 175, ATP_PASSES, "Valid for 6 months."),
                   once("ATP 20-class pass", 300, ATP_PASSES, "Valid for 10 months."),
                   monthly("ATP youth monthly membership", 120, ATP_MEMBERSHIP)],
    },
    "opengym": {
        "@type": "Service", "@id": f"{DOMAIN}/schedule#open-gym", "name": "Open gym",
        "serviceType": "Open gym access",
        "description": "Train on your own with 24/7 keycode access to racks, barbells, machines, sleds and turf.",
        "url": f"{DOMAIN}/schedule", "image": PHOTOS["gym"],
        "offers": [OFFERS["opengym"], OFFERS["unlimited"]],
    },
}
for s in SERVICES.values():
    s["provider"] = {"@id": GYM}
    s["areaServed"] = AREA[:2]

KNOWS = ["CrossFit", "HYROX", "HYROX race training", "Strength training", "Olympic weightlifting",
         "Functional fitness", "Group fitness classes", "Personal training", "Fitness for older adults",
         "Senior fitness", "Balance training", "Youth sports performance", "Conditioning",
         "Mobility", "Open gym"]


def gym_node():
    return {
        "@type": ["ExerciseGym", "HealthClub"],
        "@id": GYM,
        "name": NAME,
        "alternateName": ["CrossFit Evviva", "Whit Fitness Eugene", "WHIT. FITNESS"],
        "description": ("Whit Fitness (formerly CrossFit Evviva) is a coached CrossFit and HYROX gym in the Whiteaker "
                        "neighborhood of Eugene, Oregon. Classes run from 5am to 6:30pm on weekdays plus weekend HYROX, "
                        "with Vitality strength and balance classes for adults 55+, ATP youth athletic training, "
                        "one-to-one personal training, open gym and 24/7 member access."),
        "slogan": "Train Smarter.",
        "url": f"{DOMAIN}/",
        "telephone": PHONE,
        "email": EMAIL,
        "image": [PHOTOS["hero"], PHOTOS["gym"], PHOTOS["crossfit"], PHOTOS["hyrox"], f"{DOMAIN}/assets/img/og.jpg"],
        "logo": {"@type": "ImageObject", "url": f"{DOMAIN}/assets/img/apple-touch-icon.png", "width": 180, "height": 180},
        "address": {"@type": "PostalAddress", "streetAddress": STREET, "addressLocality": CITY,
                    "addressRegion": REGION, "postalCode": ZIP, "addressCountry": "US"},
        "geo": {"@type": "GeoCoordinates", "latitude": LAT, "longitude": LNG},
        "hasMap": MAP_CID,
        "openingHoursSpecification": [ohs(*h) for h in HOURS],
        "areaServed": AREA,
        "priceRange": "$25–$270",
        "currenciesAccepted": "USD",
        "paymentAccepted": "Credit card, Debit card",
        "publicAccess": True,
        "isAccessibleForFree": False,
        "smokingAllowed": False,
        "knowsAbout": KNOWS,
        "keywords": "CrossFit Eugene, HYROX Eugene, gym Eugene Oregon, senior fitness Eugene, personal trainer Eugene, youth athletic training Eugene, Whiteaker gym",
        "sameAs": SAME_AS,
        "amenityFeature": [{"@type": "LocationFeatureSpecification", "name": n, "value": True} for n in
                           ["24/7 member keycode access", "Showers", "Lockers", "Changing room",
                            "Lounge and Wi-Fi work space", "Kids' room", "Childcare Mon/Wed/Fri 9am",
                            "50 feet of turf for sled work", "12 rowers, 3 SkiErgs and 9 Echo bikes"]],
        "hasOfferCatalog": {
            "@type": "OfferCatalog", "@id": f"{DOMAIN}/schedule#pricing", "name": "Whit Fitness memberships and passes",
            "itemListElement": list(OFFERS.values()),
        },
        "makesOffer": [{"@type": "Offer", "itemOffered": {"@id": s["@id"]}} for s in SERVICES.values()],
        "potentialAction": {"@type": "ReserveAction", "name": "Book a class",
                            "target": {"@type": "EntryPoint", "urlTemplate": BOOK,
                                       "actionPlatform": ["https://schema.org/DesktopWebPlatform",
                                                          "https://schema.org/MobileWebPlatform"]},
                            "result": {"@type": "Reservation", "name": "Class booking"}},
        "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "telephone": PHONE,
                         "email": EMAIL, "areaServed": "US", "availableLanguage": "English"},
    }


# ---------- per-page config ----------
PAGES = {
    "index.html": dict(path="/", type="WebPage", crumb=None, img="hero",
        title="Whit Fitness | CrossFit & HYROX Gym in Eugene, OR",
        desc="Coached CrossFit and HYROX classes in Eugene, OR, plus Vitality 55+, youth training and personal training. Formerly CrossFit Evviva. First HYROX class free."),
    "crossfit.html": dict(path="/crossfit", type="WebPage", crumb="CrossFit", img="crossfit", svc="crossfit",
        title="CrossFit Classes in Eugene, OR | Whit Fitness",
        desc="Coached CrossFit classes in Eugene, OR at 5, 6 and 9am, noon, 4:30 and 5:30pm. Scaled for every level. Start with a one-to-one On-Ramp session."),
    "hyrox.html": dict(path="/hyrox", type="WebPage", crumb="HYROX", img="hyrox", svc="hyrox",
        title="HYROX Training Classes in Eugene, OR | First Class Free | Whit Fitness",
        desc="HYROX training in Eugene, OR: running, sleds, SkiErg, rowing and wall balls with a coach. Wednesdays, Saturdays and Sundays. Your first class is free."),
    "vitality.html": dict(path="/vitality", type="WebPage", crumb="Vitality 55+", img="vitality", svc="vitality",
        title="Fitness Classes for Adults 55+ in Eugene, OR | Vitality | Whit Fitness",
        desc="Vitality is a coached strength and balance class for adults 55+ in Eugene, OR. Low impact, every movement scaled. Tuesdays and Thursdays at 10am."),
    "youth.html": dict(path="/youth", type="WebPage", crumb="Youth", img="youth", svc="youth",
        title="ATP Youth Sports Performance Training in Eugene, OR | Whit Fitness",
        desc="ATP strength and athletic development for middle and high school athletes in Eugene, OR. Classes Mon–Thu 6:30pm, $20 drop-in or $120/mo. PTs on staff."),
    "personal-training.html": dict(path="/personal-training", type="WebPage", crumb="Personal training", img="personal-training", svc="personal-training",
        title="Personal Training in Eugene, OR | Free Consult | Whit Fitness",
        desc="One-to-one personal training in Eugene, OR. Start with a free consult and an assessment, then train on a program written for you by a Whit Fitness coach."),
    "schedule.html": dict(path="/schedule", type="WebPage", crumb="Schedule & pricing", img="gym", svc="opengym",
        title="Gym Class Schedule & Pricing in Eugene, OR | Whit Fitness",
        desc="Whit Fitness class times and prices: Unlimited $160/mo, HYROX $120/mo, Open Gym $100/mo, drop-in $25. Classes from 5am, 7 days a week in Eugene, OR."),
    "start.html": dict(path="/start", type="WebPage", crumb="Start here", img="hero",
        title="Start Here: Your First Class at Whit Fitness, Eugene OR",
        desc="New to Whit Fitness? Book a free HYROX class, a CrossFit On-Ramp or a free personal training consult. Here's what your first visit in Eugene looks like."),
    "shop.html": dict(path="/shop", type="CollectionPage", crumb="Shop", img="hero",
        title="Shop Whit Fitness Apparel | Eugene, OR Gym Merch",
        desc="Whit Fitness tees, tanks and the Deadwood camo hoodie. Printed to order and shipped to you from our Shopify store."),
    "faq.html": dict(path="/faq", type="FAQPage", crumb="FAQ", img="gym",
        title="FAQ: Hours, Drop-ins, Childcare, On-Ramp & Pricing | Whit Fitness Eugene",
        desc="Answers about Whit Fitness in Eugene, OR: hours, drop-ins, prices, childcare, what to bring, On-Ramp, 24/7 access and the CrossFit Evviva name change."),
    "contact.html": dict(path="/contact", type="ContactPage", crumb="Contact", img="gym",
        title="Contact & Directions | Whit Fitness, 277 Blair Blvd, Eugene OR",
        desc=f"Whit Fitness is at 277 Blair Blvd in the Whiteaker, Eugene, OR 97402. Call or text {PHONE_DISPLAY}. Hours, parking and directions."),
    "workout.html": dict(path="/workout", type="WebPage", crumb="Today's workout", img="gym",
        title="Today's Workout (WOD) | Whit Fitness, Eugene OR",
        desc="Today's CrossFit, HYROX and Vitality 55+ workouts at Whit Fitness in Eugene, OR, pulled live from Wodify and matched to the class that's on now."),
    "404.html": dict(path="/404", type="WebPage", crumb=None, img="hero", noindex=True,
        title="Page not found | Whit Fitness",
        desc="That page moved. Find CrossFit, HYROX, Vitality 55+, youth and personal training at Whit Fitness in Eugene, OR."),
}

MANAGED = {"ExerciseGym", "WebSite", "WebPage", "BreadcrumbList", "FAQPage", "ContactPage",
           "CollectionPage", "ItemList", "Service", "OfferCatalog", "Course"}


def text(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()


def faqs(src):
    out = []
    for q, a in re.findall(r'<details[^>]*>\s*<summary>(.*?)</summary>\s*<div class="answer">(.*?)</div>\s*</details>', src, re.S):
        out.append({"@type": "Question", "name": text(q), "acceptedAnswer": {"@type": "Answer", "text": text(a)}})
    return out


def products(src):
    items = []
    for i, (href, img, alt, name, price) in enumerate(re.findall(
            r'<li class="product"><a href="([^"]+)"[^>]*>.*?<img src="([^"]+)" alt="([^"]*)".*?<h3>(.*?)</h3><span class="price">(.*?)</span>',
            src, re.S), 1):
        p = re.search(r"\$(\d+(?:\.\d+)?)", price)
        prod = {"@type": "Product", "name": text(name), "url": href, "image": html.unescape(img),
                "description": text(alt), "brand": {"@type": "Brand", "name": NAME}}
        if p:
            prod["offers"] = {"@type": "Offer", "price": f"{float(p.group(1)):.2f}", "priceCurrency": "USD",
                              "availability": "https://schema.org/InStock", "url": href,
                              "seller": {"@id": GYM}}
        items.append({"@type": "ListItem", "position": i, "item": prod})
    return items


def graph_for(fname, cfg, src):
    url = DOMAIN + ("/" if cfg["path"] == "/" else cfg["path"])
    page = {"@type": cfg["type"], "@id": f"{url}#webpage", "url": url, "name": cfg["title"],
            "description": cfg["desc"], "isPartOf": {"@id": SITE}, "about": {"@id": GYM},
            "inLanguage": "en-US", "dateModified": TODAY,
            "primaryImageOfPage": {"@type": "ImageObject", "url": PHOTOS[cfg["img"]]}}
    g = [gym_node(),
         {"@type": "WebSite", "@id": SITE, "url": f"{DOMAIN}/", "name": NAME,
          "alternateName": ["CrossFit Evviva", "Whit Fitness Eugene"], "publisher": {"@id": GYM}, "inLanguage": "en-US"},
         page]
    if cfg.get("crumb"):
        bc = {"@type": "BreadcrumbList", "@id": f"{url}#breadcrumb", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
            {"@type": "ListItem", "position": 2, "name": cfg["crumb"], "item": url}]}
        page["breadcrumb"] = {"@id": bc["@id"]}
        g.append(bc)
    if cfg.get("svc"):
        s = dict(SERVICES[cfg["svc"]]); page["mainEntity"] = {"@id": s["@id"]}; g.append(s)
    if fname == "index.html":
        page["mainEntity"] = {"@id": GYM}
        g.extend(SERVICES[k] for k in ["crossfit", "hyrox", "vitality", "youth", "personal-training"])
    if fname == "schedule.html":
        g.extend(SERVICES[k] for k in ["crossfit", "hyrox", "vitality", "youth"])
    if fname == "faq.html":
        page["mainEntity"] = faqs(src)
    if fname == "youth.html":
        g.append({"@type": "FAQPage", "@id": f"{url}#faq", "mainEntity": faqs(src)})
    if fname == "contact.html":
        page["mainEntity"] = {"@id": GYM}
    if fname == "shop.html":
        il = {"@type": "ItemList", "@id": f"{url}#products", "name": "Whit Fitness apparel", "itemListElement": products(src)}
        page["mainEntity"] = {"@id": il["@id"]}; g.append(il)
    # dedupe by @id
    seen, out = set(), []
    for n in g:
        k = n.get("@id") or json.dumps(n, sort_keys=True)
        if k in seen: continue
        seen.add(k); out.append(n)
    return {"@context": "https://schema.org", "@graph": out}


def head_block(fname, cfg, src):
    url = DOMAIN + ("/" if cfg["path"] == "/" else cfg["path"])
    e = lambda s: html.escape(s, quote=True)
    img = f"{DOMAIN}/assets/img/og.jpg"
    robots = "noindex, follow" if cfg.get("noindex") else "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    lines = [
        f"<title>{e(cfg['title'])}</title>",
        f'<meta name="description" content="{e(cfg["desc"])}">',
        f'<meta name="robots" content="{robots}">',
    ]
    if not cfg.get("noindex"):
        lines.append(f'<link rel="canonical" href="{url}">')
    lines += [
        '<meta name="theme-color" content="#394224">',
        '<meta name="format-detection" content="telephone=yes">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{NAME}">',
        '<meta property="og:locale" content="en_US">',
        f'<meta property="og:title" content="{e(cfg["title"])}">',
        f'<meta property="og:description" content="{e(cfg["desc"])}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{img}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="Whit Fitness, Train Smarter. CrossFit and HYROX gym in Eugene, Oregon.">',
        f'<meta property="business:contact_data:street_address" content="{STREET}">',
        f'<meta property="business:contact_data:locality" content="{CITY}">',
        f'<meta property="business:contact_data:region" content="{REGION}">',
        f'<meta property="business:contact_data:postal_code" content="{ZIP}">',
        '<meta property="business:contact_data:country_name" content="USA">',
        f'<meta property="place:location:latitude" content="{LAT}">',
        f'<meta property="place:location:longitude" content="{LNG}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{e(cfg["title"])}">',
        f'<meta name="twitter:description" content="{e(cfg["desc"])}">',
        f'<meta name="twitter:image" content="{img}">',
        '<meta name="geo.region" content="US-OR">',
        '<meta name="geo.placename" content="Eugene, Oregon">',
        f'<meta name="geo.position" content="{LAT};{LNG}">',
        f'<meta name="ICBM" content="{LAT}, {LNG}">',
        '<link rel="alternate" type="text/plain" title="LLM-readable summary" href="/llms.txt">',
        '<link rel="sitemap" type="application/xml" href="/sitemap.xml">',
        '<script type="application/ld+json">' + json.dumps(graph_for(fname, cfg, src), ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + "</script>",
    ]
    return "<!--seo:start-->\n" + "\n".join(lines) + "\n<!--seo:end-->"


STRIP = [r"<title>.*?</title>", r'<meta name="(description|robots|theme-color|format-detection|twitter:[a-z]+|geo\.[a-z]+|ICBM)"[^>]*>',
         r'<meta property="(og|business|place):[^"]+"[^>]*>', r'<link rel="canonical"[^>]*>',
         r'<link rel="alternate" type="text/plain"[^>]*>', r'<link rel="sitemap"[^>]*>',
         r'<script type="application/ld\+json">.*?</script>']


def build_pages():
    for fname, cfg in PAGES.items():
        p = ROOT / fname
        src = p.read_text()
        src = re.sub(r"<!--seo:start-->.*?<!--seo:end-->\n?", "", src, flags=re.S)
        for pat in STRIP:
            src = re.sub(pat + r"\n?", "", src, flags=re.S)
        block = head_block(fname, cfg, src)
        src = re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + block + "\n", src, count=1)
        p.write_text(src)


def build_sitemap():
    pri = {"/": "1.0", "/crossfit": "0.9", "/hyrox": "0.9", "/vitality": "0.9", "/schedule": "0.9",
           "/start": "0.8", "/personal-training": "0.8", "/youth": "0.8", "/faq": "0.7", "/contact": "0.7", "/shop": "0.5"}
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for fname, cfg in PAGES.items():
        if cfg.get("noindex"): continue
        url = DOMAIN + ("/" if cfg["path"] == "/" else cfg["path"])
        src = (ROOT / fname).read_text()
        imgs = sorted(set(f"/assets/img/photos/{m}.jpg" for m in re.findall(r'src="/assets/img/photos/([a-z-]+?)(?:-\d+\.webp|\.jpg)"', src)))
        out.append(f"  <url><loc>{url}</loc><lastmod>{TODAY}</lastmod><priority>{pri.get(cfg['path'], '0.5')}</priority>")
        for i in imgs:
            out.append(f"    <image:image><image:loc>{DOMAIN}{i}</image:loc></image:image>")
        out.append("  </url>")
    out.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(out) + "\n")


def build_robots():
    bots = ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "GPTBot", "OAI-SearchBot", "ChatGPT-User",
            "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai", "PerplexityBot", "Perplexity-User",
            "Google-Extended", "Applebot-Extended", "Meta-ExternalAgent", "Amazonbot", "cohere-ai", "MistralAI-User", "YouBot"]
    lines = ["# Whit Fitness: search engines and AI assistants are welcome to read and cite this site.", ""]
    for b in bots:
        lines += [f"User-agent: {b}", "Allow: /", "Disallow: /_shots/", "Disallow: /_mobile/", ""]
    lines += ["User-agent: *", "Allow: /", "Disallow: /_shots/", "Disallow: /_mobile/", "",
              f"Sitemap: {DOMAIN}/sitemap.xml", ""]
    (ROOT / "robots.txt").write_text("\n".join(lines))


SCHEDULE = """- CrossFit: Monday, Tuesday, Thursday, Friday at 5:00am, 6:00am, 9:00am, 12:00pm, 4:30pm and 5:30pm (60 min)
- HYROX: Wednesday at 5:00am, 6:00am, 9:00am, 12:00pm, 4:30pm and 5:30pm; Saturday at 8:00am and 9:15am (75 min); Sunday at 9:30am
- Lift + Mobility: Sunday at 8:30am
- Vitality 55+: Tuesday and Thursday at 10:00am
- ATP youth strength & athletic development: Monday–Thursday at 6:30pm (booked through Upper Hand)
- Open gym: members have 24/7 keycode access; Sunday open gym 12:00–1:00pm"""

PRICES = """- Unlimited membership: $160/month (all CrossFit and HYROX classes, open gym, 24/7 access)
- Couples unlimited: $270/month
- HYROX membership (2 classes/week): $120/month
- Open gym: $100/month
- Drop-in class: $25
- One-week pass: $60
- On-Ramp (one-to-one intro for new CrossFitters): $50 per session ($60 for a couple)
- First HYROX class: free
- Personal training consultation: free
- Student and military discounts available
- ATP youth classes (booked through Upper Hand, separate from gym memberships): $20 drop-in, $175 for 10 classes, $300 for 20 classes, $120/month membership"""


def build_llms():
    short = f"""# Whit Fitness

> Whit Fitness (formerly CrossFit Evviva) is a coached CrossFit and HYROX gym at {STREET}, {CITY}, {REGION} {ZIP}, in the Whiteaker neighborhood of Eugene, Oregon. It also runs Vitality, a strength and balance class for adults 55+, hosts ATP youth athletic training, and offers one-to-one personal training and open gym with 24/7 member access. Slogan: "Train Smarter." Rated 5.0 on Google across 70 reviews.

Phone/text: {PHONE_DISPLAY} · Email: {EMAIL} · Map: {MAP_CID}
Hours: {HOURS_TEXT}
Book a class: {BOOK}

## Programs
- [CrossFit classes]({DOMAIN}/crossfit): coached 60-minute classes, scaled for all levels, weekdays from 5am
- [HYROX training]({DOMAIN}/hyrox): running, sleds, SkiErg, rowing and wall balls; first class free
- [Vitality 55+]({DOMAIN}/vitality): low-impact strength, balance and cardio for adults 55+, Tue/Thu 10am
- [ATP youth training]({DOMAIN}/youth): ATP (Advanced Training & Performance, formerly atpeugene.com) strength and athletic development for middle and high school athletes; personal, small group and team training
- [Personal training]({DOMAIN}/personal-training): one-to-one coaching with a free consult

## Plan a visit
- [Schedule & pricing]({DOMAIN}/schedule)
- [Start here / first class]({DOMAIN}/start)
- [FAQ]({DOMAIN}/faq)
- [Contact & directions]({DOMAIN}/contact)
- [Shop apparel]({DOMAIN}/shop)

## Optional
- [Full fact sheet]({DOMAIN}/llms-full.txt)
"""
    (ROOT / "llms.txt").write_text(short)

    faq_src = (ROOT / "faq.html").read_text()
    qa = "\n\n".join(f"### {q['name']}\n{q['acceptedAnswer']['text']}" for q in faqs(faq_src))
    full = f"""# Whit Fitness: full fact sheet

Last updated: {TODAY}. Canonical site: {DOMAIN}/

## Identity
- Name: Whit Fitness (formerly CrossFit Evviva; same gym, same owners and coaches, new name)
- Type: CrossFit affiliate, HYROX training gym, strength and conditioning gym
- Address: {STREET}, {CITY}, {REGION} {ZIP}, USA (Whiteaker neighborhood, Eugene, Oregon)
- Coordinates: {LAT}, {LNG}
- Phone/text: {PHONE_DISPLAY}
- Email: {EMAIL}
- Google Maps: {MAP_CID}
- Instagram: https://www.instagram.com/whit.fitness_eugene/
- Google rating: 5.0 from 70 reviews
- Serves: Eugene, Springfield, the Whiteaker and Lane County

## Hours
{HOURS_TEXT}

## Class schedule
{SCHEDULE}

## Pricing
{PRICES}

## Getting started
- New to CrossFit: book an On-Ramp (1–4 one-to-one sessions) before joining classes: {ONRAMP}
- Try HYROX: first class free: {HYROX_FREE}
- Personal training: book a free consult: {PT_CONSULT}
- Vitality 55+: {VITALITY}
- ATP youth classes (Upper Hand): {ATP_BOOK} · questions: {ATP_EMAIL}
- Book any class: {BOOK}

## Facility
24/7 member keycode access, showers, lockers, changing room, lounge with Wi-Fi work space, kids' room, childcare Monday/Wednesday/Friday at 9am, 50 feet of turf for sled pushes and pulls, 12 rowers, 3 SkiErgs and 9 Echo bikes.

## Who it's good for
Beginners and experienced athletes, HYROX racers, adults 55+ who want strength and balance, parents (kids welcome, childcare available), middle and high school athletes, and visitors who want to drop in while in Eugene.

## Frequently asked questions
{qa}
"""
    (ROOT / "llms-full.txt").write_text(full)


if __name__ == "__main__":
    build_pages()
    build_sitemap()
    build_robots()
    build_llms()
    print("SEO rebuilt for", DOMAIN)
