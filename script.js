document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 0. POBIERANIE DANYCH Z SANITY
    // ==========================================
    const sanityQuery = encodeURIComponent(`{
      "products": *[_type == "product"]{sku, name, brand, category, "brandRef": brandRef->name, "categoryRef": categoryRef->name, price, description, "image": image.asset->url},
      "brands": *[_type == "brand"].name,
      "categories": *[_type == "category"].name
    }`);
    const sanityUrl = `https://py9o7u56.api.sanity.io/v2022-03-07/data/query/production?query=${sanityQuery}`;
    
    let sanityBrands = [];
    let sanityCategories = [];

    function fetchProducts() {
        return fetch(sanityUrl)
            .then(res => res.json())
            .then(data => {
                const result = data.result || {};
                sanityBrands = result.brands || [];
                sanityCategories = result.categories || [];
                const products = result.products || [];
                return products.map(p => ({
                    ...p,
                    category: (p.categoryRef || p.category || "Inne"),
                    brand: (p.brandRef || p.brand || "Inne")
                }));
            });
    }

    // ==========================================
    // 0.1 AKTYWNY LINK W MENU
    // ==========================================
    const currentPage = window.location.pathname.split("/").pop() || 'index.html'; 
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // ==========================================
    // 0.2 HAMBURGER MENU (MOBILE)
    // ==========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // --- NIEZAWODNY OBRAZEK ZASTĘPCZY ---
    const fallbackImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22150%22%20viewBox%3D%220%200%20200%20150%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22200%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23adb5bd%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EBrak%20Zdjecia%3C%2Ftext%3E%3C%2Fsvg%3E';

    // ==========================================
    // 1. ZAKŁADKI I MINIATURKI (Karta produktu)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-target')).classList.add('active');
            });
        });
    }

    const thumbnails = document.querySelectorAll('.thumbnails img');
    const mainImg = document.querySelector('.main-image img');
    if (thumbnails.length > 0 && mainImg) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() { mainImg.src = this.src; });
        });
    }

    // ==========================================
    // 2. GLOBALNA WYSZUKIWARKA (LUPA)
    // ==========================================
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query && !window.location.pathname.includes('sklep.html')) {
                window.location.href = `sklep.html?szukaj=${encodeURIComponent(query)}`;
            }
        };
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); performSearch(); }
        });
        const searchIcon = searchInput.nextElementSibling;
        if (searchIcon && searchIcon.tagName === 'I') {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', performSearch);
        }
    }

    // ==========================================
    // 3. STRONA GŁÓWNA (4 najnowsze produkty)
    // ==========================================
    const homeGrid = document.getElementById('homeProductsGrid');
    if (homeGrid) {
        fetchProducts()
            .then(products => {
                homeGrid.innerHTML = '';
                products.slice(0, 4).forEach(product => {
                    const safeSku = encodeURIComponent(product.sku);
                    homeGrid.insertAdjacentHTML('beforeend', `
                        <a href="produkt.html?sku=${safeSku}" class="product-card">
                            <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='${fallbackImage}';">
                            <p class="product-sku">${product.sku}</p>
                            <h3 class="product-name">${product.name}</h3>
                        </a>
                    `);
                });
            })
            .catch(error => console.error('Błąd na stronie głównej:', error));
    }

    // ==========================================
    // 4. STRONA SKLEPU (Filtry po kategorii, Paginacja)
    // ==========================================
    const shopGrid = document.querySelector('.shop-layout .products-grid');
    if (shopGrid) {
        let allProducts = [];
        let filteredProducts = [];
        let currentPage = 1;
        const itemsPerPage = 12;

        fetchProducts()
            .then(products => {
                allProducts = products;
                filteredProducts = products;
                initShopFilters();
                renderPage(1);
            });

        function renderPage(page) {
            currentPage = page;
            shopGrid.innerHTML = '';
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredProducts.slice(start, end);

            paginatedItems.forEach(product => {
                const safeSku = encodeURIComponent(product.sku);
                // Wyświetlamy kategorię na karcie produktu w sklepie
                shopGrid.insertAdjacentHTML('beforeend', `
                    <a href="produkt.html?sku=${safeSku}" class="product-card" data-category="${product.category.toLowerCase()}">
                        <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='${fallbackImage}';">
                        <p class="product-sku">${product.sku}</p>
                        <p class="product-category-badge">${product.category}</p>
                        <h3 class="product-name">${product.name}</h3>
                    </a>
                `);
            });

            updatePaginationUI();
            const countDisplay = document.querySelector('.shop-top-bar p');
            if (countDisplay) {
                const showingEnd = Math.min(end, filteredProducts.length);
                const showingStart = filteredProducts.length > 0 ? start + 1 : 0;
                countDisplay.textContent = `Wyświetlanie ${showingStart}–${showingEnd} z ${filteredProducts.length} wyników`;
            }
        }

        function updatePaginationUI() {
            let paginationContainer = document.querySelector('.pagination');
            if (!paginationContainer) return;
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
            if (totalPages <= 1) return;
            for (let i = 1; i <= totalPages; i++) {
                const span = document.createElement('span');
                span.className = `page-num ${i === currentPage ? 'active' : ''}`;
                span.textContent = i;
                span.addEventListener('click', () => {
                    renderPage(i);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                paginationContainer.appendChild(span);
            }
        }

        function initShopFilters() {
            // Dynamically generate sidebars
            const filterBoxes = document.querySelectorAll('.sidebar .filter-list');
            if (filterBoxes.length >= 2) {
                const brandsList = filterBoxes[0];
                const categoriesList = filterBoxes[1];
                
                const baseBrands = ["CASE IH", "CLAAS", "FENDT", "FIAT", "HÜRLIMANN", "JOHN DEERE", "LAMBORGHINI", "MASSEY FERGUSON", "MCCORMICK", "NEW HOLLAND", "RENAULT", "SAME", "VALTRA", "ZETOR"];
                const baseCategories = ["Uszczelki i O-ringi", "Łożyska", "Filtry", "Półosie i Piasty", "Elementy Hamulcowe", "Przekładnie i Biegi", "Podkładki", "Pompy", "Układ Kierowniczy", "Zawieszenie", "Napęd", "Śruby i Nakrętki", "Inne"];

                const uniqueBrands = [...new Set(sanityBrands.map(b => b.toUpperCase()))].filter(Boolean);
                uniqueBrands.sort((a, b) => a.localeCompare(b));

                const uniqueCategories = [...new Set(sanityCategories)].filter(Boolean);
                uniqueCategories.sort((a, b) => {
                    const idxA = baseCategories.indexOf(a);
                    const idxB = baseCategories.indexOf(b);
                    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    return idxA - idxB;
                });
                
                brandsList.innerHTML = uniqueBrands.map(brand => {
                    const id = 'brand-' + brand.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return `<li><input type="checkbox" id="${id}"><label for="${id}">${brand}</label></li>`;
                }).join('');
                
                categoriesList.innerHTML = uniqueCategories.map(cat => {
                    const id = 'cat-' + cat.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return `<li><input type="checkbox" id="${id}"><label for="${id}">${cat}</label></li>`;
                }).join('');
            }

            const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
            const filterBtn = document.querySelector('.sidebar .btn');
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('szukaj');
            const categoryQuery = urlParams.get('kategoria'); 
            const brandQuery = urlParams.get('marka'); 

            if (searchQuery && searchInput) searchInput.value = decodeURIComponent(searchQuery);

            if (categoryQuery) {
                const decodedCat = decodeURIComponent(categoryQuery).toLowerCase();
                if (filterBoxes.length >= 2) {
                    const catBoxes = filterBoxes[1].querySelectorAll('input[type="checkbox"]');
                    catBoxes.forEach(box => {
                        const label = box.nextElementSibling.textContent.toLowerCase();
                        if (label === decodedCat) box.checked = true;
                    });
                }
            }

            if (brandQuery) {
                const decodedBrand = decodeURIComponent(brandQuery).toLowerCase();
                if (filterBoxes.length >= 2) {
                    const brandBoxes = filterBoxes[0].querySelectorAll('input[type="checkbox"]');
                    brandBoxes.forEach(box => {
                        const label = box.nextElementSibling.textContent.toLowerCase();
                        if (label === decodedBrand) box.checked = true;
                    });
                }
            }

            // ---- KLUCZOWA ZMIANA: filtrowanie po product.category i brand ----
            function applyFilters() {
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
                
                // Zablokuj wyszukiwanie samych spacji
                if (searchInput && searchInput.value.trim().length === 0 && searchInput.value.length > 0) {
                    searchInput.value = '';
                }
                
                let activeBrands = [];
                let activeCategories = [];
                
                if (filterBoxes.length >= 2) {
                    activeBrands = Array.from(filterBoxes[0].querySelectorAll('input[type="checkbox"]'))
                        .filter(box => box.checked)
                        .map(box => box.nextElementSibling.textContent.toLowerCase());
                    activeCategories = Array.from(filterBoxes[1].querySelectorAll('input[type="checkbox"]'))
                        .filter(box => box.checked)
                        .map(box => box.nextElementSibling.textContent.toLowerCase());
                }

                filteredProducts = allProducts.filter(product => {
                    const name = product.name.toLowerCase();
                    const sku = product.sku.toLowerCase();
                    const category = product.category.toLowerCase();
                    const brand = product.brand.toLowerCase();

                    const matchesSearch = name.includes(searchTerm) || sku.includes(searchTerm);
                    const matchesCategory = activeCategories.length === 0 || activeCategories.includes(category);
                    const matchesBrand = activeBrands.length === 0 || activeBrands.includes(brand);
                    
                    return matchesSearch && matchesCategory && matchesBrand;
                });
                
                // --- EFEKT ŁADOWANIA ---
                shopGrid.classList.add('is-loading'); // Ściemnia siatkę
                
                setTimeout(() => {
                    renderPage(1);
                    shopGrid.classList.remove('is-loading'); // Rozjaśnia z nowymi wynikami
                }, 300); // 300ms "myślenia"
            }
                
                renderPage(1);
            

           if (searchInput) searchInput.addEventListener('input', applyFilters);
            if (filterBtn) filterBtn.addEventListener('click', applyFilters);

            // Przycisk wyczyść filtry
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
        clearBtn.addEventListener('click', () => {
        checkboxes.forEach(box => box.checked = false);
        if (searchInput) searchInput.value = '';
        applyFilters(); // ← zamiast ręcznego resetowania
    });
}

            if (searchQuery || categoryQuery || brandQuery) applyFilters();
        }
    }

    // ==========================================
    // 5. STRONA POJEDYNCZEGO PRODUKTU
    // ==========================================
    const productSingleLayout = document.querySelector('.product-single-layout');
    if (productSingleLayout) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSku = urlParams.get('sku');

        if (rawSku) {
            const productSku = decodeURIComponent(rawSku);
            fetchProducts()
                .then(products => {
                    const product = products.find(p => String(p.sku) === String(productSku));

                    if (product) {
                        document.querySelector('.product-info h1').textContent = `${product.sku} ${product.name}`;

                        // Kategoria jako klikalny link do sklepu z filtrem
                        const categoryLabel = document.querySelector('.category-label');
                        if (categoryLabel) {
                            const encodedCat = encodeURIComponent(product.category);
                            categoryLabel.innerHTML = `<a href="sklep.html?kategoria=${encodedCat}" title="Zobacz więcej: ${product.category}">${product.category.toUpperCase()}</a>`;
                        }

                        const breadcrumbs = document.querySelector('.breadcrumbs p');
                        if (breadcrumbs) {
                            breadcrumbs.innerHTML = `Strona Główna / <a href="sklep.html">Sklep</a> / <a href="sklep.html?kategoria=${encodeURIComponent(product.category)}">${product.category}</a> / ${product.sku} ${product.name}`;
                        }

                        const mainImage = document.querySelector('.main-image img');
                        if (mainImage) {
                            mainImage.src = product.image;
                            mainImage.alt = product.name;
                            mainImage.onerror = function() { this.onerror = null; this.src = fallbackImage; };
                        }

                        const thumbnailsContainer = document.querySelector('.thumbnails');
                        if (thumbnailsContainer) thumbnailsContainer.style.display = 'none';

                        const opisContainer = document.getElementById('opis');
                        if (opisContainer) {
                            if (product.description) {
                                opisContainer.innerHTML = `<p>${product.description.replace(/\\n/g, '<br>')}</p>`;
                            } else {
                                opisContainer.innerHTML = `<p>Brak opisu dla tego produktu.</p>`;
                            }
                        }

                        // SEO: aktualizacja title strony
                        document.title = `${product.sku} ${product.name} - ${product.category} | AGRONAPRAWA`;
                    }

                    // Podobne produkty — z tej samej kategorii
                    const relatedGrid = document.getElementById('relatedProductsGrid');
                    if (relatedGrid && product) {
                        relatedGrid.innerHTML = '';
                        // Najpierw szukamy produktów z tej samej kategorii
                        const sameCategory = products.filter(p =>
                            String(p.sku) !== String(productSku) &&
                            p.category === product.category
                        );
                        // Jeśli mniej niż 4 w tej samej kategorii, dopełniamy losowymi
                        const otherProducts = products.filter(p =>
                            String(p.sku) !== String(productSku) &&
                            p.category !== product.category
                        );
                        const sameCatShuffled = sameCategory.sort(() => 0.5 - Math.random());
                        const otherShuffled = otherProducts.sort(() => 0.5 - Math.random());
                        const relatedProducts = [...sameCatShuffled, ...otherShuffled].slice(0, 4);

                        // Tytuł sekcji zależny od tego, czy mamy produkty z tej samej kategorii
                        const relatedTitle = document.querySelector('.related-products .section-title');
                        if (relatedTitle && sameCatShuffled.length > 0) {
                            relatedTitle.textContent = `Więcej z kategorii: ${product.category}`;
                        }

                        relatedProducts.forEach(prod => {
                            const safeSku = encodeURIComponent(prod.sku);
                            relatedGrid.insertAdjacentHTML('beforeend', `
                                <a href="produkt.html?sku=${safeSku}" class="product-card">
                                    <img src="${prod.image}" alt="${prod.name}" onerror="this.onerror=null; this.src='${fallbackImage}';">
                                    <p class="product-sku">${prod.sku}</p>
                                    <p class="product-category-badge">${prod.category}</p>
                                    <h3 class="product-name">${prod.name}</h3>
                                </a>
                            `);
                        });
                    }
                });
        }
    }

    // ==========================================
    // 6. OBSŁUGA FORMULARZY FORMSPREE (AJAX)
    // ==========================================
    const forms = document.querySelectorAll('form[action^="https://formspree.io"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const btn = form.querySelector('button[type="submit"]');
            const originalBtnText = btn.textContent;
            btn.textContent = 'Wysyłanie...';
            btn.disabled = true;

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    alert('Dziękujemy za wiadomość! Odpowiemy najszybciej jak to możliwe.');
                    form.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert('Wystąpił problem z wysłaniem wiadomości. Spróbuj ponownie później.');
                        }
                    });
                }
            }).catch(error => {
                alert('Wystąpił błąd. Sprawdź połączenie internetowe.');
            }).finally(() => {
                btn.textContent = originalBtnText;
                btn.disabled = false;
            });
        });
    });
});