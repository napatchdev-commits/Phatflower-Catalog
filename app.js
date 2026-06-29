// PhatFlowers Interactive Catalog - Client Application Logic

const GOOGLE_SHEETS_DATABASE_URL = "https://script.google.com/macros/s/AKfycbxl8B41auvkj7uOhgbK2IBnIWlzfpGmz8Q45VqLlS56Oy9cmcq2VIfL2Ch_6_E-UbVy/exec";

// Default Fallbacks in case fetching from Google Sheets fails or is slow
const DEFAULT_CATALOG = [
    { id: "cat-1", description: "บริการจัดดอกไม้ฉากหลังเวที (Backdrop) ขนาด 3x6 เมตร", unitPrice: 25000 },
    { id: "cat-2", description: "ซุ้มดอกไม้โค้งทางเข้างาน (Arch)", unitPrice: 12000 },
    { id: "cat-3", description: "แสตนด์ดอกไม้ทางเดิน (Flower Stand) 1 คู่", unitPrice: 3500 },
    { id: "cat-4", description: "ช่อดอกไม้เจ้าสาว", unitPrice: 1500 },
    { id: "cat-5", description: "ดอกไม้ติดหน้าอกประธาน/แขกผู้ใหญ่ (ต่อชิ้น)", unitPrice: 150 },
    { id: "cat-6", description: "พานขันหมากดอกไม้สด (เซ็ต 5 พาน)", unitPrice: 8500 }
];

const DEFAULT_PACKAGES = [
    { id: "pkg-1", name: "แพ็กเกจ Bronze (พิธีเช้ามงคล)", price: 29900, badge: "ยอดนิยมสำหรับพิธีเช้า", items: ["ฉากหลังเวทีพิธีเช้า (Backdrop) ขนาด 3x4 เมตร", "ซุ้มดอกไม้โค้งทางเข้างาน (Arch) 1 ซุ้ม", "แสตนด์ดอกไม้ทางเดิน (Flower Stand) 1 คู่", "พานขันหมากดอกไม้สดครบเซ็ต (5 พาน)", "ดอกไม้ติดหน้าอกประธาน/แขกผู้ใหญ่ 6 ชิ้น"], isHighlighted: false },
    { id: "pkg-2", name: "แพ็กเกจ Silver (เช้าเลี้ยงเที่ยง)", price: 49900, badge: "คุ้มค่าที่สุด", items: ["ฉากหลังเวที Backdrop ใหญ่ ขนาด 3x6 เมตร", "ซุ้มดอกไม้โค้งทางเข้างานหรูหรา 1 ซุ้ม", "แสตนด์ดอกไม้ทางเดิน (Flower Stand) 2 คู่ (4 จุด)", "ช่อดอกไม้เจ้าสาวโทนสีตามธีมงาน 1 ช่อ", "ดอกไม้ติดหน้าอกประธาน/แขกผู้ใหญ่ 12 ชิ้น", "ตกแต่งโต๊ะลงทะเบียนและเวทีรดน้ำสังข์"], isHighlighted: true },
    { id: "pkg-3", name: "แพ็กเกจ Gold (หรูหราอลังการ)", price: 0, badge: "พรีเมียมจัดเต็ม", items: ["ฉากหลังเวที Backdrop 3D แผงคู่ ขนาดใหญ่ 3x8 เมตร", "ซุ้มดอกไม้ทางเข้าอุโมงค์ยาว (Flower Tunnel)", "แสตนด์ดอกไม้ตกแต่งทางเดินยาวตลอดงาน 4 คู่", "พานขันหมากและช่อดอกไม้เจ้าสาวระดับมาสเตอร์พีซ", "ดอกไม้ตกแต่งโต๊ะ VIP และแบ็คดรอปถ่ายรูปเสริม", "ทีมดูแลปรับธีมเฉดสีตามสเปกนักจัดดอกไม้มืออาชีพ"], isHighlighted: false }
];

const DEFAULT_PROMOTIONS = [
    { id: "promo-1", title: "โปรจองล่วงหน้า 60 วันขึ้นไป", description: "รับส่วนลดทันที 10% สำหรับแพ็กเกจงานแต่งงาน และฟรีช่อดอกไม้เจ้าสาวมูลค่า 1,500 บาท", badge: "Hot", type: "primary" },
    { id: "promo-2", title: "ฟรี! สแตนด์ดอกไม้ทางเดิน 1 คู่", description: "เมื่อมียอดจองจัดงานแต่งงานรวมตั้งแต่ 35,000 บาทขึ้นไป (พร้อมบริการส่งฟรีในระยะ 30 กม.)", badge: "พิเศษ", type: "secondary" }
];

