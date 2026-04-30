function getCurrencyCode(symbol) {
    return {
        "₽": "RUB",
        "$": "USD",
        "€": "EUR"
    }[symbol];
}

function getPriceNumber(text) {
    return Number(text.replace(/[^\d]/g, ""));
}

function getPriceString(text) {
    return text.replace(/[^\d]/g, "");
}

function cleanHtml(element) {
    const clone = element.cloneNode(true);

    clone.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
            el.removeAttribute(attr.name);
        });
    });

    return clone.innerHTML.trim();
}

function parseMeta() {
    const opengraph = {};

    document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
        const key = meta.getAttribute("property").replace("og:", "");

        opengraph[key] = meta.content
            .split("—")[0]
            .trim();
    });

    return {
        title: document.title.split("—")[0].trim(),
        description: document.querySelector('meta[name="description"]').content.trim(),
        keywords: document
            .querySelector('meta[name="keywords"]')
            .content
            .split(","),
        language: document.documentElement.lang,
        opengraph
    };
}

function parseProduct() {
    const product = document.querySelector(".product");
    const priceElement = document.querySelector(".product .price");
    const oldPriceElement = priceElement.querySelector("span");

    const price = getPriceNumber(priceElement.childNodes[0].textContent);
    const oldPrice = oldPriceElement ? getPriceNumber(oldPriceElement.textContent) : price;
    const currencySymbol = priceElement.textContent.trim()[0];

    const tags = {
        category: [],
        discount: [],
        label: []
    };

    document.querySelectorAll(".product .tags span").forEach((tag) => {
        const text = tag.textContent.trim();

        if (tag.classList.contains("green")) {
            tags.category.push(text);
        }

        if (tag.classList.contains("red")) {
            tags.discount.push(text);
        }

        if (tag.classList.contains("blue")) {
            tags.label.push(text);
        }
    });

    const properties = {};

    document.querySelectorAll(".product .properties li").forEach((item) => {
        const spans = item.querySelectorAll("span");

        properties[spans[0].textContent.trim()] = spans[1].textContent.trim();
    });

    const images = Array.from(document.querySelectorAll(".preview nav img")).map((img) => ({
        preview: img.src.trim(),
        full: img.dataset.src.trim(),
        alt: img.alt.trim()
    }));

    return {
        id: product.dataset.id,
        name: document.querySelector("h1").textContent.trim(),
        isLiked: document.querySelector(".product .like").classList.contains("active"),
        tags,
        price,
        oldPrice,
        discount: oldPrice - price,
        discountPercent: `${(((oldPrice - price) / oldPrice) * 100).toFixed(2)}%`,
        currency: getCurrencyCode(currencySymbol),
        properties,
        description: cleanHtml(document.querySelector(".product .description")),
        images
    };
}

function parseSuggested() {
    return Array.from(document.querySelectorAll(".suggested article")).map((card) => {
        const priceText = card.querySelector("b").textContent.trim();

        return {
            name: card.querySelector("h3").textContent.trim(),
            description: card.querySelector("p").textContent.trim(),
            image: card.querySelector("img").src.trim(),
            price: getPriceString(priceText),
            currency: getCurrencyCode(priceText[0])
        };
    });
}

function formatDate(date) {
    return date.replaceAll("/", ".");
}

function parseReviews() {
    return Array.from(document.querySelectorAll(".reviews article")).map((card) => ({
        rating: card.querySelectorAll(".rating .filled").length,
        author: {
            avatar: card.querySelector(".author img").src.trim(),
            name: card.querySelector(".author span").textContent.trim()
        },
        title: card.querySelector("h3").textContent.trim(),
        description: card.querySelector("p").textContent.trim(),
        date: formatDate(card.querySelector(".author i").textContent.trim())
    }));
}

function parsePage() {
    return {
        meta: parseMeta(),
        product: parseProduct(),
        suggested: parseSuggested(),
        reviews: parseReviews()
    };
}

window.parsePage = parsePage;