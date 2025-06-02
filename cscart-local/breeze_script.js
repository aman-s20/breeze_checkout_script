(function () {
    function initBreezeCheckoutScript() {
        console.log('[Breeze] Initializing Breeze Checkout Script');

        const form = document.querySelector('#litecheckout_payments_form');
        const paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');
        const breezePaymentId = window.breezePaymentId;

        console.log('[Breeze] Form:', form);
        console.log('[Breeze] Payment Methods Container:', paymentMethodsContainer);
        console.log('[Breeze] breezePaymentId:', breezePaymentId);

        if (!form || !paymentMethodsContainer || !breezePaymentId) {
            console.warn('[Breeze] Required elements or data missing for Breeze checkout.');
            return;
        }

        const validators = {
            email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            b_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
            s_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
            b_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
            s_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
            phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
        };

        function isFormValid() {
            console.log('[Breeze] Validating form fields');
            let isValid = true;

            form.querySelectorAll('[data-ca-lite-checkout-field]').forEach(field => {
                const value = field.value.trim();
                const fieldName = field.dataset.caLiteCheckoutField.split('.').pop();
                const label = field.labels?.[0]?.innerText || field.name || 'Field';
                const isRequired = field.labels?.[0]?.classList.contains('cm-required');

                console.log(`[Breeze] Checking field "${label}" with value: "${value}"`);

                if (isRequired && !value) {
                    console.warn(`[Breeze] Required field "${label}" is empty.`);
                    isValid = false;
                    return;
                }

                if (value && validators[fieldName] && !validators[fieldName](value)) {
                    console.warn(`[Breeze] Field "${label}" failed custom validation.`);
                    isValid = false;
                    return;
                }
            });

            console.log('[Breeze] Form valid:', isValid);
            return isValid;
        }

        function handleBreezePayment(event) {
            console.log('[Breeze] Breeze payment handler triggered');
            event.preventDefault();
            event.stopPropagation();

            if (!isFormValid()) {
                console.log('[Breeze] Form validation failed');
                $.ceNotification('show', {
                    type: 'E',
                    title: 'Error',
                    message: 'Please fill all required fields correctly before placing order.'
                });
                return false;
            }

            console.log('[Breeze] Starting Breeze checkout');
            window.breeze.startCheckout();
        }

        function updatePaymentHandler(target) {
            const isBreezeSelected = target.value === breezePaymentId;
            console.log('[Breeze] Payment method selected:', target.value);
            console.log('[Breeze] Is Breeze selected:', isBreezeSelected);

            if (isBreezeSelected) {
                console.log('[Breeze] Attaching custom submit handler for Breeze');
                paymentMethodsContainer.onsubmit = handleBreezePayment;
            } else {
                console.log('[Breeze] Removing custom Breeze handler');
                paymentMethodsContainer.onsubmit = null;
            }
        }

        function handlePaymentMethodChange() {
            const selected = document.querySelector('input[name="selected_payment_method"]:checked');
            console.log('[Breeze] Payment method changed. Selected:', selected?.value);
            if (selected) {
                updatePaymentHandler(selected);
            }
        }

        // Initial setup
        console.log('[Breeze] Setting up initial payment handler');
        handlePaymentMethodChange();

        // Observe dynamic changes
        const observer = new MutationObserver(() => {
            console.log('[Breeze] MutationObserver triggered');
            handlePaymentMethodChange();
        });
        observer.observe(paymentMethodsContainer, {
            childList: true,
            subtree: true
        });

        // Direct user interaction
        paymentMethodsContainer.addEventListener('change', function (event) {
            console.log('[Breeze] Change event detected:', event.target);
            if (event.target.matches('input[name="selected_payment_method"]')) {
                handlePaymentMethodChange();
            }
        });

        console.log('[Breeze] Breeze Checkout Script initialized successfully');
    }

    // DOM Ready check
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[Breeze] DOM already ready. Running script immediately.');
        initBreezeCheckoutScript();
    } else {
        console.log('[Breeze] Waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', initBreezeCheckoutScript);
    }
})();