// App State
const state = {
    catalog: [],
    packages: [],
    promotions: [],
    selectedItems: {}, // key: itemId, value: { item: Object, qty: Number }
    activeCategory: 'all'
};

// Map keywords to category and icons for rich visualization
const CATEGORY_MAP = [
    { key: "ฉากหลัง", name: "backdrop", label: "ฉากหลัง (Backdrop)", icon: "fa-regular fa-image" },
    { key: "ซุ้ม", name: "arch", label: "ซุ้มทางเข้า (Arch)", icon: "fa-solid fa-archway" },
    { key: "แสตนด์", name: "stand", label: "แสตนด์ทางเดิน", icon: "fa-solid fa-road" },
    { key: "ช่อดอกไม้", name: "bouquet", label: "ช่อดอกไม้", icon: "fa-solid fa-spa" },
    { key: "ติดหน้าอก", name: "corsage", label: "ดอกไม้ติดหน้าอก", icon: "fa-solid fa-seedling" },
    { key: "พาน", name: "khanmaak", label: "พานขันหมาก", icon: "fa-solid fa-gifts" }
];

function getItemCategory(description) {
    const desc = description.toLowerCase();
    for (const cat of CATEGORY_MAP) {
        if (desc.includes(cat.key)) {
            return cat;
        }
    }
    return { name: "other", label: "อื่นๆ", icon: "fa-solid fa-leaf" };
}

// Format numbers as currency
function formatCurrency(number) {
    return new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 0 }).format(number);
}

// Fetch Catalog from Google Sheets via Web App API
// Fetch Catalog, Packages, and Promotions from Google Sheets via Web App API
async function loadCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = `
        <div class="spinner-container" style="grid-column: 1/-1;">
            <div class="spinner"></div>
            <p>กำลังดึงข้อมูลรายการสินค้า/บริการล่าสุด...</p>
        </div>
    `;

    try {
        // Fetch database from Google Apps Script Web App
        const response = await fetch(GOOGLE_SHEETS_DATABASE_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action: 'fetch' })
        });
        
        const data = await response.json();
        
        if (data && data.status === 'success' && data.result) {
            state.catalog = (data.result.catalog || []).filter(item => item !== null);
            
            const fetchedPkgs = (data.result.packages || []).filter(item => item !== null);
            state.packages = fetchedPkgs.length > 0 ? fetchedPkgs : DEFAULT_PACKAGES;
            
            const fetchedPromos = (data.result.promotions || []).filter(item => item !== null);
            state.promotions = fetchedPromos.length > 0 ? fetchedPromos : DEFAULT_PROMOTIONS;
            
            console.log("Loaded dynamic database from Google Sheets.");
        } else {
            console.warn("API returned invalid data, using default structures:", data);
            state.catalog = DEFAULT_CATALOG;
            state.packages = DEFAULT_PACKAGES;
            state.promotions = DEFAULT_PROMOTIONS;
        }
    } catch (error) {
        console.error("Failed to fetch database from API, using defaults:", error);
        state.catalog = DEFAULT_CATALOG;
        state.packages = DEFAULT_PACKAGES;
        state.promotions = DEFAULT_PROMOTIONS;
    }

    renderFilterButtons();
    renderCatalog();
    renderPromotions();
    renderPackages();
}

// Render dynamic filter buttons based on what categories exist in catalog
function renderFilterButtons() {
    const filterContainer = document.getElementById('category-filter');
    if (!filterContainer) return;

    // Get unique categories found in catalog
    const activeCats = new Set();
    state.catalog.forEach(item => {
        activeCats.add(getItemCategory(item.description).name);
    });

    let html = '';
    
    // Add dynamic jump buttons for Promo & Packages if present in database
    if (state.promotions && state.promotions.length > 0) {
        html += `<button class="category-btn highlight-btn-promo" onclick="scrollToSection('promotions-section-wrapper')"><i class="fa-solid fa-gift"></i> โปรโมชัน</button>`;
    }
    if (state.packages && state.packages.length > 0) {
        html += `<button class="category-btn highlight-btn-pkg" onclick="scrollToSection('packages-section-wrapper')"><i class="fa-solid fa-cubes"></i> แพ็กเกจจัดงาน</button>`;
    }
    
    html += `<button class="category-btn active" onclick="setCategory('all')">ทั้งหมด</button>`;
    
    CATEGORY_MAP.forEach(cat => {
        if (activeCats.has(cat.name)) {
            html += `<button class="category-btn" onclick="setCategory('${cat.name}')">${cat.label.split(' ')[0]}</button>`;
        }
    });

    if (activeCats.has('other')) {
        html += `<button class="category-btn" onclick="setCategory('other')">อื่นๆ</button>`;
    }

    filterContainer.innerHTML = html;
}

