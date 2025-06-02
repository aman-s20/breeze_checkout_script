(function () {
    // Ensure the script runs only once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBreezeCheckoutScript);
    } else {
        initBreezeCheckoutScript(); // DOM already loaded
    }

    function initBreezeCheckoutScript() {
        console.log('[Breeze] DOMContentLoaded or DOM already ready.');

        const form = document.querySelector('#litecheckout_payments_form');
        const paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');

        if (!form) {
            console.error('[Breeze] Form not found: #litecheckout_payments_form');
            return;
        }
        if (!paymentMethodsContainer) {
            console.error('[Breeze] Payment methods container not found: .litecheckout__payment-methods');
            return;
        }

        let isBreezeSelected = false;
        const breezePaymentId = 'YOUR_BREEZE_PAYMENT_ID_HERE'; // Replace this with actual ID

        const validators = {
            email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            b_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
            s_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
            b_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
            s_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
            phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
        };

        function isFormValid() {
            console.log('[Breeze] Validating form...');
            let isValid = true;

            form.querySelectorAll('[data-ca-lite-checkout-field]').forEach(field => {
                const value = field.value.trim();
                const fieldName = field.dataset.caLiteCheckoutField?.split('.').pop() || '';
                const label = field.labels?.[0]?.innerText || field.name || 'Field';
                const isRequired = field.labels?.[0]?.classList.contains('cm-required');

                console.log(`[Breeze] Checking: ${label} (required: ${isRequired}, value: "${value}")`);

                if (isRequired && !value) {
                    console.warn(`[Breeze] Validation failed - "${label}" is required.`);
                    isValid = false;
                    return;
                }

                if (value && validators[fieldName] && !validators[fieldName](value)) {
                    console.warn(`[Breeze] Validation failed - "${label}" does not pass ${fieldName} validation.`);
                    isValid = false;
                    return;
                }
            });

            return isValid;
        }

        function handleBreezePayment(event) {
            console.log('[Breeze] Breeze payment handler triggered');
            event.preventDefault();
            event.stopPropagation();

            if (!isFormValid()) {
                console.warn('[Breeze] Form invalid - stopping checkout');
                if (typeof $?.ceNotification === 'function') {
                    $.ceNotification('show', {
                        type: 'E',
                        title: 'Error',
                        message: 'Please fill all required fields correctly before placing order.'
                    });
                } else {
                    alert('Please fill all required fields correctly before placing order.');
                }
                return false;
            }

            console.log('[Breeze] Form valid - proceeding to Breeze checkout');
            if (window.breeze?.startCheckout) {
                window.breeze.startCheckout();
            } else {
                console.error('[Breeze] breeze.startCheckout is not defined');
            }
        }

        function handlePaymentMethodChange() {
            const selected = document.querySelector('input[name="selected_payment_method"]:checked');
            if (!selected) {
                console.warn('[Breeze] No payment method selected yet.');
                return;
            }

            isBreezeSelected = selected.value === breezePaymentId;
            console.log(`[Breeze] Selected payment method: ${selected.value}, Breeze: ${isBreezeSelected}`);

            if (isBreezeSelected) {
                paymentMethodsContainer.onsubmit = handleBreezePayment;
            } else {
                paymentMethodsContainer.onsubmit = null;
            }
        }

        // Initial trigger
        handlePaymentMethodChange();

        // Listen for changes
        paymentMethodsContainer.addEventListener('change', function (event) {
            if (event.target.matches('input[name="selected_payment_method"]')) {
                console.log('[Breeze] Payment method changed');
                handlePaymentMethodChange();
            }
        });

        // Watch dynamic changes
        const observer = new MutationObserver(() => {
            console.log('[Breeze] Mutation observed in paymentMethodsContainer');
            handlePaymentMethodChange();
        });

        observer.observe(paymentMethodsContainer, { childList: true, subtree: true });

        console.log('[Breeze] Initialization complete');
    }
})();
