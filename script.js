document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ZAKŁADKI (TABS) I MINIATURKI
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

    // 2. GŁÓWNY SYSTEM SKLEPU (Ładowanie, Filtry, Paginacja)
    const shopGrid = document.querySelector('.shop-layout .products-grid');
    
    let allProducts = []; // Baza wszystkich produktów z JSON
    let filteredProducts = []; // Produkty po użyciu filtra/lupy
    let currentPage = 1;
    const itemsPerPage = 12; // Ile produktów na jednej stronie

    if (shopGrid) {
        // Jesteśmy na stronie sklepu - ładujemy JSON
        fetch('plik.json')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                filteredProducts = products;
                initFiltersAndSearch();
                renderPage(1); // Załaduj pierwszą stronę
            })
            .catch(error => console.error('Błąd ładowania pliku JSON:', error));
    } else {
        // Jesteśmy na innej stronie - obsługujemy tylko globalną lupę (Enter)
        initGlobalSearch();
    }

    // --- FUNKCJA RYSOWANIA STRONY ---
    function renderPage(page) {
        currentPage = page;
        shopGrid.innerHTML = ''; 
        
        // Obliczamy, które produkty pokazać
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredProducts.slice(start, end);

        paginatedItems.forEach(product => {
            // Zabezpieczenie przed mruganiem: this.onerror=null blokuje pętlę!
            const html = `
                <a href="produkt.html?sku=${product.sku}" class="product-card" data-brand="${product.brand.toLowerCase()}">
                    <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x150?text=Brak+Zdjecia';">
                    <p class="product-sku">${product.sku}</p>
                    <h3 class="product-name">${product.name}</h3>
                </a>
            `;
            shopGrid.insertAdjacentHTML('beforeend', html);
        });

        updatePaginationUI(); // Zaktualizuj numerki na dole
        
        // Zaktualizuj licznik u góry "Wyświetlanie..."
        const countDisplay = document.querySelector('.shop-top-bar p');
        if (countDisplay) {
            const showingEnd = Math.min(end, filteredProducts.length);
            const showingStart = filteredProducts.length > 0 ? start + 1 : 0;
            countDisplay.textContent = `Wyświetlanie ${showingStart}–${showingEnd} z ${filteredProducts.length} wyników`;
        }
    }

    // --- FUNKCJA GENEROWANIA NUMERÓW STRON (PAGINACJA) ---
    function updatePaginationUI() {
        let paginationContainer = document.querySelector('.pagination');
        
        // Jeśli nie ma kontenera na stronie, nie rób nic
        if (!paginationContainer) return;
        
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        // Ukryj paginację, jeśli jest tylko 1 strona wyników
        if (totalPages <= 1) return; 

        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement('span');
            span.className = `page-num ${i === currentPage ? 'active' : ''}`;
            span.textContent = i;
            
            // Obsługa kliknięcia w stronę
            span.addEventListener('click', () => {
                renderPage(i);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Przewiń na górę po kliknięciu
            });
            
            paginationContainer.appendChild(span);
        }
    }

    // --- FUNKCJA OBSŁUGI FILTRÓW I LUPY ---
    function initFiltersAndSearch() {
        const searchInput = document.getElementById('searchInput');
        const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
        const filterBtn = document.querySelector('.sidebar .btn');

        // Sprawdź czy ktoś przyleciał z innej strony z parametrem ?szukaj=
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('szukaj');
        if (searchQuery && searchInput) {
            searchInput.value = searchQuery;
        }

        function applyFilters() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const activeBrands = Array.from(checkboxes)
                .filter(box => box.checked)
                .map(box => box.nextElementSibling.textContent.toLowerCase());

            // Filtrujemy bazę wszystkich produktów
            filteredProducts = allProducts.filter(product => {
                const name = product.name.toLowerCase();
                const sku = product.sku.toLowerCase();
                const brand = product.brand.toLowerCase();

                const matchesSearch = name.includes(searchTerm) || sku.includes(searchTerm);
                const matchesBrand = activeBrands.length === 0 || activeBrands.includes(brand) || activeBrands.some(b => name.includes(b));

                return matchesSearch && matchesBrand;
            });

            renderPage(1); // Po użyciu filtra zawsze wracamy na 1 stronę!
        }

        // Nasłuchiwanie na wpisywanie z klawiatury
        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (filterBtn) filterBtn.addEventListener('click', applyFilters);
        
        // Odpal raz na start (żeby odczytać parametr szukaj= z linku)
        if (searchQuery) applyFilters();
    }

    // --- WYSZUKIWARKA GLOBALNA (Na stronie O Nas / Kontakt) ---
    function initGlobalSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    window.location.href = `sklep.html?szukaj=${encodeURIComponent(searchInput.value)}`;
                }
            });
        }
    }
});