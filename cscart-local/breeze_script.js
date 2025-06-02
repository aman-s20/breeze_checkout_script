document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#litecheckout_payments_form');
    let paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');
    const requiredFields = form.querySelectorAll('[data-ca-lite-checkout-field]');

    console.log('DOMContentLoaded is triggered .... ');
    let isBreezeSelected = false;

    // Client-side validation rules

    // Client-side validation rules
    const validators = {
        email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        b_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
        s_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
        b_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
        s_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
        phone: value => /^\+?[1-9]\d{1,14}$/.test(value)

    };

    if (!paymentMethodsContainer) {
        console.error('paymentMethods container not found!');
        return;  // Exit if container not found
    }

    // Form validation logic
    function isFormValid() {
        let isValid = true;

        form.querySelectorAll('[data-ca-lite-checkout-field]').forEach(field => {
            const value = field.value.trim();
            const fieldName = field.dataset.caLiteCheckoutField.split('.').pop();
            const label = field.labels?.[0]?.innerText || field.name || 'Field';
            const isRequired = field.labels?.[0]?.classList.contains('cm-required');
            console.log(`Validating field: ${label}, Value: ${value}, filed: ${fieldName} , Required: ${isRequired}`);


            // Required field check
            if (isRequired && !value) {
                console.warn(`Validation failed - Required field "${label}" is empty.`);
                isValid = false;
                return; // Skip further validation if field is empty
            }

            // Custom validator check
            if (value && validators[fieldName] && !validators[fieldName](value)) {
                console.warn(`Validation failed - Field "${label}" failed custom validation: ${fieldName}`);
                isValid = false;
                return;
            }
        });

        return isValid;
    }

    // Handle Breeze payment submission
    function handleBreezePayment(event) {
        console.log('handleBreezePayment triggered');
        event.preventDefault();
        event.stopPropagation();
        if (!isFormValid()) {
            console.log('Form invalid, preventing Breeze checkout.');

            // SHOW an error notification
            $.ceNotification('show', {
                type: 'E', // Error type
                title: 'Error',
                message: 'Please fill all required fields correctly before placing order.'
            });

            return false;
        }

        console.log('Form valid, proceeding to Breeze checkout.');

        window.breeze.startCheckout();
    }

    // Update payment handler when payment method changes
    function updatePaymentHandler(target) {
        const submitButton = document.querySelector('#litecheckout_place_order');
        isBreezeSelected = target.value === breezePaymentId;

        if (isBreezeSelected) {
            console.log('Breeze payment method selected.');
            // Set Breeze payment handler to validate and proceed to Breeze payment
            paymentMethodsContainer.onsubmit = handleBreezePayment;
        } else {
            console.log('Resetting to default behavior.');
            // Reset to default form submission behavior
            paymentMethodsContainer.onsubmit = null;
        }
    }

    // Initial setup to check pre-selected payment method
    const initialPayment = document.querySelector('input[name="selected_payment_method"]:checked');
    if (initialPayment) {
        updatePaymentHandler(initialPayment);
    }
    // Observe the specific element for changes in its text content
    // const paymentMethodElement = document.querySelector('#sw_payment_methods_94 span');
    // Add event listener for payment method changes
    paymentMethodsContainer.addEventListener('change', function (event) {
        console.log('Payment method change detected...');
        if (event.target.matches('input[name="selected_payment_method"]')) {
            handlePaymentMethodChange();
        }
    });

    // Handle initial payment method selection
    handlePaymentMethodChange();

    // Initialize observer
    const observer = new MutationObserver(function (mutations) {
        handlePaymentMethodChange();
    });

    // Start observing
    observer.observe(paymentMethodsContainer, {
        childList: true,
        subtree: true
    });
});
