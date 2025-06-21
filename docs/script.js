document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculator-form');
    const dropoffInput = document.getElementById('dropoff-date');
    const pickupInput = document.getElementById('pickup-date');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateCost();
    });
    
    function calculateCost() {
        const dropoffDate = new Date(dropoffInput.value);
        const pickupDate = new Date(pickupInput.value);
        
        errorDiv.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        
        if (!dropoffInput.value || !pickupInput.value) {
            showError('Please select both drop-off and pick-up times.');
            return;
        }
        
        if (pickupDate <= dropoffDate) {
            showError('Pick-up time must be after drop-off time.');
            return;
        }
        
        const pricing = calculatePricing(dropoffDate, pickupDate);
        
        document.getElementById('day-count').textContent = pricing.daySessions;
        document.getElementById('night-count').textContent = pricing.overnightSessions;
        document.getElementById('hourly-count').textContent = pricing.extraHours;
        document.getElementById('total-cost').textContent = `$${pricing.total}`;
        
        resultsDiv.classList.remove('hidden');
    }
    
    function calculatePricing(dropoff, pickup) {
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
            // Multi-day stay
            let current = new Date(dropoff);
            
            while (current < pickup) {
                const year = current.getFullYear();
                const month = current.getMonth();
                const date = current.getDate();
                
                const dayStart = new Date(year, month, date, 9, 0, 0);
                const dayEnd = new Date(year, month, date, 17, 0, 0);
                const nextDayStart = new Date(year, month, date + 1, 9, 0, 0);
                
                // Handle first day
                if (current.toDateString() === dropoff.toDateString()) {
                    if (current < dayEnd) {
                        daySessions++;
                        current = dayEnd;
                    }
                    // Always charge overnight if staying past midnight
                    overnightSessions++;
                    current = nextDayStart;
                }
                // Handle middle days
                else if (current.toDateString() !== pickup.toDateString()) {
                    daySessions++;
                    overnightSessions++;
                    current = new Date(year, month, date + 1, 9, 0, 0);
                }
                // Handle last day
                else {
                    if (pickup.getHours() >= 9) {
                        const hoursAfter9am = Math.ceil((pickup - dayStart) / (1000 * 60 * 60));
                        extraHours = hoursAfter9am;
                    }
                    break;
                }
            }
        }
        
        const dayCost = daySessions * 35;
        const overnightCost = overnightSessions * 50;
        const hourlyCost = extraHours * 4;
        const total = dayCost + overnightCost + hourlyCost;
        
        return {
            daySessions,
            overnightSessions,
            extraHours,
            dayCost,
            overnightCost,
            hourlyCost,
            total
        };
    }
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dropoffInput.value = now.toISOString().slice(0, 16);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    pickupInput.value = tomorrow.toISOString().slice(0, 16);
});
