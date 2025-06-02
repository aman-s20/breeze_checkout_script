// breeze_script.js (served via proper server, not raw.githubusercontent.com)

console.log('[Breeze] 🚀 Breeze module script loaded');

function initBreezeCheckout() {
    console.log('[Breeze] Initializing Breeze Checkout script...');

    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Breeze] DOM content loaded');

        const form = document.querySelector('#litecheckout_payments_form');
        const paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');
        const breezePaymentId = window.breezePaymentId;

        console.log('[Breeze] Elements:', { form, paymentMethodsContainer, breezePaymentId });

        if (!form || !paymentMethodsContainer || !breezePaymentId) {
            console.warn('[Breeze] Required elements or data missing.');
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
            let isValid = true;
            form.querySelectorAll('[data-ca-lite-checkout-field]').forEach(field => {
                const value = field.value.trim();
                const fieldName = field.dataset.caLiteCheckoutField.split('.').pop();
                const label = field.labels?.[0]?.innerText || field.name || 'Field';
                const isRequired = field.labels?.[0]?.classList.contains('cm-required');

                if (isRequired && !value) {
                    console.warn(`[Breeze] Required field "${label}" is empty.`);
                    isValid = false;
                    return;
                }

                if (value && validators[fieldName] && !validators[fieldName](value)) {
                    console.warn(`[Breeze] Field "${label}" failed validation.`);
                    isValid = false;
                    return;
                }
            });
            return isValid;
        }

        function handleBreezePayment(event) {
            event.preventDefault();
            event.stopPropagation();

            console.log('[Breeze] Submit intercepted for Breeze payment');

            if (!isFormValid()) {
                console.warn('[Breeze] Form validation failed');
                $.ceNotification('show', {
                    type: 'E',
                    title: 'Error',
                    message: 'Please fill all required fields correctly before placing order.'
                });
                return false;
            }

            console.log('[Breeze] Starting checkout...');
            window.breeze.startCheckout();
        }

        function updatePaymentHandler(target) {
            const isBreezeSelected = target.value === breezePaymentId;
            console.log('[Breeze] Selected payment method:', target.value);

            if (isBreezeSelected) {
                paymentMethodsContainer.onsubmit = handleBreezePayment;
                console.log('[Breeze] Breeze handler attached');
            } else {
                paymentMethodsContainer.onsubmit = null;
                console.log('[Breeze] Breeze handler removed');
            }
        }

        function handlePaymentMethodChange() {
            const selected = document.querySelector('input[name="selected_payment_method"]:checked');
            if (selected) {
                updatePaymentHandler(selected);
            }
        }

        // Initial setup
        handlePaymentMethodChange();

        const observer = new MutationObserver(handlePaymentMethodChange);
        observer.observe(paymentMethodsContainer, {
            childList: true,
            subtree: true
        });

        paymentMethodsContainer.addEventListener('change', event => {
            if (event.target.matches('input[name="selected_payment_method"]')) {
                handlePaymentMethodChange();
            }
        });
    });
}

initBreezeCheckout(); // Call the function at the end
