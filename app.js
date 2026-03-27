// Function to convert Number to Words (Indian Rupees)
function numberToWords(amount) {
    if (amount === 0) return "Zero";
    const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    const num = parseFloat(amount).toFixed(2);
    const splitStr = num.split(".");
    let wholeNum = parseInt(splitStr[0], 10);
    const decNum = parseInt(splitStr[1], 10);

    const convertWhole = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 !== 0 ? "and " + convertWhole(n % 100) : "");
        if (n < 100000) return convertWhole(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? convertWhole(n % 1000) : "");
        if (n < 10000000) return convertWhole(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? convertWhole(n % 100000) : "");
        return convertWhole(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? convertWhole(n % 10000000) : "");
    };

    let result = convertWhole(wholeNum);
    
    if (decNum > 0) {
        result += "and " + convertWhole(decNum) + "Paise ";
    }
    return result.trim() + " Only";
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Configuration
    const conf = window.appConfig;
    if (conf) {
        document.getElementById('config-biz-name').textContent = conf.businessName;
        document.getElementById('config-biz-address1').textContent = conf.addressLine1;
        document.getElementById('config-biz-address2').textContent = conf.addressLine2;
        document.getElementById('config-biz-phone').textContent = conf.phone;
        document.getElementById('config-biz-email').textContent = conf.email;
        document.getElementById('config-biz-gst').textContent = conf.gstNumber;
        document.getElementById('config-sign-name').textContent = conf.businessName;

        // Bank
        document.getElementById('config-bank-name').textContent = conf.bankDetails.bankName;
        document.getElementById('config-bank-acc-name').textContent = conf.bankDetails.accountName;
        document.getElementById('config-bank-acc-no').textContent = conf.bankDetails.accountNumber;
        document.getElementById('config-bank-ifsc').textContent = conf.bankDetails.ifscCode;

        // Rates
        document.getElementById('cgst-rate').textContent = conf.taxRates.cgst;
        document.getElementById('sgst-rate').textContent = conf.taxRates.sgst;
        document.getElementById('igst-rate').textContent = conf.taxRates.igst;
    }

    // Set Default Dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;
    
    let dueStr = new Date();
    dueStr.setDate(dueStr.getDate() + 15); // Default 15 days due
    document.getElementById('due-date').value = dueStr.toISOString().split('T')[0];

    // 2. Manage Items
    const itemsTbody = document.getElementById('items-tbody');
    const addItemBtn = document.getElementById('add-item-btn');
    
    let state = {
        items: [
            { id: generateId(), desc: '', hsn: '', qty: 1, rate: 0, amount: 0 }
        ]
    };

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function renderItems() {
        itemsTbody.innerHTML = '';
        state.items.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <textarea class="item-input" data-id="${item.id}" data-field="desc" rows="1" placeholder="Item Name/Description">${item.desc}</textarea>
                </td>
                <td>
                    <input type="text" class="item-input" data-id="${item.id}" data-field="hsn" value="${item.hsn}" placeholder="HSN/SAC">
                </td>
                <td>
                    <input type="number" class="item-input" data-id="${item.id}" data-field="qty" value="${item.qty}" min="1">
                </td>
                <td>
                    <input type="number" class="item-input" data-id="${item.id}" data-field="rate" value="${item.rate}" min="0" step="0.01">
                </td>
                <td>
                    <span class="item-amount" id="amt-${item.id}">₹${item.amount.toFixed(2)}</span>
                </td>
                <td class="no-print">
                    <button class="btn icon-btn delete-btn" data-id="${item.id}">🗑️</button>
                </td>
            `;
            itemsTbody.appendChild(tr);
        });
        
        attachItemListeners();
        calculateTotals();
    }

    function attachItemListeners() {
        document.querySelectorAll('.item-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.getAttribute('data-id');
                const field = e.target.getAttribute('data-field');
                let value = e.target.value;

                if (field === 'qty' || field === 'rate') {
                    value = parseFloat(value) || 0;
                }

                updateItem(id, field, value);

                // Auto-expand textarea
                if (e.target.tagName.toLowerCase() === 'textarea') {
                    e.target.style.height = 'auto';
                    e.target.style.height = (e.target.scrollHeight) + 'px';
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').getAttribute('data-id');
                removeItem(id);
            });
        });
    }

    function updateItem(id, field, value) {
        const item = state.items.find(i => i.id == id);
        if (item) {
            item[field] = value;
            if (field === 'qty' || field === 'rate') {
                item.amount = item.qty * item.rate;
                const amtEl = document.getElementById(`amt-${id}`);
                if (amtEl) {
                    amtEl.textContent = `₹${item.amount.toFixed(2)}`;
                }
                calculateTotals();
            } else if (field === 'desc' || field === 'hsn') {
                // We just record it in state
            }
        }
    }

    function removeItem(id) {
        state.items = state.items.filter(i => i.id != id);
        if(state.items.length === 0) {
             state.items.push({ id: generateId(), desc: '', hsn: '', qty: 1, rate: 0, amount: 0 });
        }
        renderItems();
    }

    addItemBtn.addEventListener('click', () => {
        state.items.push({ id: generateId(), desc: '', hsn: '', qty: 1, rate: 0, amount: 0 });
        renderItems();
    });

    // 3. Tax Checkboxes
    const cbCgstSgst = document.getElementById('apply-cgst-sgst');
    const cbIgst = document.getElementById('apply-igst');

    cbCgstSgst.addEventListener('change', (e) => {
        if(e.target.checked) cbIgst.checked = false;
        calculateTotals();
    });

    cbIgst.addEventListener('change', (e) => {
        if(e.target.checked) cbCgstSgst.checked = false;
        calculateTotals();
    });

    // 4. Calculations
    function calculateTotals() {
        const subtotal = state.items.reduce((sum, item) => sum + item.amount, 0);
        document.getElementById('sub-total').textContent = `₹${subtotal.toFixed(2)}`;

        let cgstAmt = 0;
        let sgstAmt = 0;
        let igstAmt = 0;

        if (conf) {
            if (cbCgstSgst.checked) {
                cgstAmt = subtotal * (conf.taxRates.cgst / 100);
                sgstAmt = subtotal * (conf.taxRates.sgst / 100);
                document.getElementById('row-cgst').style.display = 'flex';
                document.getElementById('row-sgst').style.display = 'flex';
                document.getElementById('row-igst').style.display = 'none';
            } else if (cbIgst.checked) {
                igstAmt = subtotal * (conf.taxRates.igst / 100);
                document.getElementById('row-cgst').style.display = 'none';
                document.getElementById('row-sgst').style.display = 'none';
                document.getElementById('row-igst').style.display = 'flex';
            } else {
                document.getElementById('row-cgst').style.display = 'none';
                document.getElementById('row-sgst').style.display = 'none';
                document.getElementById('row-igst').style.display = 'none';
            }
        }

        document.getElementById('cgst-amount').textContent = `₹${cgstAmt.toFixed(2)}`;
        document.getElementById('sgst-amount').textContent = `₹${sgstAmt.toFixed(2)}`;
        document.getElementById('igst-amount').textContent = `₹${igstAmt.toFixed(2)}`;

        const grandTotal = Math.round(subtotal + cgstAmt + sgstAmt + igstAmt);
        document.getElementById('grand-total').textContent = `₹${grandTotal.toFixed(2)}`;
        
        // Amount in words
        document.getElementById('amount-in-words').textContent = numberToWords(grandTotal);
    }

    // 5. PDF Generation
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    downloadPdfBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-document');
        
        // Create temporary div elements replacing inputs so all text is 100% visible in PDF
        document.querySelectorAll('.item-input, #client-name, #client-address, #client-gst, #invoice-no, #invoice-date, #due-date').forEach(el => {
            let textVal = el.value || "";
            let textDiv = document.createElement('div');
            textDiv.className = 'temp-pdf-text';
            textDiv.style.whiteSpace = 'pre-wrap';
            textDiv.style.wordBreak = 'break-word';
            textDiv.style.fontFamily = 'inherit';
            textDiv.style.fontSize = getComputedStyle(el).fontSize;
            textDiv.style.padding = getComputedStyle(el).padding;
            textDiv.style.minHeight = el.tagName === 'TEXTAREA' ? '1.5em' : 'auto';
            textDiv.innerText = textVal;
            
            el.parentNode.insertBefore(textDiv, el);
            el.style.display = 'none'; // Temporarily hide input
        });

        // Create an off-screen container to hold a clone of the invoice.
        // This completely prevents the browser window size from cropping the capture on the right side.
        const clone = element.cloneNode(true);
        const printContainer = document.createElement('div');
        printContainer.style.position = 'absolute';
        printContainer.style.top = '0'; // Keep top 0 to prevent vertical offset/gaps
        printContainer.style.left = '-9999px';
        printContainer.style.width = '1000px'; // Give it plenty of room to stretch
        printContainer.style.background = 'white';
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);

        // Force the clone to look exactly as we want and have a specific width
        clone.style.width = '750px'; 
        clone.style.margin = '0 auto';
        clone.style.boxShadow = 'none';
        clone.style.border = 'none';
        clone.style.padding = '2rem'; // Reduced padding slightly to maintain internal proportions 

        const invoiceNo = document.getElementById('invoice-no').value || '0001';
        const opt = {
            margin:       0.2, // Small external margin
            filename:     `Invoice-${invoiceNo}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, scrollX: 0 }, 
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        // Delay to allow DOM updates to paint
        setTimeout(() => {
            html2pdf().set(opt).from(clone).save().then(() => {
                // Cleanup print container
                document.body.removeChild(printContainer);
                
                // Restore actual inputs in LIVE DOM
                document.querySelectorAll('.temp-pdf-text').forEach(div => div.remove());
                document.querySelectorAll('.item-input, #client-name, #client-address, #client-gst, #invoice-no, #invoice-date, #due-date').forEach(el => {
                    el.style.display = '';
                });
            });
        }, 150);
    });

    // Initial render
    renderItems();
});