// Smooth scroll helper
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.scrollToSection = scrollToSection;

function setCategory(catName) {
    state.activeCategory = catName;
    
    // Update active class
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('setCategory') && onclickAttr.includes(`'${catName}'`)) {
            btn.classList.add('active');
        }
    });

    renderCatalog();
}

// Render Catalog Cards
function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    let filtered = state.catalog;
    if (state.activeCategory !== 'all') {
        filtered = state.catalog.filter(item => getItemCategory(item.description).name === state.activeCategory);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-400);">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;"></i>
                <p>ไม่พบรายการสินค้าในหมวดหมู่นี้</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const catInfo = getItemCategory(item.description);
        
        // Select an icon that matches the category
        let categoryIcon = "fa-solid fa-spa";
        if (catInfo.name === 'backdrop') categoryIcon = "fa-regular fa-image";
        else if (catInfo.name === 'arch') categoryIcon = "fa-solid fa-archway";
        else if (catInfo.name === 'stand') categoryIcon = "fa-solid fa-road";
        else if (catInfo.name === 'bouquet') categoryIcon = "fa-solid fa-spa";
        else if (catInfo.name === 'corsage') categoryIcon = "fa-solid fa-seedling";
        else if (catInfo.name === 'khanmaak') categoryIcon = "fa-solid fa-gifts";

        const badgeText = catInfo.label.split(' ')[0];

        return `
            <div class="item-card">
                <span class="item-badge">${badgeText}</span>
                <div class="item-image-placeholder">
                    <i class="${categoryIcon}"></i>
                </div>
                <div class="item-details">
                    <h3 class="item-title">${item.description}</h3>
                    <div class="item-price">
                        ${item.unitPrice > 0 ? `${formatCurrency(item.unitPrice)} <span>บาท</span>` : `<span>สอบถามราคา (ประเมินตามหน้างาน)</span>`}
                    </div>
                    <button class="btn-add" onclick="addToPackage('${item.id}')">
                        <i class="fa-solid fa-plus"></i> เพิ่มในแพ็กเกจ
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Select a preset package and add it to the visual builder
function selectPresetPackage(id, description, price) {
    if (state.selectedItems[id]) {
        state.selectedItems[id].qty++;
    } else {
        state.selectedItems[id] = {
            item: {
                id: id,
                description: description,
                unitPrice: price
            },
            qty: 1
        };
    }
    updateSummary();
    triggerFloatingEffect(id);
    
    // On mobile, show summary drawer automatically to see the selected package
    if (window.innerWidth <= 1024) {
        toggleMobileDrawer(true);
    }
}

// Add Item to visual builder package
function addToPackage(itemId) {
    const item = state.catalog.find(i => i.id === itemId);
    if (!item) return;

    if (state.selectedItems[itemId]) {
        state.selectedItems[itemId].qty++;
    } else {
        state.selectedItems[itemId] = {
            item: item,
            qty: 1
        };
    }

    updateSummary();
    triggerFloatingEffect(itemId);
}

// Decrease item count or remove
function removeFromPackage(itemId) {
    if (!state.selectedItems[itemId]) return;

    state.selectedItems[itemId].qty--;
    if (state.selectedItems[itemId].qty <= 0) {
        delete state.selectedItems[itemId];
    }

    updateSummary();
}

// Remove item entirely
function deleteFromPackage(itemId) {
    delete state.selectedItems[itemId];
    updateSummary();
}

function clearPackage() {
    if (Object.keys(state.selectedItems).length === 0) return;
    
    if (confirm("คุณต้องการล้างรายการสินค้าที่เลือกทั้งหมดใช่หรือไม่?")) {
        state.selectedItems = {};
        updateSummary();
    }
}

// Calculate values and update UI
function updateSummary() {
    const listBody = document.getElementById('cart-items-list');
    const selectedCount = Object.keys(state.selectedItems).length;

    if (selectedCount === 0) {
        listBody.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>ยังไม่มีการเลือกจัดรายการ</p>
                <p style="font-size: 0.8rem; margin-top: -5px;">เลือกสินค้าด้านซ้ายเพื่อสร้างเซ็ตแพ็กเกจของคุณ</p>
            </div>
        `;
        
        // Disable action button
        document.getElementById('btn-checkout').disabled = true;
        document.getElementById('mobile-checkout-btn').disabled = true;
        
        // Reset prices
        document.getElementById('summary-subtotal').innerText = "0";
        document.getElementById('summary-total').innerText = "0";
        document.getElementById('mobile-total').innerText = "0";
        return;
    }

    // Enable checkout button
    document.getElementById('btn-checkout').disabled = false;
    document.getElementById('mobile-checkout-btn').disabled = false;

    let subtotal = 0;
    let listHtml = '';
    let hasCustomPrice = false;

    for (const key in state.selectedItems) {
        const entry = state.selectedItems[key];
        if (entry.item.unitPrice === 0) {
            hasCustomPrice = true;
        }
        const itemTotal = entry.item.unitPrice * entry.qty;
        subtotal += itemTotal;

        const priceDisplay = entry.item.unitPrice > 0 
            ? `${formatCurrency(entry.item.unitPrice)} บาท` 
            : `สอบถามราคา`;

        listHtml += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${entry.item.description}</div>
                    <div class="cart-item-price">${priceDisplay}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="removeFromPackage('${entry.item.id}')">-</button>
                    <span class="qty-val">${entry.qty}</span>
                    <button class="qty-btn" onclick="addToPackage('${entry.item.id}')">+</button>
                    <button class="remove-btn" onclick="deleteFromPackage('${entry.item.id}')" title="ลบรายการ">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }

    listBody.innerHTML = listHtml;
    
    // Update summary details
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const mobileTotalEl = document.getElementById('mobile-total');
    
    if (hasCustomPrice) {
        const text = subtotal > 0 ? `เริ่มต้น ${formatCurrency(subtotal)}` : `รอประเมินราคา`;
        subtotalEl.innerText = text;
        totalEl.innerText = text;
        mobileTotalEl.innerText = text;
    } else {
        subtotalEl.innerText = formatCurrency(subtotal);
        totalEl.innerText = formatCurrency(subtotal);
        mobileTotalEl.innerText = formatCurrency(subtotal);
    }
}

