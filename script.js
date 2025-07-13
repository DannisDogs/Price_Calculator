document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculator-form');
    const dropoffInput = document.getElementById('dropoff-date');
    const pickupInput = document.getElementById('pickup-date');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');
    const dogsContainer = document.getElementById('dogs-container');
    const addDogBtn = document.getElementById('add-dog-btn');
    const dogModal = document.getElementById('dog-modal');
    const cancelDogBtn = document.getElementById('cancel-dog-btn');
    const saveDogBtn = document.getElementById('save-dog-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Date/Time picker elements
    const datetimeModal = document.getElementById('datetime-modal');
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.getElementById('calendar-month');
    const calendarYear = document.getElementById('calendar-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeHourSelect = document.getElementById('time-hour');
    const timeMinuteSelect = document.getElementById('time-minute');
    const timeAmpmSelect = document.getElementById('time-ampm');
    const datetimePreviewText = document.getElementById('datetime-preview-text');
    const cancelDatetimeBtn = document.getElementById('cancel-datetime-btn');
    const saveDatetimeBtn = document.getElementById('save-datetime-btn');
    const quickTimeBtns = document.querySelectorAll('.quick-time-btn');
    
    // Dog data management
    let dogs = [];
    let currentDogData = { name: '', breed: '', customBreed: '', size: '' };
    
    // Data persistence functions
    function saveAppState() {
        const appState = {
            dogs: dogs,
            dropoffDate: dropoffInput.dataset.dateValue,
            pickupDate: pickupInput.dataset.dateValue,
            dropoffDisplayValue: dropoffInput.value,
            pickupDisplayValue: pickupInput.value,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('dogSittingCalculatorState', JSON.stringify(appState));
    }
    
    function loadAppState() {
        try {
            const savedState = localStorage.getItem('dogSittingCalculatorState');
            if (savedState) {
                const appState = JSON.parse(savedState);
                
                // Restore dogs
                if (appState.dogs && Array.isArray(appState.dogs)) {
                    dogs = appState.dogs;
                    updateDogsDisplay();
                    updateHeaderDogs();
                }
                
                // Restore dates if they exist and are not too old (older than 7 days)
                const savedTime = new Date(appState.timestamp);
                const now = new Date();
                const daysDiff = (now - savedTime) / (1000 * 60 * 60 * 24);
                
                if (daysDiff < 7 && appState.dropoffDate && appState.pickupDate) {
                    // Only restore if the dates are in the future
                    const dropoffDate = new Date(appState.dropoffDate);
                    const pickupDate = new Date(appState.pickupDate);
                    
                    if (dropoffDate > now || pickupDate > now) {
                        dropoffInput.value = appState.dropoffDisplayValue || '';
                        dropoffInput.dataset.dateValue = appState.dropoffDate;
                        pickupInput.value = appState.pickupDisplayValue || '';
                        pickupInput.dataset.dateValue = appState.pickupDate;
                    }
                }
                
                // Trigger calculation if we have all required data
                calculateRealTime();
            }
        } catch (error) {
            console.warn('Failed to load saved state:', error);
        }
    }
    
    function clearAppState() {
        localStorage.removeItem('dogSittingCalculatorState');
    }
    
    // Header dogs management
    const headerDogsContainer = document.getElementById('header-dogs');
    
    function updateHeaderDogs() {
        // Clear existing header dogs
        headerDogsContainer.innerHTML = '';
        
        // Add a bouncing dog for each dog in the list
        dogs.forEach((dog, index) => {
            const breedIcons = {
                'labrador': '🦮',
                'german-shepherd': '🐕‍🦺',
                'poodle': '🐩',
                'bulldog': '🐕',
                'chihuahua': '🐕',
                'mixed': '🐶'
            };
            
            const dogElement = document.createElement('div');
            dogElement.className = 'bouncing-dog';
            dogElement.textContent = breedIcons[dog.breed] || '🐶';
            dogElement.style.animationDelay = `${index * 0.5}s`;
            
            headerDogsContainer.appendChild(dogElement);
        });
    }
    
    // Date/Time picker state
    let currentDatetimeInput = null;
    let selectedDate = null;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    
    // Initialize dark mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Add dog button click
    addDogBtn.addEventListener('click', function() {
        currentDogData = { name: '', breed: '', customBreed: '', size: '' };
        resetDogForm();
        dogModal.classList.remove('hidden');
    });
    
    // Cancel dog button
    cancelDogBtn.addEventListener('click', function() {
        dogModal.classList.add('hidden');
    });
    
    // Dog name input
    const dogNameInput = document.getElementById('dog-name');
    const customBreedInput = document.getElementById('custom-breed-name');
    const customBreedDiv = document.getElementById('custom-breed-input');
    
    dogNameInput.addEventListener('input', function() {
        currentDogData.name = this.value;
        updateSaveButton();
    });
    
    // Custom breed input
    customBreedInput.addEventListener('input', function() {
        currentDogData.customBreed = this.value;
        updateSaveButton();
    });
    
    // Breed selection
    document.querySelectorAll('.breed-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.breed-option').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            currentDogData.breed = this.dataset.breed;
            
            // Show/hide custom breed input
            if (this.dataset.breed === 'mixed') {
                customBreedDiv.style.display = 'block';
                customBreedInput.focus();
            } else {
                customBreedDiv.style.display = 'none';
                currentDogData.customBreed = '';
            }
            
            updateSaveButton();
        });
    });
    
    // Size selection
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            currentDogData.size = this.dataset.size;
            updateSaveButton();
        });
    });
    
    // Save dog
    saveDogBtn.addEventListener('click', function() {
        const isValid = currentDogData.name && currentDogData.breed && currentDogData.size &&
                       (currentDogData.breed !== 'mixed' || currentDogData.customBreed);
        
        if (isValid) {
            dogs.push({...currentDogData});
            updateDogsDisplay();
            updateHeaderDogs();
            dogModal.classList.add('hidden');
            calculateRealTime();
            saveAppState();
        }
    });
    
    // Update save button state
    function updateSaveButton() {
        const isValid = currentDogData.name && currentDogData.breed && currentDogData.size &&
                       (currentDogData.breed !== 'mixed' || currentDogData.customBreed);
        saveDogBtn.disabled = !isValid;
    }
    
    // Reset dog form
    function resetDogForm() {
        dogNameInput.value = '';
        customBreedInput.value = '';
        customBreedDiv.style.display = 'none';
        document.querySelectorAll('.breed-option').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        saveDogBtn.disabled = true;
    }
    
    // Update dogs display
    function updateDogsDisplay() {
        dogsContainer.innerHTML = '';
        dogs.forEach((dog, index) => {
            const dogCard = document.createElement('div');
            dogCard.className = 'dog-card';
            
            const breedIcons = {
                'labrador': '🦮',
                'german-shepherd': '🐕‍🦺',
                'poodle': '🐩',
                'bulldog': '🐕',
                'chihuahua': '🐕',
                'mixed': '🐶'
            };
            
            const breedNames = {
                'labrador': 'Labrador',
                'german-shepherd': 'German Shepherd',
                'poodle': 'Poodle',
                'bulldog': 'Bulldog',
                'chihuahua': 'Chihuahua',
                'mixed': 'Other/Mixed'
            };
            
            const sizeNames = {
                'small': 'Small',
                'medium': 'Medium',
                'large': 'Large'
            };
            
            // Use custom breed name if available, otherwise use standard breed name
            const displayBreed = dog.breed === 'mixed' && dog.customBreed ? 
                                dog.customBreed : breedNames[dog.breed];
            
            dogCard.innerHTML = `
                <span class="dog-icon">${breedIcons[dog.breed] || '🐶'}</span>
                <div class="dog-info">
                    <div class="dog-name">${dog.name}</div>
                    <div class="dog-details">${displayBreed} • ${sizeNames[dog.size]}</div>
                </div>
                <button class="remove-dog" data-index="${index}">×</button>
            `;
            
            dogsContainer.appendChild(dogCard);
        });
        
        // Add remove dog listeners
        document.querySelectorAll('.remove-dog').forEach(btn => {
            btn.addEventListener('click', function() {
                dogs.splice(parseInt(this.dataset.index), 1);
                updateDogsDisplay();
                updateHeaderDogs();
                calculateRealTime();
                saveAppState();
            });
        });
    }
    
    // Real-time calculation
    function calculateRealTime() {
        if (dropoffInput.value && pickupInput.value && dogs.length > 0) {
            calculateCost(false);
        }
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateCost(true);
    });
    
    function calculatePricing(dropoff, pickup, numDogs = 1) {
        let daySessions = 0;
        let twentyFourHourSessions = 0;
        let extraHours = 0;
        let is24HourStay = false;
        
        // Calculate total duration in hours
        const totalHours = (pickup - dropoff) / (1000 * 60 * 60);
        
        // Check if it's a single 24-hour stay (between 23-25 hours for tolerance)
        if (totalHours >= 23 && totalHours <= 25) {
            is24HourStay = true;
            twentyFourHourSessions = 1;
        } else if (totalHours < 24) {
            // Same day or short stay - use day sessions + hourly
            const sameDay = dropoff.toDateString() === pickup.toDateString();
            
            if (sameDay) {
                const dropoffHour = dropoff.getHours();
                const pickupHour = pickup.getHours();
                
                // If dropoff is before or during day session and pickup is before/during day session
                if (dropoffHour < 17 && pickupHour < 17) {
                    daySessions = 1;
                }
                // If dropoff is before/during day session but pickup is after 5pm
                else if (dropoffHour < 17 && pickupHour >= 17) {
                    daySessions = 1;
                    // Calculate extra hours after 5pm
                    const fivePm = new Date(pickup);
                    fivePm.setHours(17, 0, 0, 0);
                    const hoursAfter5 = Math.ceil((pickup - fivePm) / (1000 * 60 * 60));
                    extraHours = hoursAfter5;
                }
                // If dropoff is after 5pm (same day, no overnight)
                else if (dropoffHour >= 17) {
                    const totalSameDayHours = Math.ceil((pickup - dropoff) / (1000 * 60 * 60));
                    extraHours = totalSameDayHours;
                }
            } else {
                // Cross-day but less than 24 hours - charge as hourly
                extraHours = Math.ceil(totalHours);
            }
        } else {
            // Multi-day stay - calculate as 24-hour periods + remaining time
            twentyFourHourSessions = Math.floor(totalHours / 24);
            const remainingHours = totalHours % 24;
            
            if (remainingHours > 0) {
                // Handle remaining time
                if (remainingHours >= 8) {
                    // If 8+ hours remaining, charge as day session + extra hours
                    daySessions = 1;
                    if (remainingHours > 8) {
                        extraHours = Math.ceil(remainingHours - 8);
                    }
                } else {
                    // Less than 8 hours, charge as hourly
                    extraHours = Math.ceil(remainingHours);
                }
            }
        }
        
        let baseDayCost, base24HourCost, baseHourlyCost;
        
        if (is24HourStay) {
            // 24-hour stay: flat rate of $45
            baseDayCost = 0;
            base24HourCost = 45;
            baseHourlyCost = 0;
        } else {
            // Calculate base costs for one dog
            baseDayCost = daySessions * 30;
            base24HourCost = twentyFourHourSessions * 45;
            baseHourlyCost = extraHours * 4;
        }
        
        // Apply multi-dog pricing: first dog at full price, each additional dog adds 25%
        const multiDogMultiplier = 1 + (numDogs - 1) * 0.25;
        
        let dayCost = Math.round(baseDayCost * multiDogMultiplier);
        let twentyFourHourCost = Math.round(base24HourCost * multiDogMultiplier);
        let hourlyCost = Math.round(baseHourlyCost * multiDogMultiplier);
        
        // Calculate multi-dog surcharge for display
        const baseCostBeforeSurcharge = baseDayCost + base24HourCost + baseHourlyCost;
        const totalCostAfterSurcharge = dayCost + twentyFourHourCost + hourlyCost;
        const multiDogSurcharge = numDogs > 1 ? totalCostAfterSurcharge - baseCostBeforeSurcharge : 0;
        
        let subtotal = dayCost + twentyFourHourCost + hourlyCost;
        
        // Apply new discount logic for 7+ day stays
        const totalDays = Math.ceil((pickup - dropoff) / (1000 * 60 * 60 * 24));
        let discount = 0;
        let finalTotal = subtotal;
        
        if (totalDays >= 7) {
            const baseSevenDayPrice = Math.round(300 * multiDogMultiplier);
            
            // Calculate what constitutes "base 7 days" (7 × 24-hour sessions = $315)
            const baseSevenDay24HourSessions = Math.min(7, twentyFourHourSessions);
            const baseSevenDayCost = baseSevenDay24HourSessions * 45; // 7 days at $45 each = $315
            const baseSevenDayWithMultiDog = Math.round(baseSevenDayCost * multiDogMultiplier);
            
            // Calculate additional costs beyond the base 7 days
            let additional24HourSessions = Math.max(0, twentyFourHourSessions - 7);
            let additionalDaySessions = daySessions;
            let additionalHours = extraHours;
            
            // Calculate additional costs
            const additional24HourCost = additional24HourSessions * 45;
            const additionalDayCost = additionalDaySessions * 30;
            const additionalHourCost = additionalHours * 4;
            const totalAdditionalBaseCost = additional24HourCost + additionalDayCost + additionalHourCost;
            const totalAdditionalCost = Math.round(totalAdditionalBaseCost * multiDogMultiplier);
            
            if (totalAdditionalCost > 0) {
                // Apply 20% discount to additional time only
                const discountedAdditionalCost = Math.round(totalAdditionalCost * 0.8);
                finalTotal = baseSevenDayPrice + discountedAdditionalCost;
                discount = subtotal - finalTotal;
            } else {
                // Exactly 7 days with no extra: use $300 flat rate
                finalTotal = baseSevenDayPrice;
                discount = subtotal - finalTotal;
            }
        }
        
        const total = finalTotal;
        
        return {
            daySessions,
            twentyFourHourSessions,
            extraHours,
            dayCost,
            twentyFourHourCost,
            hourlyCost,
            total,
            numDogs,
            discount,
            totalDays,
            multiDogSurcharge,
            baseCostBeforeSurcharge,
            is24HourStay
        };
    }
    
    function animatePrice(element, finalValue) {
        const startValue = 0;
        const duration = 500;
        const startTime = performance.now();
        
        element.classList.add('animating');
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            
            const currentValue = Math.round(startValue + (finalValue - startValue) * easeOutQuad);
            element.textContent = `$${currentValue}`;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            } else {
                element.classList.remove('animating');
            }
        }
        
        requestAnimationFrame(updateValue);
    }
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    // Print functionality
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            if (!resultsDiv.classList.contains('hidden')) {
                e.preventDefault();
                printReceipt();
            }
        }
    });
    
    function printReceipt() {
        // Make sure results are visible and calculated first
        if (dogs.length === 0) {
            alert('Please add dogs before printing.');
            return;
        }
        
        if (!dropoffInput.dataset.dateValue || !pickupInput.dataset.dateValue) {
            alert('Please select drop-off and pick-up times before printing.');
            return;
        }
        
        // Force calculation to ensure results are current
        calculateCost(false);
        
        // Build the print receipt content
        buildPrintReceipt();
        
        // Small delay to ensure DOM updates before printing
        setTimeout(() => {
            window.print();
        }, 100);
    }
    
    function buildPrintReceipt() {
        const printReceipt = document.getElementById('print-receipt');
        const receiptDate = document.getElementById('receipt-date');
        const receiptDogs = document.getElementById('receipt-dogs');
        const receiptSummary = document.getElementById('receipt-summary');
        const receiptBreakdown = document.getElementById('receipt-breakdown');
        const receiptTotal = document.getElementById('receipt-total');
        
        // Calculate pricing for the receipt
        const dropoffDate = new Date(dropoffInput.dataset.dateValue);
        const pickupDate = new Date(pickupInput.dataset.dateValue);
        const numDogs = dogs.length;
        const pricing = calculatePricing(dropoffDate, pickupDate, numDogs);
        
        // Set date
        const now = new Date();
        const printDate = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        receiptDate.textContent = printDate;
        
        // Build dogs section
        let dogsHtml = '<h3>🐕 Dogs in Care</h3>';
        dogs.forEach((dog, index) => {
            const breedIcons = {
                'labrador': '🦮',
                'german-shepherd': '🐕‍🦺',
                'poodle': '🐩',
                'bulldog': '🐕',
                'chihuahua': '🐕',
                'mixed': '🐶'
            };
            
            const displayBreed = dog.breed === 'mixed' && dog.customBreed ? 
                                dog.customBreed : 
                                dog.breed.charAt(0).toUpperCase() + dog.breed.slice(1).replace('-', ' ');
            
            dogsHtml += `
                <div class="receipt-dog">
                    <span class="dog-icon">${breedIcons[dog.breed] || '🐶'}</span>
                    <div class="dog-info">
                        <div class="dog-name">${dog.name}</div>
                        <div class="dog-details">${displayBreed} • ${dog.size.charAt(0).toUpperCase() + dog.size.slice(1)}</div>
                    </div>
                </div>
            `;
        });
        receiptDogs.innerHTML = dogsHtml;
        
        // Build summary section
        const dropoffDateFormatted = dropoffDate.toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric', 
            hour: 'numeric', minute: '2-digit' 
        });
        const pickupDateFormatted = pickupDate.toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric', 
            hour: 'numeric', minute: '2-digit' 
        });
        const summaryHtml = `
            <h3>📅 Service Period</h3>
            <div class="summary-item">
                <span>Drop-off:</span>
                <span>${dropoffDateFormatted}</span>
            </div>
            <div class="summary-item">
                <span>Pick-up:</span>
                <span>${pickupDateFormatted}</span>
            </div>
        `;
        receiptSummary.innerHTML = summaryHtml;
        
        // Build breakdown section
        const daySessions = pricing.daySessions;
        const twentyFourHourSessions = pricing.twentyFourHourSessions;
        const extraHours = pricing.extraHours;
        const numDogsDisplay = dogs.length;
        
        let breakdownHtml = `
            <h3>💰 Pricing Breakdown</h3>
            <div class="breakdown-item">
                <span>🐕 Number of Dogs:</span>
                <span>${numDogsDisplay}</span>
            </div>
        `;
        
        // Add divider after number of dogs
        breakdownHtml += `<div class="breakdown-divider"></div>`;
        
        let hasLineItems = false;
        
        // Show day sessions line item if applicable
        if (daySessions > 0) {
            const dayCostPerDog = pricing.dayCost / numDogsDisplay;
            breakdownHtml += `
                <div class="breakdown-item cost-line">
                    <span>☀️ Day Sessions (9am-5pm):</span>
                    <span>${daySessions} × $30 = $${dayCostPerDog}</span>
                </div>
            `;
            hasLineItems = true;
        }
        
        // Show 24-hour sessions line item if applicable
        if (twentyFourHourSessions > 0) {
            const twentyFourHourCostPerDog = pricing.twentyFourHourCost / numDogsDisplay;
            if (pricing.is24HourStay) {
                breakdownHtml += `
                    <div class="breakdown-item cost-line">
                        <span>🕐 24-Hour Stay:</span>
                        <span>1 × $45 = $${pricing.total / numDogsDisplay}</span>
                    </div>
                `;
            } else {
                breakdownHtml += `
                    <div class="breakdown-item cost-line">
                        <span>🕐 24-Hour Sessions:</span>
                        <span>${twentyFourHourSessions} × $45 = $${twentyFourHourCostPerDog}</span>
                    </div>
                `;
            }
            hasLineItems = true;
        }
        
        // Show extra hours line item if applicable
        if (extraHours > 0) {
            const hourlyCostPerDog = pricing.hourlyCost / numDogsDisplay;
            breakdownHtml += `
                <div class="breakdown-item cost-line">
                    <span>⏰ Extra Hours:</span>
                    <span>${extraHours} × $4 = $${hourlyCostPerDog}</span>
                </div>
            `;
            hasLineItems = true;
        }
        
        // Show base cost subtotal if multiple items or multi-dog
        if ((hasLineItems && numDogsDisplay > 1) || (daySessions > 0 && twentyFourHourSessions > 0) || (daySessions > 0 && extraHours > 0) || (twentyFourHourSessions > 0 && extraHours > 0)) {
            breakdownHtml += `
                <div class="breakdown-item subtotal-line">
                    <span>Base Cost (per dog):</span>
                    <span>$${pricing.baseCostBeforeSurcharge}</span>
                </div>
            `;
        }
        
        // Add multi-dog surcharge if applicable
        if (pricing.multiDogSurcharge > 0) {
            breakdownHtml += `
                <div class="breakdown-item cost-line multi-dog">
                    <span>🐕🐕 Multi-Dog Surcharge (25% per additional dog):</span>
                    <span>+$${pricing.multiDogSurcharge}</span>
                </div>
            `;
        }
        
        // Add discount section if applicable
        if (pricing.discount > 0) {
            const subtotalAmount = pricing.dayCost + pricing.twentyFourHourCost + pricing.hourlyCost;
            
            breakdownHtml += `<div class="breakdown-divider"></div>`;
            
            breakdownHtml += `
                <div class="breakdown-item subtotal-line">
                    <span>Subtotal:</span>
                    <span>$${subtotalAmount}</span>
                </div>
            `;
            
            // Set appropriate discount label
            let discountLabel = '🎉 Discount:';
            if (pricing.totalDays >= 7) {
                if (pricing.totalDays === 7) {
                    discountLabel = '🎉 7-Day Special Rate:';
                } else {
                    discountLabel = '🎉 Extended Stay Discount:';
                }
            }
            
            breakdownHtml += `
                <div class="breakdown-item discount-line">
                    <span>${discountLabel}</span>
                    <span>-$${pricing.discount}</span>
                </div>
            `;
        }
        
        receiptBreakdown.innerHTML = breakdownHtml;
        
        // Build total section
        const totalCost = document.getElementById('total-cost').textContent;
        receiptTotal.innerHTML = `
            <div class="total-amount">
                <span>Total Cost:</span>
                <span>${totalCost}</span>
            </div>
        `;
    }
    
    // Add print button to results
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '🖨️ Print Receipt';
    printBtn.className = 'calculate-btn';
    printBtn.style.marginTop = '1rem';
    printBtn.onclick = printReceipt;
    
    resultsDiv.appendChild(printBtn);
    
    // Calendar and data management functionality
    const saveCalendarBtn = document.getElementById('save-calendar-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    
    // Save to calendar functionality
    saveCalendarBtn.addEventListener('click', function() {
        if (!dropoffInput.dataset.dateValue || !pickupInput.dataset.dateValue || dogs.length === 0) {
            alert('Please add dogs and select drop-off/pick-up times before saving to calendar.');
            return;
        }
        
        generateCalendarEvent();
    });
    
    // Confirmation modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    let confirmCallback = null;

    // Custom confirm function
    function showConfirm(message, callback) {
        confirmMessage.textContent = message;
        confirmCallback = callback;
        confirmModal.classList.remove('hidden');
    }

    // Confirm modal event listeners
    confirmCancelBtn.addEventListener('click', function() {
        confirmModal.classList.add('hidden');
        confirmCallback = null;
    });

    confirmYesBtn.addEventListener('click', function() {
        confirmModal.classList.add('hidden');
        if (confirmCallback) {
            confirmCallback();
            confirmCallback = null;
        }
    });

    // Close modal when clicking outside
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.classList.add('hidden');
            confirmCallback = null;
        }
    });

    // Clear all data functionality
    clearDataBtn.addEventListener('click', function() {
        showConfirm('Are you sure you want to clear all data? This will remove all dogs and reset the calculator.', function() {
            dogs = [];
            dropoffInput.value = '';
            dropoffInput.dataset.dateValue = '';
            pickupInput.value = '';
            pickupInput.dataset.dateValue = '';
            updateDogsDisplay();
            updateHeaderDogs();
            resultsDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');
            clearAppState();
            
            // Reset to default values
            const now = new Date();
            now.setHours(9, 0, 0, 0);
            dropoffInput.value = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            dropoffInput.dataset.dateValue = now.toISOString();
            
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            pickupInput.value = tomorrow.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            pickupInput.dataset.dateValue = tomorrow.toISOString();
        });
    });
    
    // Generate .ics calendar event file
    function generateCalendarEvent() {
        const dropoffDate = new Date(dropoffInput.dataset.dateValue);
        const pickupDate = new Date(pickupInput.dataset.dateValue);
        
        // Format dates for .ics format (YYYYMMDDTHHMMSSZ)
        function formatICSDate(date) {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
        
        // Create dog list for description
        const dogList = dogs.map(dog => {
            const displayBreed = dog.breed === 'mixed' && dog.customBreed ? 
                                dog.customBreed : 
                                dog.breed.charAt(0).toUpperCase() + dog.breed.slice(1).replace('-', ' ');
            return `${dog.name} (${displayBreed}, ${dog.size.charAt(0).toUpperCase() + dog.size.slice(1)})`;
        }).join('\\n');
        
        // Get pricing info
        const pricing = calculatePricing(dropoffDate, pickupDate, dogs.length);
        
        // Create .ics content
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dog Sitting At Danni's House//Calculator//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@dogsittingdannis.com
DTSTART:${formatICSDate(dropoffDate)}
DTEND:${formatICSDate(pickupDate)}
SUMMARY:Dog Sitting at Danni's House - ${dogs.map(d => d.name).join(', ')}
DESCRIPTION:Dog Sitting Service\\n\\nDogs in care:\\n${dogList}\\n\\nService Details:\\n• Drop-off: ${dropoffDate.toLocaleString()}\\n• Pick-up: ${pickupDate.toLocaleString()}\\n• Total Cost: $${pricing.total}\\n\\nBreakdown:\\n${pricing.daySessions > 0 ? `• Day Sessions: ${pricing.daySessions}\\n` : ''}${pricing.overnightSessions > 0 ? `• Overnight Stays: ${pricing.overnightSessions}\\n` : ''}${pricing.extraHours > 0 ? `• Extra Hours: ${pricing.extraHours}\\n` : ''}\\nYour furry friends are in great hands!
LOCATION:Danni's House
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Dog drop-off in 1 hour
END:VALARM
BEGIN:VALARM
TRIGGER:PT1H
ACTION:DISPLAY
DESCRIPTION:Dog pick-up in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;
        
        // Create blob and download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dog-sitting-${dogs.map(d => d.name.toLowerCase()).join('-')}-${dropoffDate.getFullYear()}-${(dropoffDate.getMonth() + 1).toString().padStart(2, '0')}-${dropoffDate.getDate().toString().padStart(2, '0')}.ics`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        // Show success message
        const originalText = saveCalendarBtn.innerHTML;
        saveCalendarBtn.innerHTML = '✅ Saved!';
        saveCalendarBtn.disabled = true;
        setTimeout(() => {
            saveCalendarBtn.innerHTML = originalText;
            saveCalendarBtn.disabled = false;
        }, 2000);
    }
    
    // Date/Time picker functions
    function openDatetimePicker(input) {
        currentDatetimeInput = input;
        const existingValue = input.dataset.dateValue;
        
        if (existingValue) {
            selectedDate = new Date(existingValue);
            currentMonth = selectedDate.getMonth();
            currentYear = selectedDate.getFullYear();
            
            // Set time controls from existing value
            let hour = selectedDate.getHours();
            const minute = selectedDate.getMinutes();
            let ampm = 'AM';
            
            if (hour === 0) {
                hour = 12;
            } else if (hour === 12) {
                ampm = 'PM';
            } else if (hour > 12) {
                hour -= 12;
                ampm = 'PM';
            }
            
            timeHourSelect.value = hour;
            timeMinuteSelect.value = minute.toString().padStart(2, '0');
            timeAmpmSelect.value = ampm;
        } else {
            selectedDate = null;
            currentMonth = new Date().getMonth();
            currentYear = new Date().getFullYear();
            
            // Reset to default time (9:00 AM)
            timeHourSelect.value = '9';
            timeMinuteSelect.value = '00';
            timeAmpmSelect.value = 'AM';
        }
        
        renderCalendar();
        updateDatetimePreview();
        datetimeModal.classList.remove('hidden');
    }
    
    function renderCalendar() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        calendarMonth.textContent = monthNames[currentMonth];
        calendarYear.textContent = currentYear;
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        
        calendarDays.innerHTML = '';
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayEl = createDayElement(day, true);
            calendarDays.appendChild(dayEl);
        }
        
        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = createDayElement(day, false);
            
            // Check if this is today
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            // Check if this is selected
            if (selectedDate && 
                currentYear === selectedDate.getFullYear() && 
                currentMonth === selectedDate.getMonth() && 
                day === selectedDate.getDate()) {
                dayEl.classList.add('selected');
            }
            
            calendarDays.appendChild(dayEl);
        }
        
        // Next month days
        const remainingDays = 42 - calendarDays.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            const dayEl = createDayElement(day, true);
            calendarDays.appendChild(dayEl);
        }
    }
    
    function createDayElement(day, otherMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if (otherMonth) dayEl.classList.add('other-month');
        dayEl.textContent = day;
        
        dayEl.addEventListener('click', function() {
            if (!otherMonth) {
                selectedDate = new Date(currentYear, currentMonth, day);
                if (selectedDate.getHours() === 0) {
                    selectedDate.setHours(9);
                }
                renderCalendar();
                updateDatetimePreview();
            }
        });
        
        return dayEl;
    }
    
    function updateDatetimePreview() {
        if (selectedDate) {
            let hour = parseInt(timeHourSelect.value);
            const minute = parseInt(timeMinuteSelect.value);
            const ampm = timeAmpmSelect.value;
            
            // Convert to 24-hour format
            if (ampm === 'PM' && hour !== 12) {
                hour += 12;
            } else if (ampm === 'AM' && hour === 12) {
                hour = 0;
            }
            
            selectedDate.setHours(hour, minute);
            
            const options = { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            };
            datetimePreviewText.textContent = selectedDate.toLocaleString('en-US', options);
            saveDatetimeBtn.disabled = false;
        } else {
            datetimePreviewText.textContent = 'No date selected';
            saveDatetimeBtn.disabled = true;
        }
    }
    
    // Calendar navigation
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Time selection
    timeHourSelect.addEventListener('change', updateDatetimePreview);
    timeMinuteSelect.addEventListener('change', updateDatetimePreview);
    timeAmpmSelect.addEventListener('change', updateDatetimePreview);
    
    // Quick time buttons
    quickTimeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeHourSelect.value = this.dataset.hour;
            timeMinuteSelect.value = this.dataset.minute;
            timeAmpmSelect.value = this.dataset.ampm;
            updateDatetimePreview();
        });
    });
    
    // Save datetime
    saveDatetimeBtn.addEventListener('click', function() {
        if (selectedDate && currentDatetimeInput) {
            const formattedDate = selectedDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            
            currentDatetimeInput.value = formattedDate;
            currentDatetimeInput.dataset.dateValue = selectedDate.toISOString();
            datetimeModal.classList.add('hidden');
            calculateRealTime();
            saveAppState();
        }
    });
    
    // Cancel datetime
    cancelDatetimeBtn.addEventListener('click', function() {
        datetimeModal.classList.add('hidden');
    });
    
    // Add click handlers to date inputs
    dropoffInput.addEventListener('click', function() {
        openDatetimePicker(this);
    });
    
    pickupInput.addEventListener('click', function() {
        openDatetimePicker(this);
    });
    
    // Update calculateCost to use dataset values
    function calculateCost(showAnimation = false) {
        const dropoffValue = dropoffInput.dataset.dateValue;
        const pickupValue = pickupInput.dataset.dateValue;
        
        if (!dropoffValue || !pickupValue) {
            if (showAnimation) showError('Please select both drop-off and pick-up times.');
            return;
        }
        
        const dropoffDate = new Date(dropoffValue);
        const pickupDate = new Date(pickupValue);
        const numDogs = dogs.length;
        
        errorDiv.classList.add('hidden');
        
        if (numDogs === 0) {
            if (showAnimation) showError('Please add at least one dog.');
            return;
        }
        
        if (pickupDate <= dropoffDate) {
            if (showAnimation) showError('Pick-up time must be after drop-off time.');
            return;
        }
        
        const pricing = calculatePricing(dropoffDate, pickupDate, numDogs);
        
        // Update number of dogs display
        document.getElementById('num-dogs-display').textContent = numDogs;
        
        // Get all the line item elements
        const daySessionsRow = document.getElementById('day-sessions-row');
        const twentyFourHourRow = document.getElementById('twenty-four-hour-row');
        const extraHoursRow = document.getElementById('extra-hours-row');
        const baseSubtotalRow = document.getElementById('base-subtotal-row');
        const multiDogRow = document.getElementById('multi-dog-row');
        const subtotalRow = document.getElementById('subtotal-row');
        const discountRow = document.getElementById('discount-row');
        const discountDivider = document.getElementById('discount-divider');
        
        // Reset all displays
        daySessionsRow.style.display = 'none';
        twentyFourHourRow.style.display = 'none';
        extraHoursRow.style.display = 'none';
        baseSubtotalRow.style.display = 'none';
        
        let hasLineItems = false;
        
        // Show day sessions if applicable
        if (pricing.daySessions > 0) {
            document.getElementById('day-sessions-count').textContent = pricing.daySessions;
            document.getElementById('day-sessions-cost').textContent = `$${pricing.dayCost / numDogs}`;
            daySessionsRow.style.display = 'flex';
            hasLineItems = true;
        }
        
        // Show 24-hour sessions if applicable  
        if (pricing.twentyFourHourSessions > 0) {
            document.getElementById('twenty-four-hour-count').textContent = pricing.twentyFourHourSessions;
            document.getElementById('twenty-four-hour-cost').textContent = `$${pricing.twentyFourHourCost / numDogs}`;
            twentyFourHourRow.style.display = 'flex';
            hasLineItems = true;
        }
        
        // Show extra hours if applicable
        if (pricing.extraHours > 0) {
            document.getElementById('extra-hours-count').textContent = pricing.extraHours;
            document.getElementById('extra-hours-cost').textContent = `$${pricing.hourlyCost / numDogs}`;
            extraHoursRow.style.display = 'flex';
            hasLineItems = true;
        }
        
        // Show base cost subtotal if there are multiple line items or multi-dog scenario
        if ((hasLineItems && numDogs > 1) || (pricing.daySessions > 0 && pricing.twentyFourHourSessions > 0) || (pricing.daySessions > 0 && pricing.extraHours > 0) || (pricing.twentyFourHourSessions > 0 && pricing.extraHours > 0)) {
            const baseCostPerDog = pricing.baseCostBeforeSurcharge;
            document.getElementById('base-subtotal').textContent = `$${baseCostPerDog}`;
            baseSubtotalRow.style.display = 'flex';
        }
        
        // Show multi-dog surcharge if applicable
        if (pricing.multiDogSurcharge > 0) {
            document.getElementById('multi-dog-surcharge').textContent = `$${pricing.multiDogSurcharge}`;
            multiDogRow.style.display = 'flex';
        } else {
            multiDogRow.style.display = 'none';
        }
        
        // Show subtotal and discount sections if there's a discount
        if (pricing.discount > 0) {
            const subtotalAmount = pricing.dayCost + pricing.twentyFourHourCost + pricing.hourlyCost;
            document.getElementById('subtotal').textContent = `$${subtotalAmount}`;
            document.getElementById('discount-amount').textContent = `$${pricing.discount}`;
            
            // Set appropriate discount label
            const discountLabel = document.getElementById('discount-label');
            if (pricing.totalDays >= 7) {
                if (pricing.totalDays === 7) {
                    discountLabel.textContent = '🎉 7-Day Special Rate:';
                } else {
                    discountLabel.textContent = '🎉 Extended Stay Discount:';
                }
            } else {
                discountLabel.textContent = '🎉 Discount:';
            }
            
            subtotalRow.style.display = 'flex';
            discountRow.style.display = 'flex';
            discountDivider.style.display = 'block';
        } else {
            subtotalRow.style.display = 'none';
            discountRow.style.display = 'none';
            discountDivider.style.display = 'none';
        }
        
        // Handle special case for single 24-hour stays
        if (pricing.is24HourStay) {
            // Hide other items and show only the 24-hour session
            daySessionsRow.style.display = 'none';
            extraHoursRow.style.display = 'none';
            baseSubtotalRow.style.display = 'none';
            
            // Update 24-hour display for single stays
            document.getElementById('twenty-four-hour-count').textContent = '1';
            document.getElementById('twenty-four-hour-cost').textContent = `$${pricing.total / numDogs}`;
            twentyFourHourRow.style.display = 'flex';
            
            // Update label for clarity
            twentyFourHourRow.querySelector('.label').textContent = '🕐 24-Hour Stay:';
        } else if (pricing.twentyFourHourSessions > 0) {
            // Reset label for multi-day stays
            twentyFourHourRow.querySelector('.label').textContent = '🕐 24-Hour Sessions:';
        }
        
        // Animate price if requested
        if (showAnimation) {
            animatePrice(document.getElementById('total-cost'), pricing.total);
        } else {
            document.getElementById('total-cost').textContent = `$${pricing.total}`;
        }
        
        resultsDiv.classList.remove('hidden');
    }
    
    // Load saved state or set default datetime values
    loadAppState();
    
    // Set default datetime values only if not loaded from state
    if (!dropoffInput.value || !pickupInput.value) {
        const now = new Date();
        now.setHours(9, 0, 0, 0);
        
        if (!dropoffInput.value) {
            dropoffInput.value = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            dropoffInput.dataset.dateValue = now.toISOString();
        }
        
        if (!pickupInput.value) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            pickupInput.value = tomorrow.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            pickupInput.dataset.dateValue = tomorrow.toISOString();
        }
    }
});
