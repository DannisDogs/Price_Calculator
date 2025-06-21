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
        let overnightSessions = 0;
        let extraHours = 0;
        
        // Check if it's a same-day pickup
        const sameDay = dropoff.toDateString() === pickup.toDateString();
        
        if (sameDay) {
            const dropoffHour = dropoff.getHours();
            const pickupHour = pickup.getHours();
            const pickupMinutes = pickup.getMinutes();
            
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
                const totalHours = Math.ceil((pickup - dropoff) / (1000 * 60 * 60));
                extraHours = totalHours;
            }
        } else {
            // Multi-day stay - count overnight sessions and handle final day
            const dropoffDate = new Date(dropoff.getFullYear(), dropoff.getMonth(), dropoff.getDate());
            const pickupDate = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate());
            
            // Count the number of nights
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const nightsStaying = Math.ceil((pickupDate - dropoffDate) / millisecondsPerDay);
            overnightSessions = nightsStaying;
            
            // Handle final day pickup - only charge extra if pickup is after 9am
            const finalDay9am = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate(), 9, 0, 0);
            const finalDay5pm = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate(), 17, 0, 0);
            
            if (pickup > finalDay9am) {
                const hoursAfter9am = Math.ceil((pickup - finalDay9am) / (1000 * 60 * 60));
                
                // If staying 8+ hours after 9am (until 5pm or later), charge day rate
                if (hoursAfter9am >= 8) {
                    daySessions = 1;
                    // If pickup is after 5pm, also charge hourly for time after 5pm
                    if (pickup > finalDay5pm) {
                        const hoursAfter5pm = Math.ceil((pickup - finalDay5pm) / (1000 * 60 * 60));
                        extraHours = hoursAfter5pm;
                    }
                } else {
                    // If staying less than 8 hours after 9am, just charge hourly
                    extraHours = hoursAfter9am;
                }
            }
        }
        
        // Calculate base costs for one dog
        const baseDayCost = daySessions * 35;
        const baseOvernightCost = overnightSessions * 50;
        const baseHourlyCost = extraHours * 4;
        
        // Apply multi-dog pricing: first dog at full price, each additional dog adds 25%
        const multiDogMultiplier = 1 + (numDogs - 1) * 0.25;
        
        let dayCost = Math.round(baseDayCost * multiDogMultiplier);
        let overnightCost = Math.round(baseOvernightCost * multiDogMultiplier);
        let hourlyCost = Math.round(baseHourlyCost * multiDogMultiplier);
        
        // Calculate multi-dog surcharge for display
        const baseCostBeforeSurcharge = baseDayCost + baseOvernightCost + baseHourlyCost;
        const totalCostAfterSurcharge = dayCost + overnightCost + hourlyCost;
        const multiDogSurcharge = numDogs > 1 ? totalCostAfterSurcharge - baseCostBeforeSurcharge : 0;
        
        let subtotal = dayCost + overnightCost + hourlyCost;
        
        // Apply weekly discount (10% off for 7+ days)
        const totalDays = Math.ceil((pickup - dropoff) / (1000 * 60 * 60 * 24));
        let discount = 0;
        if (totalDays >= 7) {
            discount = Math.round(subtotal * 0.1);
        }
        
        const total = subtotal - discount;
        
        return {
            daySessions,
            overnightSessions,
            extraHours,
            dayCost,
            overnightCost,
            hourlyCost,
            total,
            numDogs,
            discount,
            totalDays,
            multiDogSurcharge,
            baseCostBeforeSurcharge
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
        const dropoffDate = new Date(dropoffInput.dataset.dateValue);
        const pickupDate = new Date(pickupInput.dataset.dateValue);
        const summaryHtml = `
            <h3>📅 Service Period</h3>
            <div class="summary-item">
                <span>Drop-off:</span>
                <span>${dropoffDate.toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit' 
                })}</span>
            </div>
            <div class="summary-item">
                <span>Pick-up:</span>
                <span>${pickupDate.toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit' 
                })}</span>
            </div>
        `;
        receiptSummary.innerHTML = summaryHtml;
        
        // Build breakdown section
        const daySessions = parseInt(document.getElementById('day-count').textContent);
        const nightSessions = parseInt(document.getElementById('night-count').textContent);
        const extraHours = parseInt(document.getElementById('hourly-count').textContent);
        const numDogsDisplay = document.getElementById('num-dogs-display').textContent;
        
        let breakdownHtml = `
            <h3>💰 Pricing Breakdown</h3>
            <div class="breakdown-item">
                <span>Number of Dogs:</span>
                <span>${numDogsDisplay}</span>
            </div>
        `;
        
        // Only show sessions/hours that apply
        if (daySessions > 0) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span>☀️ Daytime Sessions (9am-5pm):</span>
                    <span>${daySessions}</span>
                </div>
            `;
        }
        
        if (nightSessions > 0) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span>🌙 Overnight Stays (5pm-9am):</span>
                    <span>${nightSessions}</span>
                </div>
            `;
        }
        
        if (extraHours > 0) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span>⏰ Extra Hours:</span>
                    <span>${extraHours}</span>
                </div>
            `;
        }
        
        breakdownHtml += `<div class="breakdown-divider"></div>`;
        
        // Only show rates that apply
        if (daySessions > 0) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span>Day Rate (per dog):</span>
                    <span>$35 per session</span>
                </div>
            `;
        }
        
        if (nightSessions > 0) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span>Overnight Rate (per dog):</span>
                    <span>$50 per night</span>
                </div>
            `;
        }
        
        // Always show hourly rate so customers can see the cost
        breakdownHtml += `
            <div class="breakdown-item">
                <span>Hourly Rate (per dog):</span>
                <span>$4 per hour</span>
            </div>
        `;
        
        // Add multi-dog surcharge if applicable
        const multiDogSurchargeDisplay = document.getElementById('multi-dog-surcharge').textContent;
        if (numDogsDisplay > 1 && multiDogSurchargeDisplay !== '+$0') {
            breakdownHtml += `
                <div class="breakdown-divider"></div>
                <div class="breakdown-item multi-dog">
                    <span>🐕🐕 Multi-Dog Surcharge (25% per additional dog):</span>
                    <span>${multiDogSurchargeDisplay}</span>
                </div>
            `;
        }
        
        // Add discount if applicable
        const discountRow = document.getElementById('discount-row');
        if (discountRow && discountRow.style.display !== 'none') {
            const subtotal = document.getElementById('subtotal').textContent;
            const discount = document.getElementById('discount-amount').textContent;
            breakdownHtml += `
                <div class="breakdown-divider"></div>
                <div class="breakdown-item">
                    <span>Subtotal:</span>
                    <span>${subtotal}</span>
                </div>
                <div class="breakdown-item discount">
                    <span>🎉 Weekly Stay Discount (10%):</span>
                    <span>${discount}</span>
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
        
        // Update display
        document.getElementById('num-dogs-display').textContent = numDogs;
        document.getElementById('day-count').textContent = pricing.daySessions;
        document.getElementById('night-count').textContent = pricing.overnightSessions;
        document.getElementById('hourly-count').textContent = pricing.extraHours;
        
        // Show/hide breakdown items based on what applies
        const daySessionsRow = document.getElementById('day-sessions-row');
        const nightSessionsRow = document.getElementById('night-sessions-row');
        const extraHoursRow = document.getElementById('extra-hours-row');
        const dayRateRow = document.getElementById('day-rate-row');
        const nightRateRow = document.getElementById('night-rate-row');
        
        // Only show sessions/hours that apply
        daySessionsRow.style.display = pricing.daySessions > 0 ? 'flex' : 'none';
        nightSessionsRow.style.display = pricing.overnightSessions > 0 ? 'flex' : 'none';
        extraHoursRow.style.display = pricing.extraHours > 0 ? 'flex' : 'none';
        
        // Only show rates that apply (hourly rate always shown)
        dayRateRow.style.display = pricing.daySessions > 0 ? 'flex' : 'none';
        nightRateRow.style.display = pricing.overnightSessions > 0 ? 'flex' : 'none';
        
        // Show/hide multi-dog surcharge
        const multiDogRow = document.getElementById('multi-dog-row');
        const multiDogSurchargeEl = document.getElementById('multi-dog-surcharge');
        
        if (pricing.multiDogSurcharge > 0) {
            multiDogRow.style.display = 'flex';
            multiDogSurchargeEl.textContent = `+$${pricing.multiDogSurcharge}`;
        } else {
            multiDogRow.style.display = 'none';
        }
        
        // Show/hide discount rows
        const subtotalRow = document.getElementById('subtotal-row');
        const discountRow = document.getElementById('discount-row');
        const subtotalEl = document.getElementById('subtotal');
        const discountEl = document.getElementById('discount-amount');
        
        if (pricing.discount > 0) {
            subtotalRow.style.display = 'flex';
            discountRow.style.display = 'flex';
            subtotalEl.textContent = `$${pricing.dayCost + pricing.overnightCost + pricing.hourlyCost}`;
            discountEl.textContent = `-$${pricing.discount}`;
        } else {
            subtotalRow.style.display = 'none';
            discountRow.style.display = 'none';
        }
        
        // Animate price if requested
        if (showAnimation) {
            animatePrice(document.getElementById('total-cost'), pricing.total);
        } else {
            document.getElementById('total-cost').textContent = `$${pricing.total}`;
        }
        
        resultsDiv.classList.remove('hidden');
    }
    
    // Real-time calculation update
    function calculateRealTime() {
        if (dropoffInput.dataset.dateValue && pickupInput.dataset.dateValue && dogs.length > 0) {
            calculateCost(false);
        }
    }
    
    // Remove old calculateCost function (lines 162-216) since we replaced it above
    
    // Set default datetime values
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