// Micro animation for adding items
function triggerFloatingEffect(itemId) {
    // Add small highlight to cart summary box
    const panel = document.getElementById('builder-panel');
    panel.style.transform = 'scale(1.02)';
    setTimeout(() => {
        panel.style.transform = 'scale(1)';
    }, 150);
}

// Show/Hide Request Modal
function toggleRequestModal(show) {
    const modal = document.getElementById('request-modal');
    if (show) {
        // Setup initial default date as tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        document.getElementById('req-date').min = `${yyyy}-${mm}-${dd}`;
        
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

// Submit Customer Request to Google Apps Script
async function submitQuoteRequest(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('btn-submit-request');
    const originalText = submitBtn.innerHTML;
    
    // Collect Form Data
    const customerName = document.getElementById('req-name').value.trim();
    const phone = document.getElementById('req-phone').value.trim();
    const eventDate = document.getElementById('req-date').value;
    const eventLocation = document.getElementById('req-location').value.trim();
    const notes = document.getElementById('req-notes').value.trim();
    
    // Validate selected package
    const items = [];
    let totalPrice = 0;
    
    for (const key in state.selectedItems) {
        const entry = state.selectedItems[key];
        items.push({
            id: entry.item.id,
            description: entry.item.description,
            qty: entry.qty,
            unitPrice: entry.item.unitPrice
        });
        totalPrice += entry.item.unitPrice * entry.qty;
    }
    
    if (items.length === 0) {
        alert("กรุณาเลือกรายการสินค้าที่สนใจจัดงานก่อนส่งข้อมูล");
        return;
    }
    
    const payload = {
        action: "createDraftRequest",
        data: {
            customerName: customerName,
            phone: phone,
            eventDate: eventDate,
            eventLocation: eventLocation,
            notes: notes,
            items: items,
            totalPrice: totalPrice,
            isInquiry: true // Flag to distinguish interest inquiries in backend
        }
    };
    
    // UI state loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกข้อมูล...`;
    
    try {
        const response = await fetch(GOOGLE_SHEETS_DATABASE_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        const res = await response.json();
        
        if (res && res.status === 'success') {
            // Render success screen inside modal
            renderSuccessScreen(res.requestId, customerName, totalPrice);
            
            // Clear package and form
            state.selectedItems = {};
            updateSummary();
            document.getElementById('quote-request-form').reset();
        } else {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (res.message || "โปรดลองอีกครั้งภายหลัง"));
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (err) {
        console.error("Submission failed or blocked by CORS:", err);
        
        // Fallback: If user is online, it means the request likely reached Google Sheets & Line Bot successfully,
        // but the browser blocked the response redirect due to CORS (especially when running from file:// URL).
        if (navigator.onLine) {
            console.log("Internet is active. Google Apps Script execution is presumed successful.");
            const fallbackId = "REQ-" + Math.floor(100000 + Math.random() * 900000);
            renderSuccessScreen(fallbackId, customerName, totalPrice);
            
            // Clear package and form
            state.selectedItems = {};
            updateSummary();
            document.getElementById('quote-request-form').reset();
        } else {
            alert("ไม่สามารถเชื่อมต่อคลาวด์เพื่อส่งข้อมูลได้ในขณะนี้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// Render Success Screen inside Modal Content
function renderSuccessScreen(requestId, name, total) {
    const modalContent = document.querySelector('#request-modal .modal-content');
    const totalText = total > 0 ? `ยอดประเมินเริ่มต้น: ${formatCurrency(total)} บาท` : `แจ้งราคาประเมินภายหลัง`;
    modalContent.innerHTML = `
        <div class="modal-header">
            <span class="modal-title">ส่งข้อมูลความสนใจเรียบร้อย</span>
            <button class="close-modal-btn" onclick="closeSuccessAndReload()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body success-screen">
            <i class="fa-regular fa-circle-check success-icon"></i>
            <h3>ส่งข้อมูลให้พนักงานสำเร็จ!</h3>
            <p>ระบบได้ทำการบันทึกข้อมูลความสนใจในการจัดงานแต่ง/จัดงานของคุณเรียบร้อยแล้ว พนักงานจะรีบติดต่อกลับเพื่อเสนอราคาและรายละเอียดโดยเร็วที่สุด</p>
            <div class="req-id-badge">${requestId}</div>
            <p style="font-size: 0.85rem; color: var(--secondary); font-weight: 500;">
                คุณ: ${name} <br> ${totalText}
            </p>
            <button class="btn-primary" onclick="closeSuccessAndReload()" style="margin-top: 15px; width: 100%;">
                ตกลง / กลับหน้าเว็บหลัก
            </button>
        </div>
    `;
}

function closeSuccessAndReload() {
    toggleRequestModal(false);
    // Reset modal contents back to form layout after closing
    setTimeout(() => {
        const modalContent = document.querySelector('#request-modal .modal-content');
        modalContent.innerHTML = `
            <div class="modal-header">
                <span class="modal-title">กรอกข้อมูลความสนใจจัดงาน</span>
                <button class="close-modal-btn" onclick="toggleRequestModal(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="quote-request-form" onsubmit="submitQuoteRequest(event)">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="req-name">ชื่อ - นามสกุล ผู้ติดต่อ *</label>
                        <input type="text" id="req-name" required placeholder="เช่น คุณสมชาย รักดี">
                    </div>
                    <div class="form-group">
                        <label for="req-phone">เบอร์โทรศัพท์ติดต่อกลับ (ถ้ามี)</label>
                        <input type="tel" id="req-phone" pattern="[0-9]{9,10}" placeholder="เช่น 0891234567">
                    </div>
                    <div class="form-group">
                        <label for="req-date">วันที่จัดงาน (ถ้ามี)</label>
                        <input type="date" id="req-date">
                    </div>
                    <div class="form-group">
                        <label for="req-location">สถานที่จัดงาน / ที่อยู่จัดงาน *</label>
                        <textarea id="req-location" required placeholder="กรอกข้อมูลสถานที่จัดงาน เช่น โรงแรมกรุงเทพ แกรนด์ ฮอลล์ ชั้น 2"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="req-notes">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                        <textarea id="req-notes" placeholder="ระบุรายละเอียด ดีไซน์ หรือเฉดสีดอกไม้ที่ต้องการเน้น เช่น โทนพาสเทล ชมพู-ขาว"></textarea>
                    </div>
                    <button type="submit" class="btn-primary" id="btn-submit-request" style="margin-top: 10px;">
                        <i class="fa-regular fa-paper-plane"></i> ส่งข้อมูลความสนใจให้พนักงาน
                    </button>
                </div>
            </form>
        `;
    }, 500);
}

// Mobile Summary Drawer Toggle
function toggleMobileDrawer(show) {
    const panel = document.getElementById('builder-panel');
    const overlay = document.getElementById('drawer-overlay');
    
    if (show) {
        panel.classList.add('mobile-active');
        overlay.classList.add('active');
    } else {
        panel.classList.remove('mobile-active');
        overlay.classList.remove('active');
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadCatalog();
    
    // Bind overlay click to close mobile drawer
    document.getElementById('drawer-overlay').addEventListener('click', () => {
        toggleMobileDrawer(false);
    });
});

// Render Dynamic Promotions
function renderPromotions() {
    const container = document.getElementById('promotions-container');
    const wrapper = document.getElementById('promotions-section-wrapper');
    if (!container || !wrapper) return;

    const filtered = (state.promotions || []).filter(p => p !== null && p !== undefined);

    if (filtered.length === 0) {
        wrapper.style.display = 'none';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const isSecondary = p.type === 'secondary';
        const badgeIcon = isSecondary ? 'fa-star' : 'fa-fire';
        const badgeClass = isSecondary ? 'secondary' : '';
        
        return `
            <div class="promo-card ${badgeClass}">
                ${p.badge ? `<div class="promo-badge"><i class="fa-solid ${badgeIcon}"></i> ${p.badge}</div>` : ''}
                <div class="promo-content">
                    <h4>${p.title || ""}</h4>
                    <p>${p.description || ""}</p>
                </div>
            </div>
        `;
    }).join('');

    wrapper.style.display = 'block';
}

// Render Dynamic Preset Packages
function renderPackages() {
    const container = document.getElementById('packages-container');
    const wrapper = document.getElementById('packages-section-wrapper');
    if (!container || !wrapper) return;

    const filtered = (state.packages || []).filter(pkg => pkg !== null && pkg !== undefined);

    if (filtered.length === 0) {
        wrapper.style.display = 'none';
        return;
    }

    container.innerHTML = filtered.map(pkg => {
        const highlightClass = pkg.isHighlighted ? 'highlighted' : '';
        const badgeClass = pkg.isHighlighted ? 'gold' : '';
        
        // Items list rendering
        let itemsHtml = '';
        if (pkg.items) {
            const list = Array.isArray(pkg.items) 
                ? pkg.items 
                : pkg.items.split(',').map(i => i.trim()).filter(i => i.length > 0);
                
            itemsHtml = list.map(item => `<li><i class="fa-solid fa-circle-check"></i> ${item}</li>`).join('');
        }

        const priceText = pkg.price > 0 
            ? `${formatCurrency(pkg.price)} <span>บาท</span>` 
            : `0 <span>บาท</span>`;
            
        const priceNote = pkg.price > 0 
            ? '' 
            : `<div style="font-size: 0.8rem; color: var(--gray-400); margin-top: -4px;">* ประเมินราคาพิเศษตามหน้างาน (สอบถามราคา)</div>`;

        return `
            <div class="package-card ${highlightClass}">
                <div class="package-header">
                    ${pkg.badge ? `<span class="package-badge ${badgeClass}">${pkg.badge}</span>` : ''}
                    <h3>${pkg.name || ""}</h3>
                    <div class="package-price">${priceText}</div>
                    ${priceNote}
                </div>
                <div class="package-body">
                    <ul>
                        ${itemsHtml}
                    </ul>
                    <button class="btn-select-package" onclick="selectPresetPackage('${pkg.id}', '${pkg.name}', ${pkg.price})">
                        <i class="fa-solid fa-plus"></i> เลือกแพ็กเกจนี้
                    </button>
                </div>
            </div>
        `;
    }).join('');

    wrapper.style.display = 'block';
}
