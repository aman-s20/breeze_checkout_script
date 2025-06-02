(function () {
    // Wait for DOM to fully load
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.querySelector('#litecheckout_payments_form');
        const paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');
        const breezePaymentId = window.breezePaymentId;

        if (!form || !paymentMethodsContainer || !breezePaymentId) {
            console.warn('Required elements or data missing for Breeze checkout.');
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
                    console.warn(`Required field "${label}" is empty.`);
                    isValid = false;
                    return;
                }

                if (value && validators[fieldName] && !validators[fieldName](value)) {
                    console.warn(`Field "${label}" failed custom validation.`);
                    isValid = false;
                    return;
                }
            });

            return isValid;
        }

        function handleBreezePayment(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!isFormValid()) {
                $.ceNotification('show', {
                    type: 'E',
                    title: 'Error',
                    message: 'Please fill all required fields correctly before placing order.'
                });
                return false;
            }

            window.breeze.startCheckout();
        }

        function updatePaymentHandler(target) {
            const isBreezeSelected = target.value === breezePaymentId;

            if (isBreezeSelected) {
                paymentMethodsContainer.onsubmit = handleBreezePayment;
            } else {
                paymentMethodsContainer.onsubmit = null;
            }
        }

        function handlePaymentMethodChange() {
            const selected = document.querySelector('input[name="selected_payment_method"]:checked');
            if (selected) {
                updatePaymentHandler(selected);
            }
        }

        // Initial payment method setup
        handlePaymentMethodChange();

        // Observe payment method changes
        const observer = new MutationObserver(handlePaymentMethodChange);
        observer.observe(paymentMethodsContainer, {
            childList: true,
            subtree: true
        });

        // Also listen for direct changes
        paymentMethodsContainer.addEventListener('change', function (event) {
            if (event.target.matches('input[name="selected_payment_method"]')) {
                handlePaymentMethodChange();
            }
        });
    });
})();
